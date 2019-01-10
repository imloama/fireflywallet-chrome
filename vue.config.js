// vue config file including webpack
const path = require('path');
function resolve (dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    publicPath:'/',
    //多个导出文件生成
    pages:{
        index:{
            entry: 'src/main/main.js',
            // template: 'src/main/main.html',
            filename: 'main.html',
            chunks: ['chunk-vendors', 'chunk-common', 'main']
        },
        background:{
            entry: 'src/background.js',
            template: undefined,
            filename: 'background.js'
        },

    },

    chainWebpack: (config)=>{
        config.resolve.alias
            .set('@', resolve('src/main'))
            .set('components',resolve('src/main/components'))
    }

}