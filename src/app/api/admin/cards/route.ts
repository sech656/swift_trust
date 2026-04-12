import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/init-db';
import { verifyToken } from '@/lib/auth';
import Card from '@/models/Card';
import User from '@/models/User';

export async function GET(request: NextRequest) {
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

    const queryOptions: any = {
      order: [['createdAt', 'DESC']],
      include: []
    };

    if (!decoded.isSuperAdmin) {
      queryOptions.include.push({
        model: User,
        where: { referredById: decoded.userId },
        required: true,
        attributes: []
      });
    }

    const cards = await Card.findAll(queryOptions);
    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error('Fetch cards error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const { cardId, status, deliveryStatus, trackingNumber, deliveryMessage, activationFeePaid } = body;

    const card = await Card.findByPk(cardId);
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    await card.update({
      status: status || card.status,
      deliveryStatus: deliveryStatus || card.deliveryStatus,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : card.trackingNumber,
      deliveryMessage: deliveryMessage !== undefined ? deliveryMessage : card.deliveryMessage,
      activationFeePaid: activationFeePaid !== undefined ? activationFeePaid : card.activationFeePaid,
    });

    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
