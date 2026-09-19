// var  Sequelize      = require('sequelize');
// const Datatypes = Sequelize.DataTypes
module.exports = (sequelize, Datatypes) => {
    const department = sequelize.define('department', {
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
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        notes: {
            type: Datatypes.STRING,
            allowNull: true
        },
        image: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        company_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        location_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        manager_id: {
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
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'departments',
        timestamps: true,
        underscored: true
    }
    )
    return department
}
