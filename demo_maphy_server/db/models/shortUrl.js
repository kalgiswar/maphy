module.exports = (sequelize, Datatypes) => {
    const shorturl = sequelize.define('short_url', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        url_id: {
            type: Datatypes.STRING(191),
            allowNull: true,
            unique: true
        },
        url: {
            type: Datatypes.TEXT,
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
        deleted_at: {
            type: Datatypes.DATE,
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER
        }
    },
    {
        freezeTableName: true,
        tableName: 'short_url',
        timestamps: true,
        underscored: true
    }
    )
    return shorturl
}
