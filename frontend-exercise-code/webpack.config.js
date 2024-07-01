const path = require('path');

module.exports = {
  entry: './src/popup.js', // Tu script de entrada
  output: {
    filename: 'bundle.js', // El archivo de salida
    path: path.resolve(__dirname, 'dist'), // Directorio de salida
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
