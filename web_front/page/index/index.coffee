Panel = require "panel"
PageViews = require "pageData/pageviews"
LoginReg = require "pageData/loginreg"
WidgetUsage = require "pageData/widgetusage"

class Index
	constructor: (opts = {})->
		opts.cls = 'statistic-container'
		opts.leftCls = 'left-tab-cls'
		opts.rightCls = 'right-tab-cls'
		opts.leftItems = [
			{
				title: '页面浏览',
				cmpTarget: PageViews
			},
			{
				title: '注册登陆',
				cmpTarget: LoginReg
			},
			{
				title: '组件使用',
				cmpTarget: WidgetUsage
			}
		]
		opts.welcomeHtml = "<div class='welcome'>welcome you</div>"
		panel = new Panel opts
		panel.render $('.container')

# Init = ->
# 	opts = {}
# 	opts.cls = 'statistic-container'
# 	opts.leftItmes = [
# 		{
# 			title: 'AAA',
# 			cmpTarget: 'AAA'
# 		},
# 		{
# 			title: 'BBB',
# 			cmpTarget: 'BBB'
# 		},
# 		{
# 			title: 'CCC',
# 			cmpTarget: 'CCC'
# 		}
# 	]
# 	new Panel(opts)
# 	console.log "yoyoyo"
# 	console.log 'fuck me....'

module.exports  = Index