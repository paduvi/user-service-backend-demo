/**
 * Created by chotoxautinh on 1/4/17.
 */
var Sequelize = require('sequelize');
var cls = require('continuation-local-storage'),
    namespace = cls.createNamespace('cho-to-xau-tinh');
var Promise = require('bluebird');

module.exports = {
    start: (api, next) => {
        Sequelize.cls = namespace;
        api.sequelize = new Sequelize(api.config.sequelize.name, api.config.sequelize.user, api.config.sequelize.password, api.config.sequelize);

        api.models = {
            user: api.sequelize.import(__dirname + "/../models/user.js"),
            user_token: api.sequelize.import(__dirname + "/../models/user_token.js"),
            role: api.sequelize.import(__dirname + "/../models/role.js"),
            client: api.sequelize.import(__dirname + "/../models/client.js"),
        }

        Promise.all([Object.keys(api.models).map((key) => api.models[key].sync())]).then(function () {
            next();
        })
    },

    stop: (api, next) => {
        api.sequelize.close();
        next();
    },
}