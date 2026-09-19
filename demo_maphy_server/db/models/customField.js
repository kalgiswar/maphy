module.exports = (sequelize, Datatypes) => {
    const customField = sequelize.define('customField', {
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
        user_id: {
            type: Datatypes.INTEGER
        },
        format: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        element: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        field_values: {
            type: Datatypes.TEXT,
            allowNull: true
        },
        field_encrypted: {
            type: Datatypes.BOOLEAN,
            allowNull: true
        },
        db_column: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        help_text: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        show_in_email: {
            type: Datatypes.BOOLEAN,
            allowNull: true
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
        tableName: 'custom_fields',
        timestamps: true,
        underscored: true
    }
    )
    return customField
}
