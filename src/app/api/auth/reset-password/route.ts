import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
