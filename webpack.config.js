const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BASE_PATH = path.resolve(__dirname);

const nodeModules = {};
require('fs').readdirSync(path.resolve(__dirname, 'node_modules'))
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs2 ' + mod;
});

const config = {
    name: 'fastmq',
    target: 'node',
    context: path.join(BASE_PATH, 'src'),
    entry: {
        Client: './Client.js',
        Server: './Server.js',
        Message: './Message.js',
    },

    output: {
        path: path.join(BASE_PATH, 'lib'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
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
                exclude: [
                    path.resolve( __dirname, '../node_modules' ),
                ],
                options: {
                    // https://github.com/babel/babel-loader#options
                    cacheDirectory: true,

                    // https://babeljs.io/docs/usage/options/
                    babelrc: true,
                },
            },
        ],
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            beautify: false
        })
    ],

    node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
    },

    //devtool: 'source-map',
    cache: true,
    stats: {
        colors: true,
        stats: true,
        children: true,
        version: true,
        timings: true,
        reasons: false,
        hash: false,
        chunks: false,
        chunkModules: false,
        chunkOrigins: false,
        cached: false,
        cachedAssets: false,
        source: false,
    }
};

module.exports = config;
