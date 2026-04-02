import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/init-db';
import { verifyToken, hashPassword, generateAccountNumber, generateRoutingNumber } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, phone, address, city, state, zipCode, country, balance, availableBalance, isAdmin } = body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
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
      balance: parseFloat(balance) || 0,
      availableBalance: parseFloat(availableBalance) || 0,
      isAdmin: !!isAdmin,
      accountNumber: generateAccountNumber(),
      routingNumber: generateRoutingNumber(),
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, balance, availableBalance, firstName, lastName, phone, address, city, state, zipCode, country, isRestricted, restrictionMessage } = body;

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await user.update({
      balance: balance !== undefined ? parseFloat(balance) : user.balance,
      availableBalance: availableBalance !== undefined ? parseFloat(availableBalance) : user.availableBalance,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zipCode: zipCode || user.zipCode,
      country: country || user.country,
      isRestricted: isRestricted !== undefined ? isRestricted : user.isRestricted,
      restrictionMessage: restrictionMessage !== undefined ? restrictionMessage : user.restrictionMessage,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
