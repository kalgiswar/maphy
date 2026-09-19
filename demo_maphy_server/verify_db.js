require('dotenv').config();
const sequelize = require('./db/conn');

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Fetch the asset and its model joins
    const [manufacturers] = await sequelize.query(`SELECT id, name FROM manufacturers`);
    console.log('Manufacturers:', manufacturers);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

inspect();
