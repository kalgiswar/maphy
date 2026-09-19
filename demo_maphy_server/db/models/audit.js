module.exports = (sequelize, Datatypes) => {
    const audit = sequelize.define('audit', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        asset_tag: {
            type: Datatypes.INTEGER,
            allowNull: false
        },
        auditor_name: {
            type: Datatypes.STRING(100),
            allowNull: false
        },

        image: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        description: {
            type:Datatypes.TEXT
        },
        status_id: {
           // type: Datatypes.INTEGER,
           type: Datatypes.STRING(100),
        },
        location: {
            type:Datatypes.TEXT
        },
        gps_coordinates: {
            type:Datatypes.TEXT
        }, 
        
         present_location: {
            type:Datatypes.TEXT
        },
        created_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
       updated_at: {
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

        firm_id: {
            type: Datatypes.INTEGER,
            allowNull: false
        }
    },
    {
        freezeTableName: true,
        tableName: 'audit',
        timestamps: true,
        underscored: true
    }
    )
    return audit
}