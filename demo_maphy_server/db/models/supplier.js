module.exports = (sequelize, Datatypes) => {
    const supplier = sequelize.define('supplier', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        name: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: Datatypes.DATE,
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
        phone: {
            type: Datatypes.STRING(35),
            allowNull: true
        },
        fax: {
            type: Datatypes.STRING(35),
            allowNull: true
        },
        email: {
            type: Datatypes.STRING(150),
            allowNull: true
        },
        contact: {
            type: Datatypes.STRING(100),
            allowNull: true
        },
        zip: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        notes: {
            type: Datatypes.STRING,
            allowNull: true
        },
        url: {
            type: Datatypes.STRING(250),
            allowNull: true
        },
        image: {
            type: Datatypes.STRING(191),
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
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'suppliers',
        timestamps: true,
        underscored: true
    }
    )
    return supplier
}
