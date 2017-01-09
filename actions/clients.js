const jwt = require('jsonwebtoken');

exports.clientAdd = {
    name: 'clientAdd',
    description: 'I add a client',
    inputs: {
        title: {required: true},
        success_uri: {required: true},
        fallback_uri: {required: false},
        scope: {required: false},
        owner_id: {required: true},
    },
    authenticated: false,
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        api.clients.add(data.params.title, data.params.success_uri, data.params.fallback_uri,
            data.params.scope, data.params.owner_id, function (error) {
                next(error)
            })
    }
}

exports.clientEdit = {
    name: 'clientEdit',
    description: 'I edit a client',
    inputs: {
        id: {required: true},
        data: {required: true}
    },
    authenticated: false,
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        api.clients.edit(data.params.id, data.params.data, function (error) {
            next(error)
        })
    }
}

exports.clientGet = {
    name: 'clientGet',
    description: 'I get a client',
    inputs: {
        id: {required: true}
    },
    authenticated: false,
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        api.clients.get(data.params.id, function (error, client) {
            data.response.client = client;
            next(error)
        })
    }
}

exports.clientsList = {
    name: 'clientsList',
    description: 'I list all the clients',
    authenticated: false,
    inputs: {
        limit: {required: false},
        page: {required: false},
    },
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        api.clients.list(data.params.limit, data.params.page, function (error, clients) {
            data.response.clients = clients;
            next(error)
        })
    }
}

exports.clientAuth = {
    name: 'clientAuth',
    description: 'Client Authenticate',
    authenticated: false,
    inputs: {
        appId: {required: true},
        appSecret: {required: true},
        scope: {required: false}
    },
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        api.clients.authenticate(data.params.appId, data.params.appSecret, data.params.scope, function (error, appId, scope) {
            if (error)
                return next(error);
            jwt.sign({appId}, api.config.general.clientSecretKey, {expiresIn: '30m'}, function (err, token) {
                data.response.authCode = token;
                data.response.scope = scope;
                next(err);
            });
        })
    }
}

exports.clientGetSecret = {
    name: 'clientGetSecret',
    description: 'I get client secret',
    authenticated: false,
    inputs: {
        appId: {required: true},
        ownerId: {required: true},
        ownerPass: {required: true}
    },
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        api.clients.getSecret(data.params.appId, data.params.ownerId, data.params.ownerPass, function (error, appSecret) {
            data.response.appSecret = appSecret;
            next(error);
        })
    }
}
