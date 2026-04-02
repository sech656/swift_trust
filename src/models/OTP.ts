import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/database';

interface OTPAttributes {
  id: number;
  email: string;
  otp: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OTPCreationAttributes extends Optional<OTPAttributes, 'id' | 'used'> {}

class OTP extends Model<OTPAttributes, OTPCreationAttributes> implements OTPAttributes {
  public id!: number;
  public email!: string;
  public otp!: string;
  public expiresAt!: Date;
  public used!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OTP.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'otps',
    timestamps: true,
  }
);

export default OTP;
