import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/init-db';
import { verifyToken, hashPassword, generateAccountNumber, generateRoutingNumber, generateReferralCode } from '@/lib/auth';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Card from '@/models/Card';
import OTP from '@/models/OTP';

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
    const { email, password, firstName, lastName, phone, address, city, state, zipCode, country, balance, availableBalance, isAdmin, isSuperAdmin } = body;

    // Only Super Admins can create other Admins
    if ((isAdmin || isSuperAdmin) && !decoded.isSuperAdmin) {
      return NextResponse.json({ error: 'Only Super Admins can create other Admins' }, { status: 403 });
    }

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
      isAdmin: !!isAdmin || !!isSuperAdmin,
      isSuperAdmin: !!isSuperAdmin,
      allowCustomSettings: !!isAdmin || !!isSuperAdmin,
      referralCode: (!!isAdmin || !!isSuperAdmin) ? generateReferralCode() : undefined,
      referredById: (!isAdmin && !isSuperAdmin) ? decoded.userId : undefined,
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
    const { userId, balance, availableBalance, firstName, lastName, phone, address, city, state, zipCode, country, isRestricted, restrictionMessage, isAdmin, isSuperAdmin, allowCustomSettings } = body;

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current admin is allowed to update this user
    if (!decoded.isSuperAdmin && user.referredById !== decoded.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Role updates are only allowed for Super Admins
    const updateData: any = {
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
    };

    if (decoded.isSuperAdmin) {
      if (isAdmin !== undefined) updateData.isAdmin = !!isAdmin;
      if (isSuperAdmin !== undefined) updateData.isSuperAdmin = !!isSuperAdmin;
      if (allowCustomSettings !== undefined) updateData.allowCustomSettings = !!allowCustomSettings;
      
      // If we promote to admin, generate a referral code if they don't have one
      if (updateData.isAdmin && !user.referralCode) {
        const { generateReferralCode } = await import('@/lib/auth');
        updateData.referralCode = generateReferralCode();
      }
    }

    await user.update(updateData);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current admin is allowed to delete this user
    if (!decoded.isSuperAdmin && user.referredById !== decoded.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Don't allow deleting the admin user (optional, but safer)
    if (user.isAdmin && user.email === 'admin@swifttrust.com') {
      return NextResponse.json({ error: 'Cannot delete the primary admin user' }, { status: 403 });
    }

    // Don't allow regular admins to delete other admins
    if (user.isAdmin && !decoded.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete associated records first
    await Transaction.destroy({ where: { userId } });
    await Card.destroy({ where: { userId } });
    await OTP.destroy({ where: { email: user.email } });

    // Finally delete the user
    await user.destroy();

    return NextResponse.json({ success: true, message: 'User and all associated records deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
