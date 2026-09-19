require('dotenv').config();
const sequelize = require('./db/conn');

async function getSuperAdmins() {
  try {
    await sequelize.authenticate();
    const [users] = await sequelize.query(`
      SELECT id, first_name, last_name, username, email, password, activated, firm_id, permissions
      FROM users
    `);
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

getSuperAdmins();
