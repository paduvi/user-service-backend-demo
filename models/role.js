"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("role", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'please input not too long'
                }
            }
        },
        permissions: {
            type: DataTypes.JSONB
        },
        created_at: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'arr_role',
        createdAt: 'created_at',
        updatedAt: false,
        deletedAt: false
    });
};