import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
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

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isRestricted, restrictionMessage } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await user.update({
      isRestricted,
      restrictionMessage: isRestricted ? restrictionMessage : null,
    });

    return NextResponse.json({
      success: true,
      message: `User ${isRestricted ? 'restricted' : 'unrestricted'} successfully`,
    });
  } catch (error) {
    console.error('Restrict user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
