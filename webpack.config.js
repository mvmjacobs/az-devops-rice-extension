const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'web',
  entry: {
    rice: './src/rice.ts',
    settings: './src/settings.ts'
  },
  output: {
    filename: 'src/[name].js',
    libraryTarget: 'amd'
  },
  externals: [
    /^VSS\/.*/, /^TFS\/.*/, /^q$/
  ],
  resolve: {
    extensions: [
      '.webpack.js',
      '.web.js',
      '.ts',
      '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js', to: 'libs/VSS.SDK.min.js' },
      { from: './src/*.html', to: './' },
      { from: './marketplace', to: 'marketplace' },
      { from: './vss-extension.json', to: 'vss-extension-release.json' },
      { from: './configs/release.json', to: 'release.json' },
      { from: './LICENSE.md', to: 'LICENSE.md' }
    ])
  ]
}