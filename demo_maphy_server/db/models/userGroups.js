module.exports = (sequelize, Datatypes) => {
    const userGroups = sequelize.define('userGroups', {
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: 'composite_unique'
        },
        group_id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            unique: 'composite_unique'
        },
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'users_groups',
        timestamps: false,
        underscored: true
    }
    )
    userGroups.removeAttribute('id')
    return userGroups
}
