module.exports = (sequelize, Datatypes) => {
    const group = sequelize.define('group', {
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
        permissions: {
            type: Datatypes.TEXT
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
        tableName: 'permission_groups',
        timestamps: true,
        underscored: true
    }
    )
    return group
}
