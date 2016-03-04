var path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist/',
        publicPath: '/dist/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {test: /\.png/, exclude: /node_modules/, loader: "file-loader"},
            {test: /\.styl/, exclude: /node_modules/, loader: "style-loader!css-loader!stylus-loader"},
            {test: /\.js$/, exclude: /node_modules/, loader: "babel"}
        ]
    }
};