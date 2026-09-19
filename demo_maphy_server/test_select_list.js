require('dotenv').config();
const sequelize = require('./db/conn');
const models = require('./db/models/index');
const group = models.group;

async function run() {
  try {
    // Simulate req.userInfo when switched to Org 6
    const userInfo = {
      userId: 1, // Super Admin user ID
      firmId: 6,  // Switched to Org 6
      isSuperuser: false,
      _originalSuperuser: true
    };

    const isSuperuser = userInfo && (userInfo.isSuperuser || userInfo._originalSuperuser);
    const isAdmin = userInfo && userInfo.isAdmin;

    console.log("isSuperuser:", isSuperuser);
    console.log("isAdmin:", isAdmin);

    const allGroups = await group.findAll({
      attributes: ['id', 'name', 'permissions'],
      where: { firm_id: userInfo.firmId },
      order: [['name', 'ASC']]
    });

    console.log("All Groups in DB for firm 6:", allGroups.map(g => ({ id: g.id, name: g.name })));

    const filtered = allGroups.filter(g => {
      let perms = {};
      try { perms = typeof g.permissions === 'string' ? JSON.parse(g.permissions) : (g.permissions || {}); } catch(e) {}

      const groupIsSuperuser = perms.superuser === '1' || perms.superuser === 1 || perms.superuser === true || (g.name && g.name.toLowerCase() === 'super admin');
      const groupIsAdmin = perms.admin === true || perms.admin === 1 || perms.admin === '1' || perms.admin === 'true';

      if (isSuperuser) {
        return true;
      }
      if (isAdmin) {
        return !groupIsSuperuser;
      }
      return !groupIsSuperuser && !groupIsAdmin;
    });

    const items = filtered.map(g => ({ id: g.id, text: g.name }));
    console.log("API Returned Items:", items);

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

run();
