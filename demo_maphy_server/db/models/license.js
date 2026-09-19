module.exports = (sequelize, Datatypes) => {
    const license = sequelize.define('license', {
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
        user_id: {
            type: Datatypes.INTEGER
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        serial: {
            type: Datatypes.STRING(191)
        },
        category_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        purchase_date: {
            type: Datatypes.DATE,
            allowNull: true
        },
        purchase_cost: {
            type: Datatypes.DECIMAL
        },
        order_number: {
            type: Datatypes.STRING(191)
        },
        company_id: {
            type: Datatypes.INTEGER
        },
        seats: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        notes: {
            type: Datatypes.TEXT
        },
        depreciation_id: {
            type: Datatypes.INTEGER
        },
        manufacturer_id: {
            type: Datatypes.INTEGER
        },
        license_name: {
            type: Datatypes.STRING(120)
        },
        license_email: {
            type: Datatypes.STRING(191)
        },
        depreciate: {
            type: Datatypes.BOOLEAN
        },
        maintained: {
            type: Datatypes.INTEGER
        },
        reassignable: {
            type: Datatypes.INTEGER
        },
        supplier_id: {
            type: Datatypes.INTEGER
        },
        expiration_date: {
            type: Datatypes.DATE
        },
        purchase_order: {
            type: Datatypes.STRING(191)
        },
        termination_date: {
            type: Datatypes.DATE
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
        tableName: 'licenses',
        timestamps: true,
        underscored: true
    }
    )
    return license
}
