module.exports = (sequelize, Datatypes) => {
    const customFieldCustomFieldset = sequelize.define('customFieldCustomFieldset', {
        custom_field_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        custom_fieldset_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        order: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        required: {
            type: Datatypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        tableName: 'custom_field_custom_fieldset',
        timestamps: false,
        underscored: true
    }
    )
    customFieldCustomFieldset.removeAttribute('id');
    return customFieldCustomFieldset
}
