module.exports = (sequelize, Datatypes) => {
    const location = sequelize.define('location', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        name: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        image: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        city: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        state: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        country: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        address: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        address2: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        zip: {
            type: Datatypes.STRING(10),
            allowNull: true
        },
        parent_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        manager_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        ldap_ou: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        currency: {
            type: Datatypes.STRING(10),
            allowNull: true
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'locations',
        timestamps: true,
        underscored: true
    }
    )
    return location
}
