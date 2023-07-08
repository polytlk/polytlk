const copy = require('rollup-plugin-copy')

module.exports = (config) => {
    console.log("config copy plugin", config)
    const newPlugins = config.plugins.filter((plugin) => plugin.name != 'copy' || plugin.name != 'commonjs')

    return { 
        ...config,
        plugins: [
            copy({
                targets: [
                  { src: 'libs/echo-plugin/PolytlkEchoPlugin.podspec', dest: 'dist/libs/echo-plugin' },
                  { src: 'libs/echo-plugin/ios', dest: 'dist/libs/echo-plugin' }
                ]
            }),
            ...newPlugins,
        ]
    }
}