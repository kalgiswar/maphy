require('dotenv').config();
const sequelize = require('../conn');
const { DataTypes } = require('sequelize');

async function run() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.addColumn('settings', 'admin_groups_access_enabled', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    console.log('Successfully added column admin_groups_access_enabled to settings table.');
  } catch (error) {
    // If the column already exists, log it and don't fail
    if (error.message.includes('duplicate column') || error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column admin_groups_access_enabled already exists in settings table.');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

run();
