/**
 * Created by chotoxautinh on 1/4/17.
 */
'use strict';

let crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

module.exports = function (sequelize, DataTypes) {

    return sequelize.define('client', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        client_secret: {
            type: DataTypes.STRING(255),
            validate: {
                notEmpty: true
            }
        },
        salt: DataTypes.STRING(255),
        success_uri: {
            type: DataTypes.STRING(255),
            validate: {
                notEmpty: true
            }
        },
        fallback_uri: {
            type: DataTypes.STRING(255),
            validate: {
                notEmpty: true
            }
        },
        scope: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        owner_id: DataTypes.BIGINT
    }, {
        timestamps: false,
        tableName: 'client',
        instanceMethods: {
            authenticate: function (secret) {
                return this.client_secret === this.encrypt(secret);
            },
            encrypt: function (text) {
                var cipher = crypto.createCipher(algorithm, this.salt)
                var crypted = cipher.update(text, 'utf8', 'hex')
                crypted += cipher.final('hex');
                return crypted;
            },
            decrypt: function (text) {
                var decipher = crypto.createDecipher(algorithm, this.salt)
                var dec = decipher.update(text, 'hex', 'utf8')
                dec += decipher.final('utf8');
                return dec;
            }
        },
        hooks: {
            beforeCreate: function (client, op, fn) {
                client.salt = randomid(50);
                client.client_secret = client.encrypt(randomid(12));
                fn(null, client);
            }
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