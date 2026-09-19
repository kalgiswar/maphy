module.exports = (sequelize, Datatypes) => {
    const consumableUser = sequelize.define('consumableUser', {
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
        consumable_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        assigned_to: {
            type: Datatypes.INTEGER,
            allowNull: false
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
        tableName: 'consumables_users',
        timestamps: true,
        underscored: true
    }
    )
    return consumableUser
}
