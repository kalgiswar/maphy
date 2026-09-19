module.exports = (sequelize, Datatypes) => {
    const statusLabel = sequelize.define('statusLabel', {
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
        deployable: {
            type: Datatypes.BOOLEAN,
            allowNull: true
        },
        pending: {
            type: Datatypes.BOOLEAN,
            allowNull: true
        },
        archived: {
            type: Datatypes.BOOLEAN,
            allowNull: true
        },
        notes: {
            type: Datatypes.STRING,
            allowNull: true
        },
        color: {
            type: Datatypes.STRING(10),
            allowNull: true
        },
        show_in_nav: {
            type: Datatypes.BOOLEAN,
            allowNull: true
        },
        default_label: {
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
        },
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'status_labels',
        timestamps: true,
        underscored: true
    }
    )
    return statusLabel
}
