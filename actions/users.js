const jwt = require('jsonwebtoken');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

exports.userLogin = {
    name: 'userLogin',
    description: 'User Login',
    inputs: {
        authCode: {required: true},
        scope: {required: true},
        user_email: {required: true},
        user_pass: {required: true}
    },
    authenticated: false,
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        let clientSecretKey = api.config.general.clientSecretKey;
        let userSecretKey = api.config.general.userSecretKey;

        try {
            /* Verify auth code */
            let {appId} = jwt.verify(data.params.authCode, clientSecretKey);

            api.clients.get(appId, function (error, client) {
                if (error)
                    return next(error);

                function fallbackError(error) {
                    data.response.redirectURL = client.fallback_uri || client.success_uri;
                    data.response.authCode = data.params.authCode;
                    data.response.scope = data.params.scope;
                    data.response.error = error.message;
                    next();
                }

                /* Check validate scope */
                let dif = _.difference(data.params.scope, client.scope);
                if (dif.length > 0)
                    return fallbackError(new Error(`Invalid scope: ${dif.join(', ')}`));

                /* Check validate credential user */
                api.users.authenticate(data.params.user_email, data.params.user_pass, function (error, user_id) {
                    if (error)
                        return fallbackError(error);

                    /* Save login history as user_token in database */
                    api.user_tokens.generate(user_id, data.params.scope, function (error, result) {
                        if (error)
                            return fallbackError(error);

                        let expire_time = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
                        jwt.sign({
                            user_id,
                            scope: data.params.scope,
                            jti: result.id
                        }, userSecretKey, {expiresIn: expire_time}, function (error, token) {
                            if (error)
                                return fallbackError(error);
                            data.response.redirectURL = client.success_uri;
                            data.response.accessToken = token;
                            data.response.expiredTime = expire_time;
                            data.response.refreshToken = result.refresh_token;
                            data.response.authScheme = api.config.general.authScheme;
                            next();
                        });
                    })
                });
            })
        } catch (err) {
            next(err);
        }
    }
}

exports.refreshToken = {
    name: 'refreshToken',
    description: 'Refresh Token',
    inputs: {
        refreshToken: {required: true},
    },
    authenticated: false,
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        let userSecretKey = api.config.general.userSecretKey;

        let auth_header = data.connection.rawConnection.req.headers.authorization;
        if (!auth_header)
            return next(new Error('Required Authenticated'));
        let authScheme = api.config.general.authScheme;
        if (!auth_header.startsWith(authScheme))
            return next(new Error('Invalid Auth Scheme'));
        let accessToken = auth_header.replace(authScheme + ' ', '');

        jwt.decode(accessToken, function (err, {jti, user_id, scope}) {
            if (err)
                return next(err);
            api.user_tokens.refresh(jti, data.params.refreshToken, function (err) {
                if (err)
                    return next(err);
                api.user_tokens.get(jti, user_id, function (err, result) {
                    if (err)
                        return next(err);

                    let expire_time = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
                    jwt.sign({
                        user_id,
                        scope,
                        jti
                    }, userSecretKey, {expiresIn: expire_time}, function (error, token) {
                        if (error)
                            return fallbackError(error);
                        data.response.accessToken = token;
                        data.response.expiredTime = expire_time;
                        data.response.refreshToken = result.refresh_token;
                        data.response.authScheme = api.config.general.authScheme;
                        next();
                    });
                })
            });
        });

    }
}

exports.ownUserGet = {
    name: 'ownUserGet',
    description: 'I get my own user info',
    authenticated: true,
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        data.response.user = data.user;
        next();
    }
}

exports.usersList = {
    name: 'usersList',
    description: 'I list all the users',
    authenticated: true,
    inputs: {
        limit: {required: false},
        page: {required: false},
    },
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        let permissions = data.user.permissions;
        if (!permissions.users || !~permissions.users.indexOf("index"))
            return next(new Error(`You don't have permission to access`));
        api.users.list(data.params.limit, data.params.page, function (error, users) {
            data.response.users = users;
            next(error)
        })
    }
}