module.exports = (sequelize, Datatypes) => {
    const model = sequelize.define('model', {
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
        user_id: {
            type: Datatypes.INTEGER
        },
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        model_number: {
            type: Datatypes.STRING(191)
        },
        category_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        manufacturer_id: {
            type: Datatypes.INTEGER
        },
        depreciation_id: {
            type: Datatypes.INTEGER
        },
        eol: {
            type: Datatypes.STRING(191)
        },
        image: {
            type: Datatypes.STRING(121)
        },
        // depreciation_mac_address: {
        //     type: Datatypes.BOOLEAN
        // },
        fieldset_id: {
            type: Datatypes.INTEGER
        },
        notes: {
            type: Datatypes.TEXT
        },
        requestable: {
            type: Datatypes.INTEGER
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
        tableName: 'models',
        timestamps: true,
        underscored: true
    }
    )
    return model
}
