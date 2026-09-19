require('dotenv').config();
const sequelize = require('./db/conn');

async function fixPermissions() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const correctPermissions = JSON.stringify({
      superuser: '1',
      admin: '1',
      assetsview: '1',
      assetscreate: '1',
      assetsedit: '1',
      assetsdelete: '1',
      assetscheckout: '1',
      assetscheckin: '1',
      assetsaudit: '1',
      assetsviewrequestable: '1',
      accessoriesview: '1',
      accessoriescreate: '1',
      accessoriesedit: '1',
      accessoriesdelete: '1',
      accessoriescheckout: '1',
      accessoriescheckin: '1',
      consumablesview: '1',
      consumablescreate: '1',
      consumablesedit: '1',
      consumablesdelete: '1',
      consumablescheckout: '1',
      componentsview: '1',
      componentscreate: '1',
      componentsedit: '1',
      componentsdelete: '1',
      componentscheckout: '1',
      componentscheckin: '1',
      licensesview: '1',
      licensescreate: '1',
      licensesedit: '1',
      licensesdelete: '1',
      licensescheckout: '1',
      licenseskeys: '1',
      usersview: '1',
      userscreate: '1',
      usersedit: '1',
      usersdelete: '1',
      modelsview: '1',
      modelscreate: '1',
      modelsedit: '1',
      modelsdelete: '1',
      categoriesview: '1',
      categoriescreate: '1',
      categoriesedit: '1',
      categoriesdelete: '1',
      departmentsview: '1',
      departmentscreate: '1',
      departmentsedit: '1',
      departmentsdelete: '1',
      statuslabelsview: '1',
      statuslabelscreate: '1',
      statuslabelsedit: '1',
      statuslabelsdelete: '1',
      customfieldsview: '1',
      customfieldscreate: '1',
      customfieldsedit: '1',
      customfieldsdelete: '1',
      suppliersview: '1',
      supplierscreate: '1',
      suppliersedit: '1',
      suppliersdelete: '1',
      manufacturersview: '1',
      manufacturerscreate: '1',
      manufacturersedit: '1',
      manufacturersdelete: '1',
      depreciationsview: '1',
      depreciationscreate: '1',
      depreciationsedit: '1',
      depreciationsdelete: '1',
      locationsview: '1',
      locationscreate: '1',
      locationsedit: '1',
      locationsdelete: '1',
      companiesview: '1',
      companiescreate: '1',
      companiesedit: '1',
      companiesdelete: '1',
      selftwofactor: '1',
      selfapi: '1',
      selfeditlocation: '1',
      selfcheckoutassets: '1',
      reportview: '1',
      kitsview: '1',
      kitscreate: '1',
      kitsedit: '1',
      kitsdelete: '1',
      kitscheckout: '1',
      ticketsview: '1',
      ticketscreate: '1',
      ticketsedit: '1',
      ticketsdelete: '1'
    });

    // Update permission_groups table
    const [groupResult] = await sequelize.query(
      `UPDATE permission_groups SET permissions = ? WHERE id = 1`,
      { replacements: [correctPermissions] }
    );
    console.log('✅ Updated permission_groups permissions');

    // Update users table
    const [userResult] = await sequelize.query(
      `UPDATE users SET permissions = ? WHERE id = 1`,
      { replacements: [correctPermissions] }
    );
    console.log('✅ Updated user permissions');

    // Verify
    const [groups] = await sequelize.query(`SELECT id, name, LEFT(permissions, 100) as perm_start FROM permission_groups WHERE id = 1`);
    console.log('Group permissions start:', groups[0]?.perm_start);

    console.log('\n🎉 Permissions fixed! Please log out and log back in to see all sidebar tabs.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixPermissions();
