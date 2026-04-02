import sequelize from './database';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import OTP from '@/models/OTP';
import AdminSettings from '@/models/AdminSettings';
import Card from '@/models/Card';
import { hashPassword, generateAccountNumber, generateRoutingNumber } from './auth';

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return true;
  
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Synchronization logic
    const isProd = process.env.NODE_ENV === 'production';
    
    try {
      if (isProd) {
        // In production, try to sync missing tables/columns without dropping data
        await sequelize.sync({ alter: true });
        console.log('Production: Database schema synchronized.');
      } else {
        // In development, allow schema alterations and handle users_backup issues
        await sequelize.query('DROP TABLE IF EXISTS users_backup;');
        await sequelize.sync({ alter: true });
        console.log('Development: Database models synchronized.');
      }
    } catch (syncError: any) {
      console.warn('Sync failed, falling back to standard sync:', syncError.message);
      await sequelize.sync();
    }

    // Seed default admin if not exists
    const adminEmail = 'admin@swifttrust.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      const hashedPassword = await hashPassword('Admin@123');
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Swift',
        lastName: 'Admin',
        phone: '1234567890',
        address: '527 Madison Ave #4',
        city: 'New York',
        state: 'NY',
        zipCode: '10022',
        country: 'United States',
        accountNumber: generateAccountNumber(),
        routingNumber: generateRoutingNumber(),
        balance: 1000000, // Rich admin
        isAdmin: true,
        isRestricted: false,
      });
      console.log('Default admin user created: admin@swifttrust.com / Admin@123');
    }

    // Seed default payment settings
    const defaultSettings = [
      { key: 'btc_wallet', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      { key: 'eth_wallet', value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
      { key: 'usdt_wallet', value: 'TXY2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      { key: 'paypal_email', value: 'payments@swifttrust.com' },
      { key: 'card_activation_fee', value: '200' },
      { key: 'transfer_error_message', value: 'Maintenance in progress. International transfers are temporarily disabled.' }
    ];

    for (const setting of defaultSettings) {
      const exists = await AdminSettings.findOne({ where: { key: setting.key } });
      if (!exists) {
        await AdminSettings.create(setting);
      }
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}
