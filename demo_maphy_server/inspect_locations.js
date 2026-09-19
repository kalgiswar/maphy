require('dotenv').config();
const sequelize = require('./db/conn');
const models = require('./db/models/index');

async function run() {
  try {
    const locations = await models.location.findAll({
      attributes: ['id', 'name', 'firm_id', 'deleted_at']
    });
    console.log('--- LOCATIONS ---');
    console.log(JSON.stringify(locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      firm_id: loc.firm_id,
      deleted_at: loc.deleted_at
    })), null, 2));

    const firms = await models.firm.findAll({
      attributes: ['id', 'name']
    });
    console.log('--- ORGANIZATIONS/FIRMS ---');
    console.log(JSON.stringify(firms.map(f => ({
      id: f.id,
      name: f.name
    })), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

run();
