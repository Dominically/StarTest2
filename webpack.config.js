module.exports = {
    entry: "./main.js",
    experiments: {
        asyncWebAssembly: true
    },
    module: {
        rules: [
            {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
            },
        ],
    }
}