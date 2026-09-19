module.exports = (sequelize, Datatypes) => {
    const category = sequelize.define('category', {
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
        image: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        checkin_email: {
            type: Datatypes.BOOLEAN,
            allowNull: true,
            field: 'checkin_email'
        },
        has_eula: {
            type: Datatypes.BOOLEAN,
            allowNull: true,
            field: 'use_default_eula'
        },
        require_acceptance: {
            type: Datatypes.BOOLEAN,
            allowNull: true,
            field: 'require_acceptance'
        },
        eula_text: {
            type: Datatypes.STRING,
            allowNull: true,
            field: 'eula_text'
        },
        category_type: {
            type: Datatypes.STRING(10),
            allowNull: true,
            field: 'category_type'
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
        tableName: 'categories',
        timestamps: true,
        underscored: true
    }
    )
    return category
}
