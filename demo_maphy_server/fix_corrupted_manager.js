require('dotenv').config();
const sequelize = require('./db/conn');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Move manager (user 21) to firm 6 (Kishore's firm)
    const [userUpdate] = await sequelize.query(`
      UPDATE users 
      SET firm_id = 6 
      WHERE id = 21 AND email = 'cyandumbo1822@gmail.com'
    `);
    console.log('Updated user:', userUpdate);

    // 2. Move manager's group mapping to group 23 (Branch Manager under firm 6) and firm 6
    const [groupUpdate] = await sequelize.query(`
      UPDATE users_groups 
      SET group_id = 23, firm_id = 6 
      WHERE user_id = 21
    `);
    console.log('Updated user_groups mapping:', groupUpdate);

    console.log('Database fix complete.');

  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await sequelize.close();
  }
}

fix();
