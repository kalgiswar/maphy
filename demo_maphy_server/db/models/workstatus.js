module.exports = (sequelize, Datatypes) => {
    const workstatus = sequelize.define('workstatus', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        details: {
            type: Datatypes.TEXT
        },
   
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'workstatus',
        timestamps: true,
        underscored: true
    }
    )
    return workstatus
}