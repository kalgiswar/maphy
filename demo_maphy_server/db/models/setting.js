module.exports = (sequelize, Datatypes) => {
    const setting = sequelize.define('setting', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        created_at: {
            type: Datatypes.DATE
        },
        updated_at: {
            type: Datatypes.DATE 
        },
        user_id: {
            type: Datatypes.INTEGER 
        },
        per_page: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        site_name: {
            type: Datatypes.STRING(100),
            allowNull: false
        },
        qr_code: {
            type: Datatypes.INTEGER
        },
        qr_text: {
            type: Datatypes.STRING(32) 
        },
        display_asset_name: {
            type: Datatypes.INTEGER
        },
        display_checkout_date: {
            type: Datatypes.INTEGER
        },
        display_eol: {
            type: Datatypes.INTEGER 
        },
        auto_increment_assets: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        auto_increment_prefix: {
            type: Datatypes.STRING(191) 
        },
        load_remote: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        logo: {
            type: Datatypes.STRING(191) 
        },
        header_color: {
            type: Datatypes.STRING(191) 
        },
        alert_email: {
            type: Datatypes.STRING(191) 
        },
        alerts_enabled: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        default_eula_text: {
            type: Datatypes.TEXT
        },
        barcode_type: {
            type: Datatypes.STRING(191) 
        },
        slack_endpoint: {
            type: Datatypes.STRING(191) 
        },
        slack_channel: {
            type: Datatypes.STRING(191) 
        },
        slack_botname: {
            type: Datatypes.STRING(191) 
        },
        default_currency: {
            type: Datatypes.STRING(10) 
        },
        custom_css: {
            type: Datatypes.TEXT
        },
        brand: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        ldap_enabled: {
            type: Datatypes.STRING(191) 
        },
        ldap_server: {
            type: Datatypes.STRING(191) 
        },
        ldap_uname: {
            type: Datatypes.STRING(191) 
        },
        ldap_pword: {
            type: Datatypes.STRING(191) 
        },
        ldap_basedn: {
            type: Datatypes.STRING(191) 
        },
        ldap_filter: {
            type: Datatypes.TEXT
        },
        ldap_username_field: {
            type: Datatypes.STRING(191) 
        },
        ldap_lname_field: {
            type: Datatypes.STRING(191) 
        },
        ldap_fname_field: {
            type: Datatypes.STRING(191) 
        },
        ldap_auth_filter_query: {
            type: Datatypes.STRING(191) 
        },
        ldap_version: {
            type: Datatypes.INTEGER
        },
        ldap_active_flag: {
            type: Datatypes.STRING(191) 
        },
        ldap_emp_num: {
            type: Datatypes.STRING(191) 
        },
        ldap_email: {
            type: Datatypes.STRING(191) 
        },
        full_multiple_companies_support: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        ldap_server_cert_ignore: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        locale: {
            type: Datatypes.STRING(5) 
        },
        labels_per_page: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        labels_width: {
            type: Datatypes.DECIMAL,
            allowNull: false
        },
        labels_height: {
            type: Datatypes.DECIMAL,
            allowNull: false 
        },
        labels_pmargin_left: {
            type: Datatypes.DECIMAL,
            allowNull: false
        },
        labels_pmargin_right: {
            type: Datatypes.DECIMAL,
            allowNull: false 
        },
        labels_pmargin_top: {
            type: Datatypes.DECIMAL,
            allowNull: false 
        },
        labels_pmargin_bottom: {
            type: Datatypes.DECIMAL,
            allowNull: false
        },
        labels_display_bgutter: {
            type: Datatypes.DECIMAL,
            allowNull: false 
        },
        labels_display_sgutter: {
            type: Datatypes.DECIMAL,
            allowNull: false
        },
        labels_fontsize: {
            type: Datatypes.INTEGER,
            allowNull: false 
        },
        labels_pagewidth: {
            type: Datatypes.DECIMAL,
            allowNull: false 
        },
        labels_pageheight: {
            type: Datatypes.DECIMAL,
            allowNull: false 
        },
        labels_display_name: {
            type: Datatypes.INTEGER,
            allowNull: false 
        },
        labels_display_serial: {
            type: Datatypes.INTEGER,
            allowNull: false 
        },
        labels_display_tag: {
            type: Datatypes.INTEGER,
            allowNull: false 
        },
        alt_barcode: {
            type: Datatypes.STRING(191) 
        },
        alt_barcode_enabled: {
            type: Datatypes.BOOLEAN 
        },
        alert_interval: {
            type: Datatypes.INTEGER 
        },
        alert_threshold: {
            type: Datatypes.INTEGER 
        },
        email_domain: {
            type: Datatypes.STRING(191) 
        },
        email_format: {
            type: Datatypes.STRING(191) 
        },
        username_format: {
            type: Datatypes.STRING(191) 
        },
        is_ad: {
            type: Datatypes.BOOLEAN,
            allowNull: false 
        },
        ad_domain: {
            type: Datatypes.STRING(191) 
        },
        ldap_port: {
            type: Datatypes.STRING(5),
            allowNull: false 
        },
        ldap_tls: {
            type: Datatypes.BOOLEAN,
            allowNull: false 
        },
        zerofill_count: {
            type: Datatypes.INTEGER,
            allowNull: false 
        },
        ldap_pw_sync: {
            type: Datatypes.BOOLEAN,
            allowNull: false 
        },
        two_factor_enabled: {
            type: Datatypes.INTEGER 
        },
        require_accept_signature: {
            type: Datatypes.BOOLEAN,
            allowNull: false 
        },
        date_display_format: {
            type: Datatypes.STRING(191),
            allowNull: false 
        },
        time_display_format: {
            type: Datatypes.STRING(191),
            allowNull: false 
        },
        next_auto_tag_base: {
            type: Datatypes.STRING(191),
            allowNull: false 
        },
        login_note: {
            type: Datatypes.INTEGER 
        },
        thumbnail_max_h: {
            type: Datatypes.INTEGER
        },
        pwd_secure_uncommon: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        pwd_secure_complexity: {
            type: Datatypes.STRING(191) 
        },
        pwd_secure_min: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        audit_interval: {
            type: Datatypes.INTEGER
        },
        audit_warning_days: {
            type: Datatypes.INTEGER
        },
        show_url_in_emails: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        custom_forgot_pass_url: {
            type: Datatypes.STRING(191) 
        },
        show_alerts_in_menu: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        labels_display_company_name: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        show_archived_in_list: {
            type: Datatypes.BOOLEAN,
            allowNull: false 
        },
        dashboard_message: {
            type: Datatypes.TEXT 
        },
        support_footer: {
            type: Datatypes.STRING(5) 
        },
        footer_text: {
            type: Datatypes.TEXT 
        },
        modellist_displays: {
            type: Datatypes.STRING(191) 
        },
        login_remote_user_enabled: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        login_common_disabled: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        login_remote_user_custom_logout_url: {
            type: Datatypes.STRING(191),
            allowNull: false 
        },
        skin: {
            type: Datatypes.STRING(191) 
        },
        show_images_in_email: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        admin_cc_email: {
            type: Datatypes.STRING(191) 
        },
        labels_display_model: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        privacy_policy_link: {
            type: Datatypes.STRING(191) 
        },
        version_footer: {
            type: Datatypes.STRING(5) 
        },
        unique_serial: {
            type: Datatypes.BOOLEAN,
            allowNull: false 
        },
        logo_print_assets: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        depreciation_method: {
            type: Datatypes.STRING(10) 
        },
        favicon: {
            type: Datatypes.STRING(191) 
        },
        email_logo: {
            type: Datatypes.STRING(191) 
        },
        label_logo: {
            type: Datatypes.STRING(191) 
        },
        show_assigned_assets: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        login_remote_user_header_name: {
            type: Datatypes.STRING(191),
            allowNull: false 
        },
        ad_append_domain: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        saml_enabled: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        saml_idp_metadata: {
            type: Datatypes.TEXT
        },
        saml_attr_mapping_username: {
            type: Datatypes.STRING(191) 
        },
        saml_forcelogin: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        saml_slo: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        },
        saml_sp_x509cert: {
            type: Datatypes.TEXT
        },
        saml_sp_privatekey: {
            type: Datatypes.TEXT
        },
        saml_custom_settings: {
            type: Datatypes.TEXT
        },
        admin_groups_access_enabled: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        firm_id: {
            type: Datatypes.INTEGER
        }    },
    {
        freezeTableName: true,
        tableName: 'settings',
        timestamps: true,
        underscored: true
    })
    return setting
}