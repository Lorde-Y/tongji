var projConf = {
    "subPath": "rp",
    "cdnRoot": {
        "js": "http://oss2.rabbitpre.com",
        "css": "http://oss2.rabbitpre.com",
        "img": "http://oss2.rabbitpre.com"
    },
    "htdocs": ""
};

fis.config.set('project.exclude', /((?:^|\/)_.*\.(?:scss))|(.*\.inline\.html)|(readme\.md)|(fis\-conf)|(layout\.jade)|(base\.jade)/i);

fis.config.merge({
    modules: {
        parser: {
            less: 'less',
            coffee: 'coffee-script',
            jade: 'jade'
        },
        postprocessor: {
            //fis-postprocessor-jswrapper        自动为代码添加amd包装代码，在代码编写时就无需手动添加，使得编写前端模块化代码的开发体验与Node.js一致，已内置。
            //fis-postprocessor-require-async 识别代码中的 require.async('path/to/js') ，将动态加载的组件信息加入map.json中，方便后续在打包和资源管理等插件中调用。
            js: "jswrapper, require-async",
            coffee: "jswrapper, require-async",
            html: "require-async",
            less: 'pleeease',
            css: 'pleeease'
        },
        prepackager: ['csswrapper', 'ousiri-async-build'],
        spriter: 'csssprites',
        optimizer : {
            js: 'uglify-js',
            html: 'html-minifier',
            jade: 'html-minifier',
            css : 'clean-css'
        }
    },
    settings: {
        postprocessor: {
            jswrapper: {
                type: 'amd'
            },
            pleeease: {
                rem: false
            }
        },
        postpackager : {
             modjs : {
                subpath : 'map/map.js'
            }
        },
        prepackager: {
            'ousiri-async-build': {
                libs: [],
                ignores: [],
                cssInline: true,
                useInlineMap: true,
                cssPack: true
            }
        },
        spriter: {
            csssprites: {
                margin: 10,
                layout: 'matrix',
                htmlUseSprite: true,
            }
        }
    },
    roadmap: {
        ext: {
            less: 'css',
            coffee: 'js',
            jade: 'html'
        },
        domain: {
            "**.js": projConf.cdnRoot.js + '/' + projConf.subPath,
            "**.coffee": projConf.cdnRoot.js + '/' + projConf.subPath,
            "**.css": projConf.cdnRoot.css + '/' + projConf.subPath,
            "**.less": projConf.cdnRoot.css + '/' + projConf.subPath,
            "**.png": projConf.cdnRoot.img + '/' + projConf.subPath,
            "**.gif": projConf.cdnRoot.img + '/' + projConf.subPath,
            "**.jpg": projConf.cdnRoot.img + '/' + projConf.subPath,
            "**.html": projConf.htdocs + '/' + projConf.subPath,
            "**.mp3": projConf.cdnRoot.img + '/' + projConf.subPath,
            "**.ico": projConf.cdnRoot.img + '/' + projConf.subPath,
            "**.tpl": projConf.cdnRoot.js + '/' + projConf.subPath,
            "**.tpl.js": projConf.cdnRoot.js + '/' + projConf.subPath
        },
        path: [
            {
                reg: '**.png',
                query: '?t=123124132'
            },
            {
                reg: /style\.css/i,
                useSprite: true
            },
            {
                reg: /^\/page\/((?:[^\/]+\/)*)([^\/]+)\/\2\.(html)$/i,
                isMod: true,
                release: '$2',
                useDomain: true,
                extras: {
                    isPage: true
                }
            },
            {
                reg: '**/*.ico',
                useHash: true
            },
            {
                reg: projConf.jsNoWrap || '**/mod.js',
                isMod: false
            },
            {
                //xxx.inline.js/coffee 不进行 amd包装,不进行 amd包装，这个特别重要，保证index.html中的require.async能运行（当然也要生成require.resourcemap）
                reg: /inline\.(js|coffee)$/i,
                isMod: false
            },
            // 页面级 js
            // 设置 page/**.js 为 isMod 可以自动包装成 amd
            {
                reg: /^\/page\/((?:[^\/]+\/)*)([^\/]+)\/\2\.(js|coffee)$/i,
                isMod: true,
                id: 'page/$1$2'
            },
             // 去掉JS后缀
            {
                reg: /^\/page\/(.*)\.(js|coffee)$/i,
                isMod: true,
                id: 'page/$1'
            },
            // widget 级 js
            {
                reg: /^\/widget\/((?:[^\/]+\/)*)([^\/]+)\/\2\.(js|coffee)$/i,
                isMod: true,
                id: '$1$2'
            },
            {
                reg: /^\/widget\/(.*)\.(js|coffee)$/i,
                isMod: true,
                id: '$1'
            },
            {
                reg: /^\/static\/js\/(.*\.(js|coffee))$/i,
                isMod: false
            },
            {
                reg: /^\/page\/(.*)\.(css|scss|less)$/i,
                id: '$1',
                userMap: false,
                useOptimizer: true,
                release: 'page/$1',
                extras: {
                    isCss: true
                }
            },
            {
                reg: /^\/widget\/(.*)\.async\.(css|scss|less)$/i,
                isMod: true,
                id: '$1.async.$2',
                useOptimizer: true,
                extras: {
                    wrapcss: true
                }
            }
        ]
    },
    // pack: {
    //      'pkg/aio.css' : ['page/*.css', /^\/page\/(.*)\.(css|scss|less)$/i],
    //      'pkg/aio.js' : [/^\/page\/((?:[^\/]+\/)*)([^\/]+)\/\2\.(js|coffee)$/i,/^\/widget\/((?:[^\/]+\/)*)([^\/]+)\/\2\.(js|coffee)$/i],
    // },
    deploy: {
        dist: {
            to: '../dist/'
        }
    }
});