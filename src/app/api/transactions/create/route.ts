import { NextRequest, NextResponse } from 'next/server';
import Transaction, { TransactionType, TransactionStatus } from '@/models/Transaction';
import User from '@/models/User';
import AdminSettings from '@/models/AdminSettings';
import { verifyToken, generateTransactionId } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    console.log('Auth Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    console.log('Decoded Token:', decoded);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token', details: 'Token verification failed' },
        { status: 401 }
      );
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isRestricted) {
      return NextResponse.json(
        { error: 'Account restricted', message: user.restrictionMessage },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      type,
      amount,
      recipientEmail,
      recipientPhone,
      recipientName,
      externalBankName,
      memo,
      frontImage,
      backImage,
    } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Type and amount are required' },
        { status: 400 }
      );
    }

    // Special handling for check deposits to always stay pending
    if (type === TransactionType.CHECK_DEPOSIT) {
      const transactionId = generateTransactionId();
      const transaction = await Transaction.create({
        userId: user.id,
        type,
        status: TransactionStatus.PENDING,
        amount,
        memo: memo || 'Mobile Check Deposit',
        transactionId,
        frontImage,
        backImage,
      });

      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount,
          memo: transaction.memo,
          createdAt: transaction.createdAt,
        },
      });
    }

    const transferErrorSetting = await AdminSettings.findOne({
      where: { key: 'transfer_error_message' },
    });

    if (transferErrorSetting && transferErrorSetting.value) {
      const transactionId = generateTransactionId();
      const transaction = await Transaction.create({
        userId: user.id,
        type,
        status: TransactionStatus.FAILED,
        amount,
        recipientEmail,
        recipientPhone,
        recipientName,
        externalBankName,
        memo,
        transactionId,
        errorMessage: transferErrorSetting.value,
      });

      return NextResponse.json({
        success: false,
        error: transferErrorSetting.value,
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount,
          errorMessage: transaction.errorMessage,
          createdAt: transaction.createdAt,
        },
      });
    }

    const transactionId = generateTransactionId();
    const transaction = await Transaction.create({
      userId: user.id,
      type,
      status: TransactionStatus.PENDING,
      amount,
      recipientEmail,
      recipientPhone,
      recipientName,
      externalBankName,
      memo,
      transactionId,
    });

    setTimeout(async () => {
      await transaction.update({ status: TransactionStatus.COMPLETED });
    }, 5000);

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        recipientEmail: transaction.recipientEmail,
        recipientPhone: transaction.recipientPhone,
        recipientName: transaction.recipientName,
        externalBankName: transaction.externalBankName,
        memo: transaction.memo,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
