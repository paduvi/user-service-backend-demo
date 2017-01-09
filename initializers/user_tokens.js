// initializers/users.js
var Promise = require('bluebird');

module.exports = {

    initialize: function (api, next) {

        api.user_tokens = {

            // methods
            get: function (id, user_id, next) {
                api.models.user_token.find({
                    where: {
                        id,
                        user_id
                    }
                }).then(function (token) {
                    if (!token)
                        return next(new Error('Token not found'));
                    return next(null, token);
                }).catch(function (error) {
                    return next(error);
                })
            },

            generate: function (user_id, scope, next) {
                api.models.user_token.create({
                    user_id,
                    scope
                }).then(function (result) {
                    return next(null, result);
                }).catch(function (error) {
                    return next(error);
                })
            },

            refresh: function (id, next) {
                api.models.user_token.save({}, {
                    where: {
                        id
                    }
                }).then(function (result) {
                    if (result === 0)
                        return next(new Error('Token not found'));
                    return next();
                }).catch(function (error) {
                    return next(error);
                })
            },

        }

        next()
    }

}
