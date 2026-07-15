const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define(
  'Contact',
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    servico_interesse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_send: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    schema: 'nortech',
    tableName: 'contacts',
  }
);

module.exports = Contact;
