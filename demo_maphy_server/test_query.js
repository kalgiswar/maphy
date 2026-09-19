require('dotenv').config();
const sequelize = require('./db/conn');
const models = require('./db/models/index');
const user = models.user;
const location = models.location;
const department = models.department;
const company = models.company;
const userGroups = models.userGroups;
const group = models.group;
const talentGroup = models.talentGroup;

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

user.belongsTo(location, { foreignKey: 'location_id' });
user.belongsTo(talentGroup, { foreignKey: 'talent_group_id' });
user.belongsTo(department, { foreignKey: 'department_id' });
user.belongsTo(company, { foreignKey: 'company_id' });
user.hasMany(userGroups, { foreignKey: 'user_id' });
userGroups.belongsTo(group, { foreignKey: 'group_id' });

async function run() {
  try {
    const isSuperuser = false;
    const firmId = 6;

    let where = [{
      email: {
        [Op.like]: '%%'
      },
      deleted_at: { [Op.eq]: null }
    }, { firm_id: firmId }];

    if (!isSuperuser) {
      where.push(Sequelize.literal(`NOT EXISTS (
        SELECT 1 FROM users_groups ug 
        JOIN permission_groups pg ON ug.group_id = pg.id 
        WHERE ug.user_id = user.id 
        AND (
          JSON_EXTRACT(pg.permissions, '$.superuser') = '1' 
          OR pg.permissions LIKE '%"superuser":"1"%'
        )
      )`));
    }

    let result = await user.findAndCountAll({
      attributes: [
        'id', 'location_id', 'first_name', 'avatar', 'last_name', 'username', 'permissions', 'employee_num', 'jobtitle', 'phone', 'website', 'address', 'city', 'state', 'country', 'zip', 'email', 'notes', 'activated', 'two_factor_enrolled', 'last_login', 'deleted_at', 'created_at', 'updated_at', 'talent_group_id', 'user_type'
      ],
      where: where,
      include: [
        { model: location, attributes: ['id', 'name'] },
        { model: department, attributes: ['id', 'name'] },
        { model: company, attributes: ['id', 'name'] },
        { model: talentGroup, attributes: ['id', 'name'] },
        { model: userGroups, attributes: ['user_id', 'group_id'], include: [{ model: group, attributes: ['id', 'name'] }] }
      ]
    });

    console.log('Result count:', result.count);
    console.log('Result rows:', JSON.stringify(result.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

run();
