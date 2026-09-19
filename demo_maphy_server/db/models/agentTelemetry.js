module.exports = (sequelize, Datatypes) => {
    const agentTelemetry = sequelize.define('agentTelemetry', {
        id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        hostname: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        serial: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        cpu: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        ram: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        disk: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        motherboard: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        manufacturer: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        model: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        mac_address: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        ip_address: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        logged_user: {
            type: Datatypes.STRING(191),
            allowNull: true
        },
        firm_id: {
            type: Datatypes.INTEGER,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        tableName: 'agent_telemetries',
        timestamps: true,
        underscored: true
    }
    );
    return agentTelemetry;
};
