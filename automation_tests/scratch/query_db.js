require('dotenv').config({ path: 'c:/Office Folder/Projects/Maphy/Maphy/demo_maphy_server/.env' });
const models = require('c:/Office Folder/Projects/Maphy/Maphy/demo_maphy_server/db/models/index');

async function run() {
  try {
    console.log('User associations:');
    for (const assocName in models.user.associations) {
      const assoc = models.user.associations[assocName];
      console.log(`- ${assocName}: ${assoc.associationType} to ${assoc.target.name}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
