/**
 * Created by chotoxautinh on 1/6/17.
 */
const jwt = require('jsonwebtoken');

module.exports = {

    initialize: function (api, next) {
        var authenticationMiddleware = {
            name: 'authentication Middleware',
            global: true,
            preProcessor: function (data, next) {
                if (data.actionTemplate.authenticated === true) {
                    let userSecretKey = api.config.general.userSecretKey;

                    let auth_header = data.connection.rawConnection.req.headers.authorization;
                    if (!auth_header)
                        return next(new Error('Required Authenticated'));
                    let authScheme = api.config.general.authScheme;
                    if (!auth_header.startsWith(authScheme))
                        return next(new Error('Invalid Auth Scheme'));
                    let token = auth_header.replace(authScheme + ' ', '');
                    jwt.verify(token, userSecretKey, function(err, decoded) {
                        if (err)
                            return next(err);
                        if (!~decoded.scope.indexOf('user'))
                            return next(new Error('Not have scope authorization'));
                        api.users.get(decoded.user_id, function (error, user) {
                            data.user = user;
                            next(error);
                        })
                    });
                } else {
                    next()
                }
            }
        }

        api.actions.addMiddleware(authenticationMiddleware)

        next()
    }
}