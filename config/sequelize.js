/**
 * Created by chotoxautinh on 1/4/17.
 */
exports['default'] = {
    sequelize: function (api) {
        return {
            name: 'techmasterv4',
            user: 'postgres',
            password: null,
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            logging: false
        }
    }
}