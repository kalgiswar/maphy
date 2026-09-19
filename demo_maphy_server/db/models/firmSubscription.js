module.exports = (sequelize, Datatypes) => {
    const firmSubscription = sequelize.define('firmSubscription', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        description: {
            type: Datatypes.TEXT
        },
        firm_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        number_of_days: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: Datatypes.INTEGER
        },
        expiration_date: {
            type: Datatypes.DATE,
            allowNull: false
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        activated: {
            type: Datatypes.BOOLEAN
        }
    },
    {
        freezeTableName: true,
        tableName: 'firm_subscription',
        timestamps: false,
        underscored: true
    }
    )
    return firmSubscription
}
