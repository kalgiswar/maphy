module.exports = (sequelize, Datatypes) => {
    const firm = sequelize.define('firm', {
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
        image: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        user_id: {
            type: Datatypes.INTEGER
        },
        deleted_at: {
            type: Datatypes.DATE
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        activated: {
            type: Datatypes.BOOLEAN
        },
        expiration_date: {
            type: Datatypes.DATE
        }
    },
    {
        freezeTableName: true,
        tableName: 'firm',
        timestamps: true,
        underscored: true
    }
    )
    return firm
}
