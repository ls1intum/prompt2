import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import { container } from 'webpack';

const config: webpack.Configuration = {
    entry: './src/index',
    mode: 'development',
    output: {
        publicPath: 'auto',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
        new container.ModuleFederationPlugin({
            name: 'certificate',
            filename: 'remoteEntry.js',
            exposes: {
                './App': './src/App',
            },
            shared: {
                react: { singleton: true },
                'react-dom': { singleton: true },
            },
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 3006,
        historyApiFallback: true,
    },
};

export default config;
