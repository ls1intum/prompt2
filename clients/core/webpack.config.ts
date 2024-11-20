import path from 'path'
import { Configuration, container, DefinePlugin } from 'webpack'
import CompressionPlugin from 'compression-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ExternalTemplateRemotesPlugin from 'external-remotes-plugin'
import packageJson from '../package.json'
import sharedLibraryPackageJson from '../shared_library/package.json'

// TODO: specify the version for react in shared dependencies
const config: (env: Record<string, string>) => Configuration = (env) => {
  const getVariable = (name: string) => env[name] ?? process.env[name]

  const IS_DEV = getVariable('NODE_ENV') !== 'production'
  const IS_PERF = getVariable('BUNDLE_SIZE') === 'true'
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
      port: 3000,
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
        '@': path.resolve(__dirname, '../shared_library'),
      },
    },
    plugins: [
      new container.ModuleFederationPlugin({
        name: 'core',
        remotes: {
          template_component: 'template_component@[templateComponent2Url]/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          shared_library: {
            requiredVersion: sharedLibraryPackageJson.version,
          },
        },
      }),
      new ExternalTemplateRemotesPlugin(),
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
      new CopyPlugin({
        patterns: [{ from: 'public' }],
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
      IS_PERF && new BundleAnalyzerPlugin(),
      new CleanWebpackPlugin(),
      !IS_DEV &&
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
    ].filter(Boolean),
    optimization: {
      minimize: !IS_DEV,
      runtimeChunk: {
        name: 'runtime',
      },
      splitChunks: {
        chunks: 'async',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          default: {
            name: 'common',
            chunks: 'initial',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      },
      minimizer: [`...`, new CssMinimizerPlugin()],
    },
    cache: {
      type: 'filesystem',
    },
  }
}

export default config
