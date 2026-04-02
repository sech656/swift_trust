import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { generateOTP } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email,
      otp,
      expiresAt,
      used: false,
    });

    console.log(`OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      otp,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
