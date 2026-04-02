import { NextRequest, NextResponse } from 'next/server';
import Transaction, { TransactionStatus } from '@/models/Transaction';
import { verifyToken } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function POST(request: NextRequest) {
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

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId, disputeMessage } = body;

    if (!transactionId || !disputeMessage) {
      return NextResponse.json(
        { error: 'Transaction ID and dispute message are required' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        userId: decoded.userId,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    await transaction.update({
      isDisputed: true,
      disputeMessage,
      status: TransactionStatus.DISPUTED,
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction disputed successfully',
      transaction,
    });
  } catch (error) {
    console.error('Dispute transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
