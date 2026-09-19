module.exports = (sequelize, Datatypes) => {
    const branding = sequelize.define('branding', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        brandtype: {
            type: Datatypes.STRING(20),
            allowNull: false
        },
        site_name: {
            type: Datatypes.STRING(50),
            allowNull: false
        },
        image: {
            type: Datatypes.STRING(255),
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
            tableName: 'branding',
            timestamps: true,
            underscored: true
        }
    )
    return branding
}

