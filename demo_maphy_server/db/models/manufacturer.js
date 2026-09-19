module.exports = (sequelize, Datatypes) => {
    const manufacturer = sequelize.define('manufacturer', {
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
            type: Datatypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        url: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        support_url: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        support_phone: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        support_email: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        image: {
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
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'manufacturers',
        timestamps: true,
        underscored: true
    }
    )
    return manufacturer
}
