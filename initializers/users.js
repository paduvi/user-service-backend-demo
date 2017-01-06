// initializers/users.js
var Promise = require('bluebird');

module.exports = {

    initialize: function (api, next) {

        api.users = {

            // methods
            get: function (id, next) {
                api.models.user.findById(id, {
                    attributes: {exclude: ['salt', 'user_pass']}
                }).then(function (user) {
                    if (!user)
                        return next(new Error('User not found'));
                    return next(null, user);
                }).catch(function (error) {
                    return next(error);
                })
            },

            add: function (userName, email, password, next) {
                api.models.user.create({
                    user_email: email,
                    display_name: userName,
                    user_pass: password
                }).then(function () {
                    return next();
                }).catch(function (error) {
                    return next(error);
                })
            },

            edit: function (id, data, next) {
                delete data.user_pass;
                delete data.salt;
                api.models.user.update(data, {
                    where: {
                        id: id
                    }
                }).then(function (result) {
                    if (result === 0)
                        return next(new Error('User not found'));
                    return next();
                }).catch(function (error) {
                    return next(error);
                })
            },

            list: function (limit, page, next) {
                limit = limit || 15;
                page = page || 1;
                let offset = 0;

                if (page > 1)
                    offset = (page - 1) * limit;

                let opts = {
                    limit: limit,
                    offset: offset,
                    attributes: {exclude: ['salt', 'user_pass']}
                }
                return api.models.user.findAndCountAll(opts).then(function (users) {
                    return next(null, users);
                }).catch(function (err) {
                    return next(err);
                })
            },

            authenticate: function (email, password, next) {
                Promise.coroutine(function*() {
                    let user = yield api.models.user.find({
                        where: {user_email: email}
                    });
                    if (!user)
                        return next(new Error('User not found'));
                    if (!user.authenticate(password))
                        return next(new Error('Invalid credentials'));
                    return next(null, user.id);
                })();
            },

        }

        next()
    }

}