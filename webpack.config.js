const yargs = require('yargs');
const path = require('path');
const Sym20WebpackPlugin = require('@sym20/extension-webpack-plugin');
const webpack = require('webpack');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gitHash = new GitRevisionPlugin().commithash();
const version = require('./package.json').version;
const builtOn = new Date().toUTCString();

function isDev() {
    return process.env.NODE_ENV === 'development';
}

const argv = yargs.argv;
const LOCAL_DOMAIN = 'local-dev.symphony.com';
const LOCAL_PORT = 9091;
const proxyTarget = argv.proxy ? `https://${argv.proxy}/` : 'https://st3.symphony.com/';

module.exports = {
    mode: isDev() ? 'development' : 'production',
    devtool: isDev() ? 'inline-source-map' : 'source-map',

    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js'
    },
    module: {
        rules: [
            { parser: { amd: false } },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    onlyCompileBundledFiles: true,
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    plugins: [
        new webpack.DefinePlugin({
            EXT_VERSION: JSON.stringify({
                version,
                builtOn,
                gitHash,
            }),
        }),
        new Sym20WebpackPlugin({
            name: 'C9 Remote',
            cwd: './dist',
            files: ['./extension.js']
        })
    ],

    devServer: {
        https: {
            cert: require.resolve('@sym20/extension-webpack-plugin/dev-certs/local-dev.symphony.com.crt'),
            key: require.resolve('@sym20/extension-webpack-plugin/dev-certs/local-dev.symphony.com.key')
        },
        port: LOCAL_PORT,
        host: '0.0.0.0',
        sockPort: LOCAL_PORT,
        sockHost: LOCAL_DOMAIN,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        contentBase: './dist',
        publicPath: '/',
        inline: true,
        disableHostCheck: true,
        proxy: {
            '/**': {
                target: proxyTarget,
                changeOrigin: true,
                hostRewrite: true,
                cookieDomainRewrite: LOCAL_DOMAIN,
                secure: false,
                logLevel: 'debug',
            },
        },
    }
};