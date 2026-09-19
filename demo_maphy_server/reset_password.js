require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./db/conn');

async function resetPassword() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const newPassword = 'Kalgis@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await sequelize.query(
      `UPDATE users SET password = ? WHERE email = 'kalgiswar@gmail.com'`,
      { replacements: [hashedPassword] }
    );

    console.log('✅ Password successfully updated for kalgiswar@gmail.com');
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await sequelize.close();
  }
}

resetPassword();
