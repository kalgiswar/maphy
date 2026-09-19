module.exports = (sequelize, Datatypes) => {
    const licenseNotifications = sequelize.define('licenseNotifications', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        no_of_days: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        description: {
            type: Datatypes.STRING(500),
            allowNull: false
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
        firm_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        tableName: 'license_notifications',
        timestamps: true,
        underscored: true
    }
    )
    return licenseNotifications
}
