const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 
const MstCountry = require('./MstCountry');

const MstCountryTrans = sequelize.define('MstCountryTrans', {
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
  country_id: {
    type: DataTypes.UUID,
    references: {
      model: MstCountry,
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
  tableName: 'mst_country_trans',
  freezeTableName: true,
  timestamps: true,
});

module.exports = MstCountryTrans;