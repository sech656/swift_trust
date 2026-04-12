import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/database';

interface AdminSettingsAttributes {
  id: number;
  key: string;
  value: string;
  userId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminSettingsCreationAttributes extends Optional<AdminSettingsAttributes, 'id' | 'userId'> {}

class AdminSettings extends Model<AdminSettingsAttributes, AdminSettingsCreationAttributes> implements AdminSettingsAttributes {
  public id!: number;
  public key!: string;
  public value!: string;
  public userId?: number | null;
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
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'admin_settings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['key', 'userId']
      }
    ]
  }
);

export default AdminSettings;
