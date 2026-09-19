module.exports = (sequelize, Datatypes) => {
    const ticket = sequelize.define('ticket', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        description: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        asset_tag: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        details: {
            type: Datatypes.TEXT
        },
        user_id: {
            type: Datatypes.INTEGER
        },
        created_by: {
            type: Datatypes.INTEGER
        },
        status_id: {
            type: Datatypes.INTEGER
        },
        assigned_to: {
            type: Datatypes.INTEGER
        },
        issue_id: {
            type: Datatypes.INTEGER
        },
        talent_group_id: {
            type: Datatypes.INTEGER
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        sister_ticket_id: {
            type: Datatypes.INTEGER
        },
        updated_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER
        },
        others: {
            type: Datatypes.STRING(191)
        },
        escalated_by: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'tickets',
        timestamps: true,
        underscored: true
    }
    )
    return ticket
}
