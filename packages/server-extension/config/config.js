// rollup.config.js
import cleanup from 'rollup-plugin-cleanup'
import babel from 'rollup-plugin-babel'
import path from 'path'

const inputPath = path.resolve(__dirname, '../app')
export default ({ input, format }) => ({
    input,
    output: {
        file: path.join(inputPath, 'bundle.js'),
        format,
        name: 'AdyenServer',
    },
    plugins: [babel({ exclude: 'node_modules/**' }), cleanup()],
    watch: {
        chokidar: { usePolling: true },
    },
})
