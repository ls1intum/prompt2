import path from 'path'
import CompressionPlugin from 'compression-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ExternalTemplateRemotesPlugin from 'external-remotes-plugin'
import packageJson from '../package.json' with { type: 'json' }
import { fileURLToPath } from 'url'
import container from 'webpack'
import webpack from 'webpack'

const { ModuleFederationPlugin } = webpack.container

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// TODO: specify the version for react in shared dependencies
const config: (env: Record<string, string>) => container.Configuration = (env) => {
  const getVariable = (name: string) => env[name] ?? process.env[name]

  const IS_DEV = getVariable('NODE_ENV') !== 'production'
  const IS_PERF = getVariable('BUNDLE_SIZE') === 'true'
  const deps = packageJson.dependencies

  // Adjust this to match your deployment URL
  const rootURL = getVariable('REACT_APP_CORE_HOST')
  const templateSubPath = getVariable('REACT_TEMPLATE_COMPONENT_SUBPATH')
  const templateURL = IS_DEV ? `http://localhost:3001` : `${rootURL}/${templateSubPath}`

  const interviewSubPath = getVariable('REACT_INTERVIEW_COMPONENT_SUBPATH')
  const interviewURL = IS_DEV ? `http://localhost:3002` : `${rootURL}/${interviewSubPath}`

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
            path.resolve(__dirname, '../node_modules/@xyflow/react/dist/style.css'),
            path.resolve(__dirname, '../shared_library/components/minimal-tiptap/styles/index.css'),
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
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, '../shared_library'),
      },
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'core',
        remotes: {
          template_component: `template_component@${templateURL}/remoteEntry.js`,
          interview_component: `interview_component@${interviewURL}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
          '@tanstack/react-query': {
            singleton: true,
            requiredVersion: deps['@tanstack/react-query'],
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
      new webpack.DefinePlugin({
        'process.env.REACT_APP_CORE_HOST': JSON.stringify(getVariable('REACT_APP_CORE_HOST')),
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
