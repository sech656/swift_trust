import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/database';

interface CardAttributes {
  id: number;
  userId: number;
  type: 'VISA' | 'MASTERCARD';
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  status: 'PENDING' | 'ACTIVE' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  deliveryStatus: string;
  trackingNumber?: string;
  deliveryMessage?: string;
  activationFeePaid: boolean;
  proofOfPayment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CardCreationAttributes extends Optional<CardAttributes, 'id' | 'status' | 'activationFeePaid' | 'deliveryStatus' | 'proofOfPayment'> {}

class Card extends Model<CardAttributes, CardCreationAttributes> implements CardAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'VISA' | 'MASTERCARD';
  public cardHolderName!: string;
  public cardNumber!: string;
  public expiryDate!: string;
  public cvv!: string;
  public status!: 'PENDING' | 'ACTIVE' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  public deliveryStatus!: string;
  public trackingNumber?: string;
  public deliveryMessage?: string;
  public activationFeePaid!: boolean;
  public proofOfPayment?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Card.init(
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
      type: DataTypes.ENUM('VISA', 'MASTERCARD'),
      allowNull: false,
    },
    cardHolderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cvv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
      defaultValue: 'PENDING',
    },
    deliveryStatus: {
      type: DataTypes.STRING,
      defaultValue: 'Processing Request',
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activationFeePaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    proofOfPayment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'cards',
    timestamps: true,
  }
);

export default Card;
