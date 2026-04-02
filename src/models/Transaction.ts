import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/database';

export enum TransactionType {
  TRANSFER = 'transfer',
  CHECK_DEPOSIT = 'check_deposit',
  EXTERNAL_TRANSFER = 'external_transfer',
  CRYPTO = 'crypto',
  DIRECT_DEPOSIT = 'direct_deposit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DISPUTED = 'disputed',
}

interface TransactionAttributes {
  id: number;
  userId: number;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  externalBankName?: string;
  memo?: string;
  transactionId: string;
  errorMessage?: string;
  frontImage?: string;
  backImage?: string;
  isDisputed: boolean;
  disputeMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'status' | 'isDisputed' | 'frontImage' | 'backImage'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public userId!: number;
  public type!: TransactionType;
  public status!: TransactionStatus;
  public amount!: number;
  public recipientEmail?: string;
  public recipientPhone?: string;
  public recipientName?: string;
  public externalBankName?: string;
  public memo?: string;
  public transactionId!: string;
  public errorMessage?: string;
  public frontImage?: string;
  public backImage?: string;
  public isDisputed!: boolean;
  public disputeMessage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: TransactionStatus.PENDING,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recipientPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    externalBankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frontImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    backImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDisputed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    disputeMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
  }
);

export default Transaction;
