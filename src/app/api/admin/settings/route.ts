import { NextRequest, NextResponse } from 'next/server';
import AdminSettings from '@/models/AdminSettings';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Always fetch global settings (userId is null)
    const globalSettings = await AdminSettings.findAll({ where: { userId: null } });
    
    if (decoded.isSuperAdmin) {
      return NextResponse.json({ success: true, settings: globalSettings });
    }

    // For regular admins, check if they have custom settings allowed
    const admin = await User.findByPk(decoded.userId);
    if (!admin || !admin.allowCustomSettings) {
      return NextResponse.json({ success: true, settings: globalSettings, allowCustomSettings: false });
    }

    // Fetch custom settings for this admin
    const customSettings = await AdminSettings.findAll({ where: { userId: decoded.userId } });
    
    // Merge: custom settings override global ones
    const settingsMap = new Map();
    globalSettings.forEach(s => settingsMap.set(s.key, s.value));
    customSettings.forEach(s => settingsMap.set(s.key, s.value));

    const mergedSettings = Array.from(settingsMap.entries()).map(([key, value]) => ({ key, value }));

    return NextResponse.json({ 
      success: true, 
      settings: mergedSettings, 
      allowCustomSettings: true 
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = await User.findByPk(decoded.userId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (!decoded.isSuperAdmin && !admin.allowCustomSettings) {
      return NextResponse.json({ error: 'Permission denied to customize settings' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Super Admin saves to global settings (userId: null)
    // Regular Admin saves to their own settings (userId: decoded.userId)
    const targetUserId = decoded.isSuperAdmin ? null : decoded.userId;

    // Use findOne + update/create instead of upsert due to composite unique index behavior
    let setting = await AdminSettings.findOne({ where: { key, userId: targetUserId } });
    
    if (setting) {
      await setting.update({ value: value || '' });
    } else {
      setting = await AdminSettings.create({ key, value: value || '', userId: targetUserId });
    }

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
