'use strict';

let crypto = require('crypto');

module.exports = function (sequelize, DataTypes) {

    return sequelize.define('user_token', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        scope: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        refresh_token: {
            type: DataTypes.STRING
        },
        refresh_token_expires: {
            type: DataTypes.BIGINT
        }
    }, {
        timestamps: false,
        tableName: 'user_token',
        hooks: {
            beforeCreate: function (client, op, fn) {
                client.refresh_token = randomid(30);
                client.refresh_token_expires = Date.now() + 30 * 24 * 60 * 60 * 1000 // 1 month
                fn(null, client);
            },
            beforeUpdate: function (client, op, fn) {
                client.refresh_token = randomid(30);
                client.refresh_token_expires = Date.now() + 30 * 24 * 60 * 60 * 1000 // 1 month
                fn(null, client);
            },
        }
    });
};

let randomid = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};