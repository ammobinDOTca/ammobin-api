/**
 * package up each lambda individually
 * saved 600ms on init time in graphql lambda
 * and a lot in zip size (all zips are under 4MB total instead of 87MB before)
 */

var CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
   graphql: './src/api/graphql-lambda.ts',
    api: './src/api/lambda.ts',
    refresher: './src/refresher/lambda.ts',
    cleaner: './src/cleaner/lambda.ts',
    worker: './src/worker/lambda.ts',
    test: './test/index.ts',
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'lambda'),
    filename: '[name]/[name].js', // put in own sub folder so asset deployment zip can be a bit smaller for each lambda
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs'],
  },
  externals: {
    '@aws-sdk/client-dynamodb': '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-sqs': '@aws-sdk/client-sqs',
    '@aws-sdk/lib-dynamodb': '@aws-sdk/lib-dynamodb',
  },
  plugins: [
    // new CopyWebpackPlugin({      patterns: [

    //   {
    //     from: 'node_modules/chrome-aws-lambda',
    //     to: 'worker/node_modules/chrome-aws-lambda',
    //   },
    //   { from: 'node_modules/lambdafs', to: 'worker/node_modules/lambdafs' },
    // ]}),
  ],
  module: {
    // configuration regarding modules
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [/node_modules/],
      },
      // fixes https://github.com/graphql/graphql-js/issues/1272
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      // {
      //   test: /\.json$/,
      //   use: 'json-loader',
      // },
    ],
  },
}
