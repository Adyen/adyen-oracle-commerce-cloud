module.exports = function(api) {
    api.cache(true)

    const presets = [
        [
            '@babel/preset-env',
            {
                targets: {
                    chrome: '58',
                    safari: '7',
                    ie: '9',
                },
            },
        ],
    ]
    const plugins = [
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime',
    ]

    return { presets, plugins }
}
