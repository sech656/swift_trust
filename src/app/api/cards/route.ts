import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/init-db';
import { verifyToken } from '@/lib/auth';
import Card from '@/models/Card';
import AdminSettings from '@/models/AdminSettings';
import { getAdminSettingsForUser } from '@/lib/settings';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, cardHolderName, proofOfPayment } = body;

    if (!type || !cardHolderName) {
      return NextResponse.json({ error: 'Type and card holder name are required' }, { status: 400 });
    }

    // Check if user already has a card
    const existingCard = await Card.findOne({ where: { userId: decoded.userId } });
    if (existingCard) {
      return NextResponse.json({ error: 'You already have an active card request.' }, { status: 400 });
    }

    // Generate demo card details based on network
    // Visa starts with 4, Mastercard starts with 5
    const prefix = type === 'VISA' ? '4532' : '5214';
    const remaining = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    const cardNumber = `${prefix}${remaining}`;
    const expiryDate = '12/30';
    const cvv = Math.floor(Math.random() * 900 + 100).toString();

    const card = await Card.create({
      userId: decoded.userId,
      type,
      cardHolderName,
      cardNumber,
      expiryDate,
      cvv,
      status: 'PENDING',
      deliveryStatus: 'Payment Pending Review',
      activationFeePaid: false,
      proofOfPayment: proofOfPayment || null,
    });

    return NextResponse.json({
      success: true,
      card,
    });
  } catch (error) {
    console.error('Card registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cards = await Card.findAll({ where: { userId: decoded.userId } });
    
    // Fetch all relevant settings based on user's referrer
    const keys = ['btc_wallet', 'eth_wallet', 'usdt_wallet', 'paypal_email'];
    const settings = await getAdminSettingsForUser(decoded.userId, keys);

    const getVal = (key: string) => settings?.find(s => s.key === key)?.value;

    return NextResponse.json({
      success: true,
      cards,
      paymentMethods: {
        btc: getVal('btc_wallet'),
        eth: getVal('eth_wallet'),
        usdt: getVal('usdt_wallet'),
        paypal: getVal('paypal_email'),
      }
    });
  } catch (error) {
    console.error('Fetch cards error:', error);
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
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('id');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const card = await Card.findOne({ where: { id: cardId, userId: decoded.userId } });
    if (!card) {
      return NextResponse.json({ error: 'Card request not found' }, { status: 404 });
    }

    if (card.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending requests can be cancelled' }, { status: 400 });
    }

    await card.destroy();

    return NextResponse.json({
      success: true,
      message: 'Card request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel card error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
