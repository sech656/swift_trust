import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/database';

interface AdminSettingsAttributes {
  id: number;
  key: string;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminSettingsCreationAttributes extends Optional<AdminSettingsAttributes, 'id'> {}

class AdminSettings extends Model<AdminSettingsAttributes, AdminSettingsCreationAttributes> implements AdminSettingsAttributes {
  public id!: number;
  public key!: string;
  public value!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AdminSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'admin_settings',
    timestamps: true,
  }
);

export default AdminSettings;
