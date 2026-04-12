import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { hashPassword, generateToken, generateAccountNumber, generateRoutingNumber } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { email, password, firstName, lastName, phone, address, city, state, zipCode, country, referralCode } = body;

    if (!email || !password || !firstName || !lastName || !phone || !address || !city || !state || !zipCode || !country || !referralCode) {
      return NextResponse.json(
        { error: 'All fields are required, including referral code' },
        { status: 400 }
      );
    }

    // Validate referral code
    const admin = await User.findOne({ where: { referralCode, isAdmin: true } });
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const accountNumber = generateAccountNumber();
    const routingNumber = generateRoutingNumber();

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      accountNumber,
      routingNumber,
      balance: 0,
      isAdmin: false,
      isSuperAdmin: false,
      referredById: admin.id,
      isRestricted: false,
    });

    const token = generateToken(user.id, user.isAdmin, user.isSuperAdmin);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
        accountNumber: user.accountNumber,
        routingNumber: user.routingNumber,
        balance: user.balance,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
