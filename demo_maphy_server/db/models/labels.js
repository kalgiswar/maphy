module.exports = (sequelize, Datatypes) => {
    const labels = sequelize.define('labels', {
            id: {
                type: Datatypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'id'
            },
            // labels_per_page: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            labels_fontsize: {
                type: Datatypes.INTEGER,
                allowNull: false
            },
            labels_width: {
                type: Datatypes.INTEGER,
                allowNull: false
            },
            labels_height: {
                type: Datatypes.INTEGER,
                allowNull: false
            },
            // labels_display_sgutter: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            // labels_display_bgutter: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            // labels_pmargin_top: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            // labels_pmargin_bottom: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            // labels_pmargin_right: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            // labels_pmargin_left: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            // labels_pagewidth: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },
            // labels_pageheight: {
            //     type: Datatypes.INTEGER,
            //     allowNull: false
            // },


            // labels_display_name: {
            //     type: Datatypes.BOOLEAN,
            //     allowNull: true,
            //     field: 'labels_display_name'
            // },
            // labels_display_serial: {
            //     type: Datatypes.BOOLEAN,
            //     allowNull: true,
            //     field: 'labels_display_serial'
            // },
            // labels_display_tag: {
            //     type: Datatypes.BOOLEAN,
            //     allowNull: true,
            //     field: 'labels_display_tag'
            // },
            // labels_display_model: {
            //     type: Datatypes.BOOLEAN,
            //     allowNull: true,
            //     field: 'labels_display_model'
            // },
            // labels_display_companyname: {
            //     type: Datatypes.BOOLEAN,
            //     allowNull: true,
            //     field: 'labels_display_companyname'
            // },

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
            tableName: 'labels',
            timestamps: true,
            underscored: true
        }
    )
    return labels
}