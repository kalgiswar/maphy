module.exports = (sequelize, Datatypes) => {
    const actionLogs = sequelize.define('actionLogs', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        action_type: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        user_id: {
            type: Datatypes.INTEGER
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        target_id: {
            type: Datatypes.INTEGER
        },
        location_id: {
            type: Datatypes.INTEGER
        },
        target_type: {
            type: Datatypes.STRING(191)
        },
        note: {
            type: Datatypes.TEXT
        },
        filename: {
            type: Datatypes.TEXT
        },
        item_type: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        item_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        expected_checkin: {
            type: Datatypes.DATE,
            allowNull: true
        },
        accepted_id: {
            type: Datatypes.INTEGER
        },
        thread_id: {
            type: Datatypes.INTEGER
        },
        company_id: {
            type: Datatypes.INTEGER
        },
        accept_signature: {
            type: Datatypes.STRING(100)
        },
        log_meta: {
            type: Datatypes.TEXT
        },
        action_date: {
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
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'action_logs',
        timestamps: true,
        underscored: true
    }
    )
    return actionLogs
}
