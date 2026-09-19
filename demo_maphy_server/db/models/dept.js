// var  Sequelize      = require('sequelize');
// const Datatypes = Sequelize.DataTypes
module.exports = (sequelize, Datatypes) => {
    const dept = sequelize.define('dept', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'emp_id'
        },
        name: {
            type: Datatypes.STRING(50),
            allowNull: true
        },
        salary: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        createdBy: {
            type: Datatypes.STRING(50),
            allowNull: true,
            field: 'created_by'
        },
        createdOn: {
            type: Datatypes.DATE,
            allowNull: true,
            field: 'created_on'
        },
        modifiedBy: {
            type: Datatypes.STRING(50),
            allowNull: true,
            field: 'modified_by'
        },
        modifiedOn: {
            type: Datatypes.DATE,
            allowNull: true,
            field: 'modified_on'
        },
        status: {
            type: Datatypes.CHAR,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        tableName: 'dept',
        timestamps: true,
        underscored: true,
        createdAt: 'created_on',
        updatedAt: 'modified_on'
    }
    )
    return dept
}
