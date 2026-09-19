/**
 * rebuild_and_seed.js
 * -------------------
 * Drops ALL existing tables and recreates them from the Sequelize model
 * definitions, then seeds the minimum data required for the app to work:
 *   - firm
 *   - super-admin user  (admin@maphy.com / admin)
 *   - permission group   (Super Admin)
 *   - user-group link
 *   - status labels
 *   - ticket statuses
 *   - severity levels
 *   - skill levels
 *   - talent group
 *   - labels
 *   - settings / branding (if needed by the UI)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./db/conn');
const models = require('./db/models/index');

async function main() {
  try {
    // 1. Authenticate
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // 2. Force-sync: DROP every table then CREATE from model definitions
    console.log('\n🔄 Dropping all tables and recreating from schemas...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables recreated successfully.\n');

    const now = new Date();

    // ---------------------------------------------------------------
    // 3. Seed: Firm
    // ---------------------------------------------------------------
    console.log('Seeding firm...');
    const firm = await models.firm.create({
      id: 1,
      name: 'Maphy Corp',
      user_id: 1,
      activated: true,
      expiration_date: new Date('2030-12-31'),
      created_at: now,
      updated_at: now
    });
    console.log('  ✅ Firm created (id=1)');

    // ---------------------------------------------------------------
    // 4. Seed: Permission Group (Super Admin)
    // ---------------------------------------------------------------
    console.log('Seeding permission group...');
    const superAdminPermissions = JSON.stringify({
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

    const group = await models.group.create({
      id: 1,
      name: 'Super Admin',
      permissions: superAdminPermissions,
      created_at: now,
      updated_at: now,
      firm_id: 1
    });
    console.log('  ✅ Permission group created (id=1)');

    // ---------------------------------------------------------------
    // 5. Seed: Super Admin User
    // ---------------------------------------------------------------
    console.log('Seeding super admin user...');
    const hashedPassword = await bcrypt.hash('Kishore@12345', 10);
    const adminUser = await models.user.create({
      id: 1,
      first_name: 'Super',
      last_name: 'Admin',
      username: 'admin',
      email: 'kishoresanthosh14622@gmail.com',
      password: hashedPassword,
      permissions: superAdminPermissions,
      activated: true,
      firm_id: 1,
      created_at: now,
      updated_at: now
    });
    console.log('  ✅ Super admin user created (kishoresanthosh14622@gmail.com / Kishore@12345)');

    // ---------------------------------------------------------------
    // 6. Seed: User-Group Link
    // ---------------------------------------------------------------
    console.log('Seeding user-group link...');
    await models.userGroups.create({
      user_id: 1,
      group_id: 1
    });
    console.log('  ✅ User linked to Super Admin group');

    // ---------------------------------------------------------------
    // 7. Seed: Company (required for dashboard counts)
    // ---------------------------------------------------------------
    console.log('Seeding company...');
    await models.company.create({
      id: 1,
      name: 'Maphy Corp',
      firm_id: 1,
      created_at: now,
      updated_at: now
    });
    console.log('  ✅ Company created (id=1)');

    // ---------------------------------------------------------------
    // 8. Seed: Status Labels
    // ---------------------------------------------------------------
    console.log('Seeding status labels...');
    const statusLabels = [
      { name: 'Ready to Deploy', deployable: true, pending: false, archived: false, color: '#4CAF50', show_in_nav: true, default_label: true, user_id: 1, firm_id: 1 },
      { name: 'Pending', deployable: false, pending: true, archived: false, color: '#FFC107', show_in_nav: true, default_label: false, user_id: 1, firm_id: 1 },
      { name: 'Archived', deployable: false, pending: false, archived: true, color: '#9E9E9E', show_in_nav: true, default_label: false, user_id: 1, firm_id: 1 },
      { name: 'deployed', deployable: false, pending: false, archived: true, color: '#0288D1', show_in_nav: false, default_label: false, user_id: 1, firm_id: 1 },
      { name: 'Out for Repair', deployable: false, pending: false, archived: false, color: '#FF5722', show_in_nav: true, default_label: false, user_id: 1, firm_id: 1 },
      { name: 'Lost/Stolen', deployable: false, pending: false, archived: false, color: '#F44336', show_in_nav: true, default_label: false, user_id: 1, firm_id: 1 },
      { name: 'Broken - Not Fixable', deployable: false, pending: false, archived: false, color: '#795548', show_in_nav: true, default_label: false, user_id: 1, firm_id: 1 },
    ];
    for (const sl of statusLabels) {
      await models.statusLabel.create({ ...sl, created_at: now, updated_at: now });
    }
    console.log(`  ✅ ${statusLabels.length} status labels created`);

    // ---------------------------------------------------------------
    // 8. Seed: Ticket Statuses
    // ---------------------------------------------------------------
    console.log('Seeding ticket statuses...');
    const ticketStatuses = [
      { id: 99, name: 'Open', type: 'open', user_id: 1 },
      { id: 100, name: 'In Progress', type: 'in_progress', user_id: 1 },
      { id: 101, name: 'Resolved', type: 'resolved', user_id: 1 },
      { id: 102, name: 'Closed', type: 'closed', user_id: 1 },
      { id: 103, name: 'Escalated', type: 'escalated', user_id: 1 },
    ];
    for (const ts of ticketStatuses) {
      await models.ticketStatus.create({ ...ts, created_at: now, updated_at: now });
    }
    console.log(`  ✅ ${ticketStatuses.length} ticket statuses created`);

    // ---------------------------------------------------------------
    // 9. Seed: Severity Levels
    // ---------------------------------------------------------------
    console.log('Seeding severity levels...');
    const severities = [
      { name: 'Low', description: 'Low priority issue with minimal impact' },
      { name: 'Medium', description: 'Medium priority issue with moderate impact' },
      { name: 'High', description: 'High priority issue that needs urgent attention' },
      { name: 'Critical', description: 'Critical issue that requires immediate action' },
    ];
    for (const s of severities) {
      await models.severity.create({ ...s, user_id: 1, created_at: now, updated_at: now });
    }
    console.log(`  ✅ ${severities.length} severity levels created`);

    // ---------------------------------------------------------------
    // 10. Seed: Skill Levels
    // ---------------------------------------------------------------
    console.log('Seeding skill levels...');
    const skillLevels = [
      { name: 'Beginner', description: 'Entry-level skill set' },
      { name: 'Intermediate', description: 'Moderate experience and skill' },
      { name: 'Advanced', description: 'High level of expertise' },
      { name: 'Expert', description: 'Deep domain expertise' },
    ];
    for (const sk of skillLevels) {
      await models.skillLevel.create({ ...sk, user_id: 1, created_at: now, updated_at: now });
    }
    console.log(`  ✅ ${skillLevels.length} skill levels created`);

    // ---------------------------------------------------------------
    // 11. Seed: Talent Group
    // ---------------------------------------------------------------
    console.log('Seeding talent group...');
    await models.talentGroup.create({
      id: 1,
      name: 'IT Support',
      description: 'IT Support Team',
      firm_id: 1,
      created_at: now,
      updated_at: now
    });
    console.log('  ✅ Talent group created');

    // ---------------------------------------------------------------
    // 12. Seed: Labels
    // ---------------------------------------------------------------
    console.log('Seeding labels...');
    await models.labels.create({
      id: 1,
      labels_fontsize: 14,
      labels_width: 270,
      labels_height: 100,
      created_at: now,
      updated_at: now,
      firm_id: 1
    });
    console.log('  ✅ Labels created');

    // ---------------------------------------------------------------
    // 13. Seed: Settings
    // ---------------------------------------------------------------
    console.log('Seeding settings...');
    try {
      await models.setting.create({
        site_name: 'Maphy Asset Management',
        brand: 1,
        per_page: 20,
        qr_code: 1,
        barcode_type: 'QRCODE',
        auto_increment_assets: 1,
        auto_increment_prefix: 'MAPHY',
        alert_email: 'admin@maphy.com',
        default_currency: 'USD',
        locale: 'en',
        date_display_format: 'YYYY-MM-DD',
        time_display_format: 'HH:mm',
        full_multiple_companies_support: true,
        load_remote: false,
        show_alerts_in_menu: true,
        header_color: '#1a237e',
        skin: 'blue',
        show_archived_in_list: false,
        custom_css: '',
        // All NOT NULL boolean/int fields with defaults
        alerts_enabled: true,
        ldap_server_cert_ignore: false,
        labels_per_page: 30,
        labels_width: 2.625,
        labels_height: 1.0,
        labels_pmargin_left: 0.21975,
        labels_pmargin_right: 0.21975,
        labels_pmargin_top: 0.5,
        labels_pmargin_bottom: 0.5,
        labels_display_bgutter: 0.07,
        labels_display_sgutter: 0.05,
        labels_fontsize: 9,
        labels_pagewidth: 8.5,
        labels_pageheight: 11.0,
        labels_display_name: 0,
        labels_display_serial: 1,
        labels_display_tag: 1,
        is_ad: false,
        ldap_port: '389',
        ldap_tls: false,
        zerofill_count: 5,
        ldap_pw_sync: false,
        require_accept_signature: false,
        next_auto_tag_base: '1',
        pwd_secure_uncommon: false,
        pwd_secure_min: 8,
        show_url_in_emails: true,
        labels_display_company_name: false,
        login_remote_user_enabled: false,
        login_common_disabled: false,
        login_remote_user_custom_logout_url: '',
        show_images_in_email: true,
        labels_display_model: false,
        unique_serial: false,
        logo_print_assets: false,
        show_assigned_assets: true,
        login_remote_user_header_name: '',
        ad_append_domain: false,
        saml_enabled: false,
        saml_forcelogin: false,
        saml_slo: false,
        created_at: now,
        updated_at: now,
        firm_id: 1,
        user_id: 1
      });
      console.log('  ✅ Settings created');
    } catch (settingsErr) {
      console.log('  ⚠️  Settings seed skipped (may need manual setup):', settingsErr.message);
    }

    // ---------------------------------------------------------------
    // 14. Seed: Branding
    // ---------------------------------------------------------------
    console.log('Seeding branding...');
    try {
      await models.branding.create({
        brandtype: 'logo',
        site_name: 'Maphy Asset Management',
        image: 'default_logo.png',
        created_by: 1,
        updated_by: 1,
        firm_id: 1,
        created_at: now,
        updated_at: now
      });
      console.log('  ✅ Branding created');
    } catch (brandingErr) {
      console.log('  ⚠️  Branding seed skipped:', brandingErr.message);
    }

    // ---------------------------------------------------------------
    // 15. Seed: Work Status
    // ---------------------------------------------------------------
    console.log('Seeding work statuses...');
    try {
      await models.workstatus.create({
        user_id: 1,
        details: 'Active',
        created_at: now
      });
      console.log('  ✅ Work status created');
    } catch (wsErr) {
      console.log('  ⚠️  Work status seed skipped:', wsErr.message);
    }

    // ---------------------------------------------------------------
    console.log('\n🎉 ===== DATABASE REBUILD COMPLETE =====');
    console.log('');
    console.log('  Login Credentials:');
    console.log('    Email:    kishoresanthosh14622@gmail.com');
    console.log('    Password: Kishore@12345');
    console.log('');
    console.log('  All tables have been recreated from Sequelize schemas.');
    console.log('  The database is now aligned with the code.');
    console.log('');

  } catch (err) {
    console.error('\n❌ Error rebuilding database:', err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

main();
