module.exports = (sequelize, Datatypes) => {
    const maintenance = sequelize.define('maintenance', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        asset_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        supplier_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        asset_maintenance_type: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        title: {
            type: Datatypes.STRING(100),
            allowNull: false
        },
        is_warranty: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        start_date: {
            type: Datatypes.DATE,
            allowNull: false
        },
        completion_date: {
            type: Datatypes.DATE
        },
        asset_maintenance_time: {
            type: Datatypes.INTEGER
        },
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        notes: {
            type: Datatypes.TEXT
        },
        cost: {
            type: Datatypes.INTEGER
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
        tableName: 'asset_maintenances',
        timestamps: true,
        underscored: true
    }
    )
    return maintenance
}
