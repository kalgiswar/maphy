module.exports = (sequelize, Datatypes) => {
    const component = sequelize.define('component', {
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
            type: Datatypes.INTEGER
        },
        qty: {
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
        min_amt: {
            type: Datatypes.INTEGER
        },
        image: {
            type: Datatypes.STRING(191)
        },
        serial: {
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
        tableName: 'components',
        timestamps: true,
        underscored: true
    }
    )
    return component
}
