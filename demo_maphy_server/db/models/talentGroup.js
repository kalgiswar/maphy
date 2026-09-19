module.exports = (sequelize, Datatypes) => {
    const talentGroup = sequelize.define('talentGroup', {
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
        description: {
            type: Datatypes.STRING(500),
            allowNull: false
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        tableName: 'talent_groups',
        timestamps: true,
        underscored: true
    }
    )
    return talentGroup
}
