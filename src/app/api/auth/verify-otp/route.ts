import { NextRequest, NextResponse } from 'next/server';
import OTP from '@/models/OTP';
import { initDatabase } from '@/lib/init-db';
import { Op } from 'sequelize';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const otpRecord = await OTP.findOne({
      where: {
        email,
        otp,
        used: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    await otpRecord.update({ used: true });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
