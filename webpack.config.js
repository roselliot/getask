const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Entry point of your application
  output: {
    filename: 'bundle.js', // Output bundle file
    path: path.resolve(__dirname, 'dist'), // Output directory
    clean: true, // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Transpile JavaScript and JSX files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/, // Handle CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML template
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve .js and .jsx files
  },
  devServer: {
    static: path.join(__dirname, 'dist'), // Serve files from the dist directory
    compress: true,
    port: 3000, // Development server port
    hot: true, // Enable hot module replacement
  },
  mode: 'development', // Set mode to development or production
};