module.exports = (sequelize, Datatypes) => {
    const componentAsset = sequelize.define('componentAsset', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        user_id: {
            type: Datatypes.INTEGER
        },
        component_id: {
            type: Datatypes.INTEGER
        },
        assigned_qty: {
            type: Datatypes.INTEGER
        },
        asset_id: {
            type: Datatypes.INTEGER
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: Datatypes.DATE,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        tableName: 'components_assets',
        timestamps: true,
        underscored: true
    }
    )
    return componentAsset
}
