import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";

export class Otp extends Model {}

Otp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // phone or email identifier
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Phone number or email",
    },

    otp_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Hashed OTP value",
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Failed verification attempts",
    },

    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Marks OTP as consumed",
    },
  },
  {
    sequelize,
    modelName: "Otp",
    tableName: "otp_tbl",
    timestamps: true,
  }
);
