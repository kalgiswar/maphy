module.exports = (sequelize, Datatypes) => {
    const ticketIssue = sequelize.define('ticketIssue', {
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
        severity_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        skill_level_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        talent_group_id: {
            type: Datatypes.INTEGER,
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
        tableName: 'ticket_issues',
        timestamps: true,
        underscored: true
    }
    )
    return ticketIssue
}
