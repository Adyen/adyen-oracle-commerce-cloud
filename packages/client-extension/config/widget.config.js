// rollup.config.js
import babel from 'rollup-plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import path from 'path'

const inputPath = path.resolve(__dirname, '../widget/AdyenPaymentWidget/js')
const widgetFilename = 'adyen-checkout'

export default {
    input: path.join(inputPath, `${widgetFilename}.js`),
    inlineDynamicImports: true,
    plugins: [
        babel({
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        targets: {
                            browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
                        },
                        useBuiltIns: 'entry',
                        corejs: '3.0.0',
                    },
                ],
            ],
            exclude: 'node_modules/**',
            plugins: ['@babel/plugin-proposal-class-properties'],
        }),
        nodeResolve({
            preferBuiltins: false,
        }),
        commonjs(),
        cleanup({ sourceMap: true, comments: 'none' }),
    ],
    output: {
        file: path.join(inputPath, `${widgetFilename}.min.js`),
        format: 'amd',
        name: 'AdyenWidget',
        sourcemap: true,
        globals: { jquery: '$', knockout: 'ko' },
    },
    external: ['jquery', 'knockout'],
    watch: {
        chokidar: { usePolling: true },
    },
}
