const path = require('path');
const BASE_PATH = path.resolve(__dirname);

const nodeModules = {};
require('fs')
    .readdirSync(path.resolve(__dirname, 'node_modules'))
    .filter((x) => {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach((mod) => {
        nodeModules[mod] = 'commonjs2 ' + mod;
    });

const config = {
    name: 'fastmq',
    target: 'node',
    mode: 'production',
    context: path.join(BASE_PATH, 'src'),
    entry: {
        Client: './Client.js',
        Server: './Server.js',
        Message: './Message.js',
        Response: './Response.js',
    },

    output: {
        path: path.join(BASE_PATH, 'lib'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },

    resolve: {
        modules: [BASE_PATH, path.join(BASE_PATH, 'node_modules')],
        extensions: ['.js'],
    },

    externals: [nodeModules],

    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                exclude: [path.resolve(__dirname, '../node_modules')],
                options: {
                    // https://github.com/babel/babel-loader#options
                    cacheDirectory: true,

                    // https://babeljs.io/docs/usage/options/
                    babelrc: true,
                },
            },
        ],
    },

    optimization: {
        minimize: false,
    },

    node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
    },

    // devtool: 'source-map',
    cache: true,
    stats: {
        colors: true,
        reasons: false,
        version: true,
        timings: true,
        chunks: false,
        chunkModules: false,
    },
};

module.exports = config;
