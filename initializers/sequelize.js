/**
 * Created by chotoxautinh on 1/4/17.
 */
var Sequelize = require('sequelize');
var cls = require('continuation-local-storage'),
    namespace = cls.createNamespace('cho-to-xau-tinh');
var Promise = require('bluebird');
var uuidV4 = require('uuid/v4');
var FlakeId = require('flakeid');
var flake = new FlakeId({
    mid: 411
});

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

        const ADMIN_ROLE = 1, TRAINER_ROLE = 2;
        const id1 = flake.gen(), id2 = flake.gen(), id3 = flake.gen();

        api.sequelize.sync({force: true})
            .then(function () {
                return Promise.all([
                    initRole(),
                    initUsers(),
                    initClient(id1)
                ]);
            })
            .then(function () {
                next();
            });

        function initRole() {
            const roles = [{
                id: ADMIN_ROLE,
                name: 'Admin',
                permissions: {
                    users: ['manage_all_user', 'manage_user']
                }
            }, {
                id: TRAINER_ROLE,
                name: 'Trainer',
                permissions: {
                    users: ['manage_user']
                }
            }];
            return Promise.map(roles, function (role) {
                return api.models.role.create(role);
            })
        }

        function initUsers() {
            const users = [{
                id: id1,
                user_email: 'cuong@techmaster.vn',
                user_pass: '123456',
                display_name: 'Cường Trịnh',
                role_ids: [ADMIN_ROLE, TRAINER_ROLE]
            }, {
                id: id2,
                user_email: 'viet@techmaster.vn',
                user_pass: '123456',
                display_name: 'Việt Phan',
                role_ids: [TRAINER_ROLE]
            }, {
                id: id3,
                user_email: 'robin@techmaster.vn',
                user_pass: '123456',
                display_name: 'Dr.Robin Huy',
                role_ids: [ADMIN_ROLE, TRAINER_ROLE]
            }];
            return Promise.map(users, function (user) {
                return api.models.user.create(user);
            })
        }

        function initClient(owner_id) {
            const clients = [{
                title: "Techmaster",
                success_uri: "http://localhost:8000/auth/success",
                fallback_uri: "http://localhost:8000/auth/fail",
                scope: ['user', 'payroll', 'course'],
                owner_id
            }, {
                title: "Solo Learn",
                success_uri: "http://localhost:8000/auth/success",
                fallback_uri: "http://localhost:8000/auth/fail",
                scope: ['quiz'],
                owner_id
            }];
            return Promise.map(clients, function (client) {
                return api.models.client.create(client);
            })
        }
    },

    stop: (api, next) => {
        api.sequelize.close();
        next();
    },
}