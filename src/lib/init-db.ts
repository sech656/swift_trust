import sequelize from './database';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import OTP from '@/models/OTP';
import AdminSettings from '@/models/AdminSettings';
import Card from '@/models/Card';
import { hashPassword, generateAccountNumber, generateRoutingNumber, generateReferralCode } from './auth';

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
      console.warn('Sync failed, falling back to manual column addition:', syncError.message);
      try {
        // Fallback: manually add userId column to admin_settings if it doesn't exist
        await sequelize.query('ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS "userId" INTEGER;');
      } catch (colError) {
        console.error('Manual column addition failed:', colError);
      }
      await sequelize.sync();
    }

    // Define associations if not already defined
    if (!User.associations.transactions) {
      User.hasMany(Transaction, { foreignKey: 'userId' });
      Transaction.belongsTo(User, { foreignKey: 'userId' });
    }

    if (!User.associations.cards) {
      User.hasMany(Card, { foreignKey: 'userId' });
      Card.belongsTo(User, { foreignKey: 'userId' });
    }

    if (!User.associations.referredUsers) {
      User.hasMany(User, { as: 'referredUsers', foreignKey: 'referredById' });
      User.belongsTo(User, { as: 'referredBy', foreignKey: 'referredById' });
    }

    // Seed or update default admin
    const adminEmail = 'admin@swifttrust.com';
    const superAdminEmail = 'super.admin@st.com';

    // Ensure super admin exists
    const existingSuperAdmin = await User.findOne({ where: { email: superAdminEmail } });
    if (!existingSuperAdmin) {
      console.log('Seeding new super admin...');
      const hashedPassword = await hashPassword('Work12345$');
      await User.create({
        email: superAdminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '1112223333',
        address: 'ST Headquarters',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        balance: 9999999,
        isAdmin: true,
        isSuperAdmin: true,
        allowCustomSettings: true,
        referralCode: 'SUPERADMIN',
        isRestricted: false,
        accountNumber: generateAccountNumber(),
        routingNumber: generateRoutingNumber(),
      });
      console.log('New super admin created: super.admin@st.com / Work12345$');
    } else {
      await existingSuperAdmin.update({
        isAdmin: true,
        isSuperAdmin: true,
        allowCustomSettings: true,
      });
    }

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    const adminData = {
      email: adminEmail,
      firstName: 'Swift',
      lastName: 'Admin',
      phone: '1234567890',
      address: '527 Madison Ave #4',
      city: 'New York',
      state: 'NY',
      zipCode: '10022',
      country: 'United States',
      balance: 1000000,
      isAdmin: true,
      isSuperAdmin: false,
      allowCustomSettings: true,
      referralCode: 'SWIFT001',
      isRestricted: false,
    };

    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      const hashedPassword = await hashPassword('Admin@123');
      await User.create({
        ...adminData,
        password: hashedPassword,
        accountNumber: generateAccountNumber(),
        routingNumber: generateRoutingNumber(),
      });
      console.log('Default admin user created: admin@swifttrust.com / Admin@123');
    } else {
      // Ensure existing admin has admin rights and referral code, but remove super admin
      await existingAdmin.update({
        isAdmin: true,
        isSuperAdmin: false,
        allowCustomSettings: true,
        referralCode: existingAdmin.referralCode || 'SWIFT001',
      });
      console.log('Default admin user updated (Super Admin rights removed).');
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
