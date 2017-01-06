'use strict';

let crypto = require('crypto');

module.exports = function (sequelize, DataTypes) {

    return sequelize.define('client_token', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        client_id: {
            type: DataTypes.INTEGER
        },
        jwtId: {
            type: DataTypes.STRING
        },
        refresh_token: {
            type: DataTypes.STRING
        },
        refresh_token_expires: {
            type: DataTypes.BIGINT
        },
        active_token: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false,
        tableName: 'user_token',
    });
};