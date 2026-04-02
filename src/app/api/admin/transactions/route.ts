import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const transactions = await Transaction.findAll({
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { transactionId, status, errorMessage, memo } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const oldStatus = transaction.status;
    const newStatus = status || oldStatus;

    await transaction.update({
      status: newStatus,
      errorMessage: errorMessage !== undefined ? errorMessage : transaction.errorMessage,
      memo: memo || transaction.memo
    });

    // If a check deposit is marked as completed, update BOTH user balances
    if (transaction.type === 'check_deposit' && oldStatus !== 'completed' && newStatus === 'completed') {
      const user = await User.findByPk(transaction.userId);
      if (user) {
        const amount = parseFloat(transaction.amount.toString());
        const currentAvailable = parseFloat(user.availableBalance.toString());
        const currentMain = parseFloat(user.balance.toString());
        await user.update({
          availableBalance: currentAvailable + amount,
          balance: currentMain + amount
        });
      }
    }

    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
