module.exports = (sequelize, Datatypes) => {
    const ticketStatus = sequelize.define('ticketStatus', {
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
        type: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        user_id: {
            type: Datatypes.INTEGER
        },
        created_by: {
            type: Datatypes.INTEGER
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
        tableName: 'ticket_status',
        timestamps: true,
        underscored: true
    }
    )
    return ticketStatus
}
