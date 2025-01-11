import path from 'path'
import 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import packageJson from '../package.json' with { type: 'json' }
import webpack from 'webpack'
import container from 'webpack'
import { fileURLToPath } from 'url'

const { ModuleFederationPlugin } = webpack.container

// Set the following variables to correctly configure the webpack
// In Environment Variables
// DEPLOYMENT_SUBDOMAIN=template_component

// Fixed variables
const localDevPort = 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config: (env: Record<string, string>) => container.Configuration = (env) => {
  const getVariable = (name: string) => env[name] ?? process.env[name]

  // Here we only need the subdomain. Leave empty if deployed at someURL.com/
  // Only fill out if deployed at someURL.com/subdomain/
  const deploymentSubDomain = 'template'
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
      port: localDevPort,
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
        {
          test: /\.css$/i,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, '../shared_library/src'),
          ],
          use: [
            'style-loader', // Injects styles into DOM
            'css-loader', // Resolves CSS imports
            'postcss-loader', // Processes Tailwind and other PostCSS plugins
          ],
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
        '@': path.resolve('../shared_library'),
      },
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'template_component', // TODO: rename this to your component name
        filename: 'template/remoteEntry.js',
        exposes: {
          './routers': './routers',
          './sidebar': './sidebar',
          './OverviewPage': './src/OverviewPage',
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
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
      new webpack.DefinePlugin({
        'process.env.REACT_APP_SERVER_HOST': JSON.stringify(getVariable('REACT_APP_SERVER_HOST')),
      }),
    ].filter(Boolean),
    cache: {
      type: 'filesystem',
    },
  }
}

export default config
