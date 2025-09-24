import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";

export class Student extends Model {}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    useremail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    additional_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Student",
    tableName: "students_tbl",
    timestamps: true,
  }
);
