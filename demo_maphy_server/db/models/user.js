module.exports = (sequelize, Datatypes) => {
    const user = sequelize.define('user', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        email: {
            type: Datatypes.STRING(191)
        },
        password: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        permissions: {
            type: Datatypes.TEXT
        },
        activated: {
            type: Datatypes.BOOLEAN
        },
        activation_code: {
            type: Datatypes.STRING(191)
        },
        activated_at: {
            type: Datatypes.DATE
        },
        last_login: {
            type: Datatypes.DATE
        },
        persist_code: {
            type: Datatypes.STRING(191)
        },
        reset_password_code: {
            type: Datatypes.STRING(191)
        },
        first_name: {
            type: Datatypes.STRING(191)
        },
        last_name: {
            type: Datatypes.STRING(191)
        },
        deleted_at: {
            type: Datatypes.DATE
        },
        website: {
            type: Datatypes.STRING(191)
        },
        country: {
            type: Datatypes.STRING(191)
        },
        gravatar: {
            type: Datatypes.STRING(191)
        },
        location_id: {
            type: Datatypes.INTEGER
        },
        phone: {
            type: Datatypes.STRING(191)
        },
        jobtitle: {
            type: Datatypes.STRING(191)
        },
        manager_id: {
            type: Datatypes.INTEGER
        },
        employee_num: {
            type: Datatypes.TEXT
        },
        avatar: {
            type: Datatypes.STRING(191)
        },
        username: {
            type: Datatypes.STRING(191)
        },
        notes: {
            type: Datatypes.TEXT
        },
        company_id: {
            type: Datatypes.INTEGER
        },
        remember_token: {
            type: Datatypes.TEXT
        },
        ldap_import: {
            type: Datatypes.BOOLEAN
        },
        locale: {
            type: Datatypes.STRING(191)
        },
        show_in_list: {
            type: Datatypes.BOOLEAN
        },
        two_factor_secret: {
            type: Datatypes.STRING(32)
        },
        two_factor_enrolled: {
            type: Datatypes.BOOLEAN
        },
        two_factor_optin: {
            type: Datatypes.BOOLEAN
        },
        department_id: {
            type: Datatypes.INTEGER
        },
        address: {
            type: Datatypes.STRING(191)
        },
        city: {
            type: Datatypes.STRING(191)
        },
        talent_group_id: {
            type: Datatypes.INTEGER
        },
        user_type: {
            type: Datatypes.INTEGER
        },
        availability_status: {
            type: Datatypes.INTEGER
        },
        state: {
            type: Datatypes.STRING(191)
        },
        zip: {
            type: Datatypes.STRING(10)
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER
        },
        password_otp: {
            type: Datatypes.STRING(10)
        },
        onboarding_dismissed: {
            type: Datatypes.BOOLEAN
        }
    },
    {
        freezeTableName: true,
        tableName: 'users',
        timestamps: true,
        underscored: true
    }
    )
    return user
}
