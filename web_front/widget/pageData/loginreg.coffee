Base = require "common/base"

class LoginReg extends  Base
	constructor: (opts)->
		super()

	forEachItem: ()->
		console.log @leftItems
		itemLI = ''
		for key in @leftItems
			itemLI += "<li>#{key.title}</li>"
		return itemLI

	getHtml: ()->
		html = "<div id='#{@cmpId}'>login reg</div>"
		return html

	# onRender: ()->
	# 	if not @renderDomCls?
	# 
	show: ()->
		$cmp = $('#'+@cmpId)
		$cmp.show()

	hide: ()->
		$cmp = $('#'+@cmpId)
		$cmp.hide()


module.exports = LoginReg