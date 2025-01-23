const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 
const MstCity = require('./MstCity');

const MstCityTrans = sequelize.define('MstCityTrans', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cityId: { 
      type: DataTypes.UUID, 
      field: "city_id", 
      references: { 
        model: MstCity, 
        key: 'id', 
      }, 
      allowNull: false, 
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Math.floor(Date.now() / 1000),
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE, 
      allowNull: true,
    },
  }, {
    tableName: 'mst_city_trans', 
    freezeTableName: true,
    timestamps: true,
  });

module.exports = MstCityTrans; 