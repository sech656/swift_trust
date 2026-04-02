import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { verifyToken, hashPassword } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function PUT(request: NextRequest) {
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

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, email, address, city, state, zipCode, country, currentPassword, newPassword } = body;

    if (newPassword && currentPassword) {
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      const hashedPassword = await hashPassword(newPassword);
      await user.update({ password: hashedPassword });
    }

    const updates: any = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;
    if (email && user.email !== email) updates.email = email; // Keep email check just in case, though UI makes it readonly
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (state) updates.state = state;
    if (zipCode) updates.zipCode = zipCode;
    if (country) updates.country = country;

    if (Object.keys(updates).length > 0) {
      await user.update(updates);
    }

    return NextResponse.json({
      success: true,
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
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
