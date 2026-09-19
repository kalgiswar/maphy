module.exports = (sequelize, Datatypes) => {
    const licenseSeat = sequelize.define('licenseSeat', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        license_id: {
            type: Datatypes.INTEGER
        },
        user_id: {
            type: Datatypes.INTEGER
        },
        asset_id: {
            type: Datatypes.INTEGER
        },
        assigned_to: {
            type: Datatypes.INTEGER
        },
        deleted_at: {
            type: Datatypes.INTEGER
        },
        notes: {
            type: Datatypes.TEXT
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
        tableName: 'license_seats',
        timestamps: true,
        underscored: true
    }
    )
    return licenseSeat
}
