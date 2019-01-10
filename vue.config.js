// vue config file including webpack
const path = require('path');
function resolve (dir) {
    return path.join(__dirname, dir)
}
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');

module.exports = {
    chainWebpack: (config)=>{
        config.resolve.alias
            .set('@', resolve('src'))
            .set('components',resolve('src/components'));
        config.entry('background')
            .add(resolve('src')+'/background.js')
            .end()
            .entry('chromereload')
            .add(resolve('src')+'/chromereload.js')
            .end()
            // .entry('manifest')
            // .add('src/manifest.json')
            // .end()
            // ;
            .output
                //.path('dist')
                .filename('[name].js');
        
        
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
                    {from:'src/locales', to: '_locales'}
                  ])
              )
    }

}