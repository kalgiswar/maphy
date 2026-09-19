module.exports = (sequelize, Datatypes) => {
    const consumable = sequelize.define('consumable', {
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
        category_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        location_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        qty: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        requestable: {
            type: Datatypes.BOOLEAN
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
        min_amt: {
            type: Datatypes.INTEGER
        },
        manufacturer_id: {
            type: Datatypes.INTEGER
        },
        model_number: {
            type: Datatypes.STRING(191)
        },
        image: {
            type: Datatypes.STRING(191)
        },
        item_no: {
            type: Datatypes.STRING(191)
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
        tableName: 'consumables',
        timestamps: true,
        underscored: true
    }
    )
    return consumable
}
