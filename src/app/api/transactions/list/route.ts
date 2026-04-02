import { NextRequest, NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
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

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const transactions = await Transaction.findAll({
      where: { userId: decoded.userId },
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('List transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
