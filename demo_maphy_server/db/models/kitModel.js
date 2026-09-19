module.exports = (sequelize, Datatypes) => {
    const kitModel = sequelize.define('kitModel', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        kit_id: {
            type: Datatypes.INTEGER
        },
        model_id: {
            type: Datatypes.INTEGER
        },
        quantity: {
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
        tableName: 'kits_models',
        timestamps: true,
        underscored: true
    }
    )
    return kitModel
}
