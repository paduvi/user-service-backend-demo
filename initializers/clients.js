// initializers/users.js
var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {

    initialize: function (api, next) {

        api.clients = {

            // methods
            get: function (id, next) {
                api.models.client.findById(id, {
                    attributes: {exclude: ['salt', 'client_secret']}
                }).then(function (client) {
                    if (!client)
                        return next(new Error('Client not found'));
                    return next(null, client);
                }).catch(function (error) {
                    return next(error);
                })
            },

            getSecret: function (appId, ownerId, ownerPass, next) {
                Promise.coroutine(function*() {
                    let user = yield api.models.user.findById(ownerId);
                    if (!user)
                        return next(new Error('User not found'));
                    if (!user.authenticate(ownerPass))
                        return next(new Error('Invalid credentials'));
                    let client = yield api.models.client.findById(appId);
                    if (!client)
                        return next(new Error('Client not found'));
                    let secret = client.decrypt(client.client_secret);
                    return next(null, secret);
                })().catch(function (error) {
                    return next(error);
                })
            },

            add: function (title, success_uri, fallback_uri, scope, owner_id, next) {
                api.models.client.create({
                    title,
                    success_uri,
                    fallback_uri,
                    scope,
                    owner_id
                }).then(function () {
                    return next();
                }).catch(function (error) {
                    return next(error);
                })
            },

            edit: function (id, data, next) {
                delete data.client_secret;
                delete data.salt;
                delete data.id;

                api.models.client.update(data, {
                    where: {
                        id: id
                    }
                }).then(function (result) {
                    if (result === 0)
                        return next(new Error('Client not found'));
                    return next();
                }).catch(function (error) {
                    return next(error);
                })
            },

            list: function (limit = 15, page = 1, next) {
                let offset = 0;

                if (page > 1)
                    offset = (page - 1) * limit;

                let opts = {
                    limit: limit,
                    offset: offset,
                    attributes: {exclude: ['salt', 'client_secret']}
                }
                return api.models.client.findAndCountAll(opts).then(function (clients) {
                    return next(null, clients);
                }).catch(function (err) {
                    return next(err);
                })
            },

            authenticate: function (client_id, client_secret, scope = [], next) {
                Promise.coroutine(function*() {
                    let client = yield api.models.client.findById(client_id);
                    if (!client)
                        return next(new Error('Client not found'));
                    if (!client.authenticate(client_secret))
                        return next(new Error('Invalid credentials'));
                    let dif = _.difference(scope, client.scope);
                    if (dif.length > 0)
                        return next(new Error(`Invalid scope: ${dif.join(', ')}`));
                    if (!scope.length)
                        scope = client.scope;
                    return next(null, client.id, scope);
                })().catch(function (error) {
                    return next(error);
                })
            },

        }

        next()
    }

}
