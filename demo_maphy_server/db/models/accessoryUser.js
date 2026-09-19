module.exports = (sequelize, Datatypes) => {
    const accessoryUser = sequelize.define('accessoryUser', {
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
        accessory_id: {
            type: Datatypes.INTEGER
        },
        assigned_to: {
            type: Datatypes.INTEGER
        },
        note: {
            type: Datatypes.TEXT
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
        tableName: 'accessories_users',
        timestamps: true,
        underscored: true
    }
    )
    return accessoryUser
}
