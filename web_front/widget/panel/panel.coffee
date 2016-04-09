Base = require "common/base"

class Panel extends  Base
	constructor: (opts)->
		@renderDomCls = opts.renderDom
		@cls = opts.cls ? ''
		@leftCls = opts.leftCls ? ''
		@rightCls = opts.rightCls ? ''
		@leftItems = opts.leftItems ? []
		@cmpTarget = opts.cmpTarget ? []
		@welcomeHtml = opts.welcomeHtml ? "<div class='welcome'>welcome you</div>"
		super()

	forEachItem: ()->
		itemLI = ''
		for key in @leftItems
			@cmpTarget.push key.cmpTarget
			itemLI += "<li>#{key.title}</li>"
		return itemLI

	getHtml: ()->
		html = "<div id='#{@cmpId}' class='#{@cls}'>
					<div id='left-bar' class='#{@leftCls}'>
						<div class='items-list'>
							<ul>
								#{@forEachItem()}
							</ul>
						</div>
					</div>
					<div id='right-bar' class='#{@rightCls}'>
						#{@welcomeHtml}
						<div class='data-container'></div>
					</div>
				</div>"
		return html

	onRender: ()->
		_this = @
		$cmp = $('#'+@cmpId)
		$cmp.on 'click', '.items-list li', ()->
			idx = $(@).index()
			_this.setActive idx

	setActive: (idx)->
		$cmp = $('#'+@cmpId)
		$cmp.find('.welcome').remove()
		currCmpTarget = @cmpTarget[idx]
		$li = $cmp.find('.items-list li')
		$activeLi = $li.eq(idx)
		if $activeLi.hasClass 'active-li'
			return
		$li.removeClass('active-li')
		$activeLi.addClass('active-li')
		@showRightTab currCmpTarget, $activeLi, idx

	showRightTab: (currCmpTarget, $activeLi, idx)->
		$cmp = $('#'+@cmpId)
		$rightCls = $cmp.find('#right-bar')
		$dataContainer = $rightCls.find('.data-container')
		$containerChild = $dataContainer.children("div")
		$containerChild.hide()
		if ($activeLi.attr('data-rended')) is 'true'
			@cmpTarget[idx].show()
			return
		$activeLi.attr 'data-rended', 'true'
		currTarget = new currCmpTarget()
		#设置为当前对象实例
		@cmpTarget[idx] = currTarget
		currTarget.render $dataContainer

module.exports = Panel