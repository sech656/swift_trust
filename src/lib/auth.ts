import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'swift_trust_bank_secret_key_2024';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number, isAdmin: boolean = false, isSuperAdmin: boolean = false): string {
  return jwt.sign({ userId, isAdmin, isSuperAdmin }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number; isAdmin: boolean; isSuperAdmin: boolean } | null {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId || decoded.id,
      isAdmin: decoded.isAdmin || false,
      isSuperAdmin: decoded.isSuperAdmin || false
    };
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export function generateRoutingNumber(): string {
  return '021000021';
}

export function generateTransactionId(): string {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 10000);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
