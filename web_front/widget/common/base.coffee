$$ = require 'common/core'

class Base
	###*
	 * @method constructor
	 * 构造器
	 *
	 * @param {Object} [opts={}] 配置项
	###
	constructor: (opts = {})->
		state = opts.state ? {}
		###*
		 * @property {String} cmpId 实例id
		###
		cmpId = opts.cmpId
		if not cmpId
			cmpId = $$.class.newId $$.cmp.getName(@)
		@cmpId = cmpId
		# 登记cmp
		$$.cmp.set @

		###*
		 * @cfg {String} renderTo 渲染目标，一般为选择器
		###
		@renderTo = opts.renderTo
		###*
		 * @cfg {Boolean} autoRender 是否自动渲染dom
		###
		@autoRender = opts.autoRender
		###*
		 * @property {Object} state cmp当前状态
		###
		@tempState = false
		@state = {}
		@oriState = {}
		@initState $.extend(true, {}, state)

		@acceptState()
		# 自动渲染模式下构造后呼叫render进行渲染
		if @autoRender is true
			@render()
	###*
	 * @method initState
	 * 实例状态初始化动作
	###
	initState: $$.emptyFn
	acceptState: ()->
		appState = @getState()
		@oriState = $.extend true, {}, appState
		return @
	###*
	 * @method getHtml
	 * 实例渲染时获取渲染html
	 *
	 * @return {String} html
	###
	getId: (idType='')->
		if idType
			idType = '-' + idType.toUpperCase()
		return @cmpId + idType
	getHtml: $$.emptyFn
	onRender: $$.emptyFn
#	resize: $$.emptyFn
	
	###*
	 * @method render
	 * 渲染dom，渲染目标为传入renderTo->实例自身renderTo->document.body
	 *
	 * @param {String} renderTo 渲染目标
	###
	render: (renderTo)->
		html = @getHtml()
		# 不存在html，取消渲染
		if not html
			return @
		$target = $(document.body)
		# 不存在传入的渲染目标，使用自身的渲染目标
		if not renderTo
			renderTo = @renderTo
		if renderTo
			@renderTo = renderTo
			$target = $(renderTo)
		$target.append html
		# 登记渲染状态
		@rendered = true
		if @onRender
			@onRender()
		return @
	###*
	 * @property {Array} _autoUpdateState
	 * 自动更新状态，处于数组中的状态在设置值时会自动更新状态
	 *
	 * @private
	###
	_autoUpdateState: []
	###*
	 * @method updateState
	 * 更新状态
	 *
	 * @param {String} key 状态key
	 * @param {Object} newV 状态新值
	###
	updateState: (key, newV)->
		if @tempState is true
			return
		state = @state
		state[key] = newV
	###*
	 * @method getState
	 * 获取实例状态值
	 *
	 * @return {Object} 实例状态值
	###
	getState: ()->
		return @state
	###*
	 * @method destroy
	 * 销毁实例
	###
	destroy: (withDom=true)->
		@oriState = null
		@state = null
		@autoRender = null
		@renderTo = null
		@rendered = null
		@tempState = null
		$$.cmp.delete @cmpId
		if withDom is true
			$('#' + @cmpId).remove()
		@cmpId = null
	###*
	 * @method clone
	 * 复制实例
	###
	clone: ()->
		state = @getState()
		constructor = @constructor

		cloneCmp = new constructor {state: state}
		return cloneCmp

module.exports = Base
