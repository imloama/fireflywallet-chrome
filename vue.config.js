// vue config file including webpack
const path = require('path');
function resolve (dir) {
    return path.join(__dirname, dir)
}
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
// const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

module.exports = {
    publicPath:"",
    pages:{
        // index:{
        //     entry: 'src/main.js',
        //     template: 'public/index.html',
        //     filename: 'index.html',
        // },
    },
    productionSourceMap: false,
    runtimeCompiler: true,
    filenameHashing: false,
    chainWebpack: (config)=>{
        config.resolve.alias
            // .set('vue', resolve('node_modules')+'/vue/dist/vue.esm.js')
            .set('@', resolve('src'))
            .set('components',resolve('src/components'));
        // config.resolve.extensions: ['.js', '.vue', '.json',".css"],

        // config.externals({
        //     'es6-promise': 'Promise',
        // })

        config
            .entry('index')
            .add(resolve('src')+'/main.js')
            .end()
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
            .filename('js/[name].js');
        
        config.plugins.delete('html')
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')

        config.plugin('html')
            .use(new HtmlWebpackPlugin({
                excludeChunks: ['background','chromereload','ffw'],
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
        
        //支持打包后处理eval
        config.plugin('WebpackShellPlugin')
                  .use(new WebpackShellPlugin({
                    onBuildEnd: ['node scripts/remove-evals.js'],
                  }));
        
    }

}