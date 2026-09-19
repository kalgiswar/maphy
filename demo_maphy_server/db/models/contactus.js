module.exports = (sequelize, Datatypes) => {
    const contactus = sequelize.define('contactus', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        email: {
            type: Datatypes.STRING(191),
            allowNull: false
        },
        customer_description: {
            type:Datatypes.STRING(5000),
            allowNull: false
        },
        admin_description: {
            type:Datatypes.STRING(5000)
        },
        status: {
            type:Datatypes.STRING(10)
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        created_by: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        updated_by: {
            type: Datatypes.INTEGER,
            allowNull: false
        },  
        updated_at: {
            type: Datatypes.DATE,
            allowNull: true
        }   
    },
    {
        freezeTableName: true,
        tableName: 'contactus',
        timestamps: true,
        underscored: true
    }
    )
    return contactus
}