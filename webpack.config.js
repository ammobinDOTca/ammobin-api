/**
 * package up each lambda individually
 * saved 600ms on init time in graphql lambda
 * and a lot in zip size (all zips are under 4MB total instead of 87MB before)
 */

const path = require('path')
module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    graphql: './src/api/graphql-lambda.ts',
    api: './src/api/lambda.ts',
    refresher: './src/refresher/lambda.ts',
    worker: './src/worker/lambda.ts',
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
    'aws-sdk': 'aws-sdk', // dont build in aws-sdk since it is already provided by lambda env
  },
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
