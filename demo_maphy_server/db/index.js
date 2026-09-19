const { Sequelize } = require('sequelize');
//const { applyExtraSetup } = require('./extra-setup');
const {sequelize} = require('./conn')
// In a real app, you should keep the database connection URL as an environment variable.
// But for this example, we will just use a local SQLite database.

const modelDefiners = [
  require('./models/emp'),
  require('./models/companies'),
  require('./models/manufacturers'),
  require('./models/departments'),
  require('./models/categories'),
  require('./models/locations')

  
];

// We define all models accordihhng to their files.
for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

// We execute any extra setup after the models are defined, such as adding associations.
//applyExtraSetup(sequelize);

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;