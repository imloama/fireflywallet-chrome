// vue config file including webpack
const path = require('path');
function resolve (dir) {
    return path.join(__dirname, dir)
}
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    publicPath:"",
    pages:{
        app:{
            entry: 'src/main.js',
            template: 'public/index.html',
            filename: 'index.html'
        },
    },
    productionSourceMap: false,
    runtimeCompiler: true,
    chainWebpack: (config)=>{
        config.resolve.alias
            // .set('vue', resolve('node_modules')+'/vue/dist/vue.esm.js')
            .set('@', resolve('src'))
            .set('components',resolve('src/components'));
        // config.resolve.extensions: ['.js', '.vue', '.json',".css"],

        config
            .entry('background')
            .add(resolve('src')+'/background.js')
            .end()
            .entry('chromereload')
            .add(resolve('src')+'/chromereload.js')
            .end()
            .entry('ffw')
            .add(resolve('src')+'/ffw/ffw.js')
            .end()
            .output
            .filename('[name].js');
        
        config.plugins.delete('html')
        // config.plugins.delete('preload')
        // config.plugins.delete('prefetch')

        config.plugin('html')
            .use(new HtmlWebpackPlugin({
                excludeChunks: ['background'],
                template: 'public/index.html',
                filename: 'index.html'
            }));

        config.plugin('CopyWebpackPlugin')
                .use(new CopyWebpackPlugin([
                    {
                      from: 'src/manifest.json',
                      to: 'manifest.json',
                      transform: (content) => {
                        const jsonContent = JSON.parse(content);
                        jsonContent.version = version;
                        if (config.mode === 'development') {
                          jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
                        }
                        return JSON.stringify(jsonContent, null, 2);
                      },
                    },
                    {from:'src/_locales', to: '_locales'},
                    {from:'src/icons', to: 'icons'}
                  ])
              );
        
    }

}