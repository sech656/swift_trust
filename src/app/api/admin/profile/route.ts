import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/init-db';
import { verifyToken, hashPassword } from '@/lib/auth';
import User from '@/models/User';

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
    const { firstName, lastName, phone, address, city, state, zipCode, country, currentPassword, newPassword } = body;

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zipCode: zipCode || user.zipCode,
      country: country || user.country,
    };

    // Password change logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }

      updateData.password = await hashPassword(newPassword);
    }

    await user.update(updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
