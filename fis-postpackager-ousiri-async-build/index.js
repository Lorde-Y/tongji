/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

var defaultSettings = {
    scriptTag : '<!--SCRIPT_PLACEHOLDER-->',
    styleTag : '<!--STYLE_PLACEHOLDER-->',
    resourceMapTag : '<!--RESOURCEMAP_PLACEHOLDER-->',
    type : 'mod',
    output: 'pkg/${id}_min_${hash}.js'
}, LINE_BREAK = '\r\n';

//var stable = require("stable");

module.exports = function (ret, conf, settings, opt) {

    settings = fis.util.merge(defaultSettings, settings);

    function calFileDepsFromId(id, pageRes, opts){
        pageRes = pageRes || {};
        opts = opts || {};
        var queue = [id], deps = {}, asyncDeps = [],
            cssDeps = {};
        while(queue.length){
            var curId = queue.pop();
            if(pageRes[curId]){
                continue;
            }
            if(!ret.ids[curId]){
                !opts.ignores[curId] && fis.log.notice(curId + ' is not exists!');
                continue;
            }
            var curFile = ret.ids[curId];
            if(curFile.isCssLike){
                // todo handle css
                cssDeps[curId] = curFile;
                continue;
            }
            if(!curFile.isJsLike){
                continue;
            }
            deps[curId] = curFile;
            if(curFile.requires && curFile.requires.length){
                curFile.requires.forEach(function(depId){
                    if(depId!=curId && !deps[depId]){
                        queue.unshift(depId);
                    }
                })
            }
            if(curFile.extras && curFile.extras.async && curFile.extras.async.length){
                curFile.extras.async.forEach(function(asyncDepId){
                    if(asyncDepId!=curId && !deps[asyncDepId] && !asyncDeps[asyncDepId]){
                        var asyncFile = ret.ids[asyncDepId];

                        if(!asyncFile){
                            !opts.ignores[asyncDepId] && fis.log.notice(asyncDepId + ' is not exists!');
                            return;
                        }
                        asyncDeps.push(asyncDepId);
                        if(asyncFile.requires && asyncFile.requires.length){
                            asyncFile.requires.forEach(function(asyncDepId) {
                                var asyncDepFile = ret.ids[asyncDepId];
                                if(!asyncDepFile){
                                    !opts.ignores[asyncDepId] && fis.log.notice(asyncDepId + ' is not exists!');
                                    return;
                                }
                                //console.log(asyncDepId, asyncDepFile);
                                if (asyncDepFile.isCssLike) {
                                    cssDeps[asyncDepId] = asyncDepFile;
                                }
                                if (asyncDepFile.isJsLike) {
                                    asyncDeps.push(asyncDepId);
                                }
                            });
                        }
                    }
                });
            }
        }
        return {deps: deps, cssDeps: cssDeps, asyncDeps: asyncDeps};
    }

    var depMap = {};

    function analyzeHtmlDepsAndAsync(file, opts){
        var asyncList = file.extras && file.extras.async || [],
            pageRes = {}, pagePkg = {}, cssDeps = {}, asyncDeps = [],
            pageDepMap = {};

        asyncList.forEach(function(asyncId){
            //if(!depMap[asyncId]){
            //    depMap[asyncId] = calFileDepsFromId(asyncId, pageRes, opts);
            //}
            if(opts.libs[asyncId]){
                if(!depMap[asyncId]){
                    depMap[asyncId] = calFileDepsFromId(asyncId, pageRes, opts);
                }
                pageDepMap[asyncId] = depMap[asyncId];
            }else{
                if(!pageDepMap[asyncId]){
                    pageDepMap[asyncId] = calFileDepsFromId(asyncId, pageRes, opts);
                }
            }
            pageRes = fis.util.merge(pageRes, pageDepMap[asyncId].deps);
            cssDeps = fis.util.merge(cssDeps, pageDepMap[asyncId].cssDeps);
            asyncDeps = asyncDeps.concat(pageDepMap[asyncId].asyncDeps);
        });

        var actualAsyncDeps = {};
        asyncDeps.forEach(function(asyncDepId){
            if(!pageRes[asyncDepId]){
                actualAsyncDeps[asyncDepId] = ret.ids[asyncDepId];
            }
        });

        /*console.log(file.subpath, Object.keys(pageRes),
         Object.keys(cssDeps), Object.keys(actualAsyncDeps));

         for(var key in pageDepMap){
         console.log(key, ':', Object.keys(pageDepMap[key].deps));
         }*/

        return {
            pageRes: pageRes,
            cssDeps: cssDeps,
            asyncDeps: actualAsyncDeps,
            depMap: pageDepMap // contains: deps, cssDeps, asyncDeps
        };
    }

    function getUri(id){
        return ret.map.res[id].uri;
    }

    function injectCss(content, cssDeps){
        var html = '';
        for(var cssId in cssDeps){
            var cssFile = cssDeps[cssId];
            if(opt.pack && settings.cssInline){
                html += '<style>'+cssFile.getContent()+'</style>'+LINE_BREAK;
            }else{
                html += '<link rel="stylesheet" type="text/css" href="'+getUri(cssId)+'">'+LINE_BREAK;
            }
        }
        if (content.indexOf(settings.styleTag) !== -1){
            content = content.replace(settings.styleTag, html);
        }else{
            content = content.replace(/<\/head>/, html + LINE_BREAK);
        }
        return content;
    }

    var combineCache = {};
    function generatePackageFile(depMap){
        for(var id in depMap){
            var index = 0, content = '';
            if(combineCache[id]){
                continue;
            }
            var deps = depMap[id].deps;

            for(var fid in deps){
                var f = ret.ids[fid],
                    c = f.getContent();
                if(c){
                    if(index++>0){
                        content += LINE_BREAK + ';';
                    }
                }
                content += c;
            }
            var has = Object.keys(deps);

            var subpath = settings.output.replace('${id}', id)
                .replace('_${hash}', ''/*fis.util.md5(stable(has).join(','), 5)*/);

            //console.log(id, subpath, conf, settings);
            subpath = settings.dest && settings.dest[id] || subpath;
            //console.log(id, subpath, settings.dest, settings.dest[id]);

            var file = fis.file(fis.project.getProjectPath(), subpath);


            file.setContent(content);
            ret.pkg[file.subpath] = file;
            var combinedId = id + '.min';
            ret.map.pkg[combinedId] = {
                uri: file.getUrl(opt.hash, opt.domain),
                type: 'js',
                has: has
            };
            combineCache[id] = true;
            //console.log('id', id);
        }



    }

    function generateJSDepList(id){
        var file = ret.ids[id], list = [];
        if(file.requires && file.requires.length){
            file.requires.forEach(function(r){
                var rFile = ret.ids[r];
                if(rFile.isJsLike){
                    list.push(r);
                }
            });
        }
        return list;
    }

    function generateSourceMap(analysis){

        var resourceMap = {res: {}, pkg: {}};

        // process depMap
        if(opt.pack) {
            var index = 0;
            for (var p in analysis.depMap) {
                var combinedId = p + '.min', depDict = analysis.depMap[p].deps,
                    pName = 'p' + index;
                for (var fid in depDict) {
                    resourceMap.res[fid] = {
                        //deps: depDict[fid].requires,
                        pkg: pName
                    };

                    var deps = generateJSDepList(fid);
                    if (deps.length) {
                        resourceMap.res[fid].deps = deps;
                    }
                }

                resourceMap.pkg[pName] = {url: ret.map.pkg[combinedId].uri}; // todo do i need to add deps?
                index++;
            }
        }else{
            for(var depId in analysis.pageRes){
                resourceMap.res[depId] = {url: getUri(depId)};
                var deps = generateJSDepList(depId);
                if(deps.length){
                    resourceMap.res[depId].deps = deps;
                }
            }
        }

        // process asyncMap
        for(var asyncId in analysis.asyncDeps){
            resourceMap.res[asyncId] = {url: getUri(asyncId)};
            var deps = generateJSDepList(asyncId);
            if(deps.length){
                resourceMap.res[asyncId].deps = deps;
            }
        }

        return resourceMap;
    }

    function modJsCodeGen(map){
        return 'require.resourceMap(' + JSON.stringify(map, null, opt.optimize ? null : 4) + ');';
    }

    function injectResourceMap(content, resourceMap){
        var html = '<script>'+modJsCodeGen(resourceMap)+'</script>';
        if (content.indexOf(settings.resourceMapTag) !== -1){
            content = content.replace(settings.resourceMapTag, html);
        }else{
            content = content.replace(/<\/body>/, html + LINE_BREAK);
        }
        return content;
    }

    function removeScriptPlaceHolder(content){
        content = content.replace(settings.scriptTag, '');
        return content;
    }

    //if(opt.pack){//命令行加上了 -p
    //console.log(opt);
    var libDict = {}, ignoreDict = {};
    (settings.libs || []).forEach(function(lib){
        libDict[lib] = true;
    });
    (settings.ignores || []).forEach(function(ignore){
        ignoreDict[ignore] = true;
    });

    fis.util.map(ret.src, function (subpath, file) {
        if(subpath.indexOf('SimpleListView.js')!=-1){
            //    console.log(file);
        }
        if(file.isHtmlLike) {
            //if(subpath.indexOf('courseList.html')!=-1) {
            //console.log(file);
            //}

            //console.log(subpath, file.requires, file.extras && file.extras.async);
            var analysis = analyzeHtmlDepsAndAsync(file, {
                libs: libDict,
                ignores: ignoreDict
            });
            var content = file.getContent();
            content = injectCss(content, analysis.cssDeps);
            //console.log(analysis.depMap);
            if(opt.pack) {
                generatePackageFile(analysis.depMap);
            }
            //console.log(subpath, analysis.asyncDeps);
            var resourceMap = generateSourceMap(analysis);
            content = injectResourceMap(content, resourceMap);
            content = removeScriptPlaceHolder(content);
            //console.log(content);
            file.setContent(content);
            //console.log(file.useCache);
            if(file.useCache){
                ret.pkg[file.subpath] = file;
            }
            //console.log(JSON.stringify(resourceMap));
            //}
        }

    });
    //}

};