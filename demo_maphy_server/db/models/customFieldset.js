module.exports = (sequelize, Datatypes) => {
    const customFieldset = sequelize.define('customFieldset', {
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
        }
    },
    {
        freezeTableName: true,
        tableName: 'custom_fieldsets',
        timestamps: true,
        underscored: true
    }
    )
    return customFieldset
}
