const path = require('path');

module.exports = {
    resolve: {
        alias: {
            'monaco-editor': path.resolve(__dirname, '../node_modules/monaco-editor')
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ttf$/,
                use: ['file-loader']
            }
        ]
    },
    plugins: [
        new (require('webpack')).DefinePlugin({
            'process.env': JSON.stringify(process.env)
        })
    ]
};
