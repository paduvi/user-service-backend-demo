exports.clientAdd = {
    name: 'clientAdd',
    description: 'I add a client',
    inputs: {
        title: {required: true},
        success_uri: {required: true},
        fallback_uri: {required: false},
        scope: {
            required: false,
            formatter: function (param) {
                return param.split(',');
            }
        }
    },
    authenticated: false,
    outputExample: {},
    version: 1.0,
    run: function (api, data, next) {
        api.clients.add(data.params.title, data.params.success_uri, data.params.fallback_uri, data.params.scope, function (error) {
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
