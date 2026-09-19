const { update } = require("lodash")

module.exports = (sequelize, Datatypes) => {
    const supplier = sequelize.define('scrap_sale', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        item_name: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        item_type: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        sale_date: {
            type: Datatypes.DATEONLY,
            allowNull: true
        },
        quantity: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        unit_price: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        total_price: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        buyer_name: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        buyer_contact: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        remarks: {
            type: Datatypes.STRING(35),
            allowNull: true
        },
        created_by: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        updated_by: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        deleted_by: {
            type: Datatypes.INTEGER,
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
        tableName: 'scrap_sale',
        timestamps: true,
        underscored: true
    }
    )
    return supplier
}
