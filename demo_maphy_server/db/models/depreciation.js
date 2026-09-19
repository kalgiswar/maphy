const { DECIMAL } = require("sequelize")

module.exports = (sequelize, Datatypes) => {
    const depreciation = sequelize.define('depreciation', {
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
        months: {
            type: Datatypes.STRING,
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
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER
        },
        residual_value:{
            type:Datatypes.DECIMAL
        }
    },
    {
        freezeTableName: true,
        tableName: 'depreciations',
        timestamps: true,
        underscored: true
    }
    )
    return depreciation
}
