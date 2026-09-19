require('dotenv').config();
const sequelize = require('./db/conn');

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const [users] = await sequelize.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.activated, u.firm_id, u.deleted_at
      FROM users u
    `);
    console.log('--- USERS ---');
    console.log(JSON.stringify(users, null, 2));

    const [firms] = await sequelize.query(`
      SELECT id, name, activated, user_id FROM firm
    `);
    console.log('--- FIRMS ---');
    console.log(JSON.stringify(firms, null, 2));

    const [userGroups] = await sequelize.query(`
      SELECT ug.user_id, ug.group_id, ug.firm_id, pg.name as group_name, pg.permissions
      FROM users_groups ug
      LEFT JOIN permission_groups pg ON ug.group_id = pg.id
    `);
    console.log('--- USER GROUPS ---');
    console.log(JSON.stringify(userGroups, null, 2));

    const [groups] = await sequelize.query(`
      SELECT id, name, permissions, firm_id FROM permission_groups
    `);
    console.log('--- PERMISSION GROUPS ---');
    console.log(JSON.stringify(groups, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

inspect();
