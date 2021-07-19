'use strict';

// nodejs built-in
const path = require('path');

// helpers
const notifier = require('node-notifier');

// webpack plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// webpack config props
let resolve = {
    extensions: ['.js']
};

let optimization = {
    minimizer: [
        new TerserPlugin({
            sourceMap: true,
            terserOptions: {
                compress: {
                    drop_console: false
                }
            }
        }),
        new OptimizeCssAssetsPlugin({})
    ]
};

// export
module.exports = function (env, argv) {
    return {
        context: path.resolve(__dirname, ''),
        mode: argv.mode,
        devtool: 'source-map',
        entry: './js/main.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: argv.mode === 'development' ? '[name].js' : '[name].min.js',
            publicPath: ''
        },
        resolve: resolve,
        module: {
            rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                loaders: argv.mode === 'development'
                    ? ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']
                    : [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            }]
        },
        optimization: optimization,
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].min.css",
                allChunks: true
            }),
            {
                apply: (compiler) => {
                    compiler.hooks.afterCompile.tap('afterCompilePlugin', (compilation) => {
                        if (argv.mode !== 'development') return;

                        let errorCount = 0,
                            warningCount = 0;

                        if (compilation.warnings.length > 0) {
                            let warning = '' + compilation.warnings[0],
                                title = warning.substr(0, warning.indexOf(': ')),
                                message = warning.replace(`${title}: "`, '');

                            console.log();
                            console.log('\x1b[33m%s\x1b[0m', 'WARNING!');
                            console.log('\x1b[33m%s\x1b[0m', message);

                            notifier.notify({
                                title: title,
                                message: 'Check out your command-line for more info about this warning!',
                                icon: 'D:\\warning.png'
                            });

                            warningCount = compilation.warnings.length;
                        }

                        if (compilation.errors.length > 0) {
                            let error = '' + compilation.errors[0],
                                title = error.substr(0, error.indexOf(': ')),
                                message = error.replace(`${title}: `, '');

                            console.log();
                            console.log('\x1b[31m%s\x1b[0m', 'ERROR!');
                            console.log('\x1b[31m%s\x1b[0m', message);

                            notifier.notify({
                                title: title,
                                message: 'Check out your command-line for more info about this error!',
                                icon: 'D:\\warning.png'
                            });

                            errorCount = compilation.errors.length;
                        }

                        console.log();
                        console.log(`[${new Date().toLocaleString()}] Compile: ${warningCount} warning, ${errorCount} error`);
                        console.log('==========================================================');
                    });
                }
            }
        ],
        devServer: {
            // https://webpack.js.org/configuration/stats/
            stats: {
                colors: true,
                errors: false,
                outputPath: false,
                hash: false,
                version: false,
                timings: false,
                assets: false,
                chunks: false,
                modules: false,
                reasons: false,
                children: false,
                source: false,
                errorDetails: false,
                warnings: false,
                publicPath: false
            },
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            historyApiFallback: true,
            after(app, server) {
                console.clear();
                console.log('================================================================');
                console.log('| \x1b[32m%s\x1b[0m', 'Initialized successfully!');
                console.log('|');
                console.log('| Mode: \x1b[36m%s\x1b[0m', argv.mode.charAt(0).toUpperCase() + argv.mode.slice(1));
                console.log('================================================================');
            }
        }
    }
};
