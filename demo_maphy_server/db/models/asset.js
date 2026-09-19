module.exports = (sequelize, Datatypes) => {
    const asset = sequelize.define('asset', {
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
        asset_tag: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        model_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        serial: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        assetdetails: {
            type: Datatypes.TEXT,
        },
        purchase_date: {
            type: Datatypes.DATE,
            allowNull: true
        },
        hydrostatic_test_due_date: {
            type: Datatypes.DATE,
            allowNull: true
        },
        purchase_cost: {
            type: Datatypes.DECIMAL,
            allowNull: true
        },
        tax_value: {
            type: Datatypes.DECIMAL,
            allowNull: true
        },
        excluding_tax: {
            type: Datatypes.DECIMAL,
            allowNull: true
        },
        order_number: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        capacity: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        assigned_to: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        notes: {
            type: Datatypes.TEXT,
            allowNull: true
        },
        image: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        physical: {
            type: Datatypes.BOOLEAN,
            allowNull: true
        },
        status_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        archived: {
            type: Datatypes.BOOLEAN,
            allowNull: true
        },
        warranty_months: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        depreciate: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        supplier_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        requestable: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        rtd_location_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        _snipeit_mac_address_1: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        accepted: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        last_checkout: {
            type: Datatypes.DATE,
            allowNull: true
        },
        expected_checkin: {
            type: Datatypes.DATE,
            allowNull: true
        },
        company_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        assigned_type: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        last_audit_date: {
            type: Datatypes.DATE,
            allowNull: true
        },
        next_audit_date: {
            type: Datatypes.DATE,
            allowNull: true
        },
        location_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        checkin_counter: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        checkout_counter: {
            type: Datatypes.INTEGER,
            allowNull: true
        },
        requests_counter: {
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
        latitude: {
            type: Datatypes.STRING(20)
        },
        longitude: {
            type: Datatypes.STRING(20)
        },
        audit_status_id: {
            type: Datatypes.INTEGER
        },
        depreciation_id:{
            type: Datatypes.INTEGER,
            allowNull: false
        },
        firm_id: {
            type: Datatypes.INTEGER
        }, 
        
    },
        {
            freezeTableName: true,
            tableName: 'assets',
            timestamps: true,
            underscored: true
        }
    )
    return asset
}
