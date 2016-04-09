Base = require "common/base"

class PageViews extends  Base
	constructor: (opts)->
		super()

	forEachItem: ()->
		console.log @leftItems
		itemLI = ''
		for key in @leftItems
			itemLI += "<li>#{key.title}</li>"
		return itemLI

	getHtml: ()->
		html = "<div id='#{@cmpId}'>page views</div>"
		return html

	show: ()->
		$cmp = $('#'+@cmpId)
		$cmp.show()

	hide: ()->
		$cmp = $('#'+@cmpId)
		$cmp.hide()


module.exports = PageViews