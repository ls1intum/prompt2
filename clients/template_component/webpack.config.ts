import path from 'path'
import { Configuration, container, DefinePlugin } from 'webpack'
import 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import packageJson from '../package.json'
//import sharedLibraryPackageJson from '../shared-library/package.json'

const config: (env: Record<string, string>) => Configuration = (env) => {
  const getVariable = (name: string) => env[name] ?? process.env[name]

  const IS_DEV = getVariable('NODE_ENV') !== 'production'
  const deps = packageJson.dependencies

  return {
    target: 'web',
    mode: IS_DEV ? 'development' : 'production',
    devtool: IS_DEV ? 'source-map' : undefined,
    entry: './src/index.js',
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      hot: true,
      historyApiFallback: true,
      port: 3001,
      client: {
        progress: true,
      },
      open: false,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'build'),
      publicPath: 'auto',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        'shared-library': path.resolve(__dirname, '../shared-library'),
      },
    },
    plugins: [
      new container.ModuleFederationPlugin({
        name: 'template_component',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App',
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          // 'shared-library': {
          //   requiredVersion: sharedLibraryPackageJson.version,
          // },
        },
      }),
      new HtmlWebpackPlugin({
        template: 'public/template.html',
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      new DefinePlugin({
        'process.env.REACT_APP_SERVER_HOST': JSON.stringify(getVariable('REACT_APP_SERVER_HOST')),
        'process.env.REACT_APP_KEYCLOAK_HOST': JSON.stringify(
          getVariable('REACT_APP_KEYCLOAK_HOST'),
        ),
        'process.env.REACT_APP_KEYCLOAK_REALM_NAME': JSON.stringify(
          getVariable('REACT_APP_KEYCLOAK_REALM_NAME'),
        ),
      }),
    ].filter(Boolean),
    cache: {
      type: 'filesystem',
    },
  }
}

export default config
