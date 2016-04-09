###*
 * @class RP
 * 基本命名空间
 *
 * 页面访问：
 *
 * window.com.rabbitpre
 * window.RP
 * window.$$
 *
 * 相关规范说明
 *
 * 1.开发工具规范：
 *
 * 	缩进大小：2
 *
 * 	缩进方式：Tab
 *
 * 	空白符：强制显示
 *
 * 2.内部约定
 *
 * 	类实例化的参数只有一个，且参数名固定为opts
 *
 * 	每个实例拥有一个自动产生的唯一cmpId，命名方式为CMP_[类名称大写]_[实例编号，由1001开始]
 *
 * 	所有定义实例id的变量全部采用cmpId，定义实例的变量全部采用cmp
 *
 * 	变量与对象采用“谁创建，谁负责，谁销毁”原则，实例destroy时必须尽可能销毁
 *
 * 	所有需要对外开放的类全部使用{@link com.rabbitpre.Util#regObj Util.regObj}进行注册
 *
 * 3.命名规范，英文，易懂：
 *
 * 	类命名：首字母大写，驼峰式写法
 *
 * 	实例： 首字母小写，驼峰式写法
 *
 * 4.其他，后面再补
 *
 * @alias $$
 * @singleton
 * @author dd.wang; AsherTan; Jaremy Cheng; Ousiri
###
$$ = {}
if not window.com
	window.com = {}
window.com.rabbitpre = window.RP = window.$$ = $$

$$.apply = (ori, opts)->
	for key of opts
		ori[key] = opts[key]

CURR_LEVEL = 0
$$.apply $$, {
	version: 'V1.7.3'
	author: 'dd.wang; Asher Tan; Jaremy Cheng; Ousiri;'
	###*
	 * @property {Function} emptyFn
	 * 空方法
	 *
	 * @private
	 * @static
	###
	emptyFn: ()->
	###*
	 * @property {Function} emptyContent
	 * 无数据时使用的HTML
	 *
	###
	emptyContent: ()->
		return "<div class='j-empty-content empty-content'>#{$$.local.get('没有发现相关结果')}。=(:з」∠)_</div>"
	setTheme: (theme)->
	###*
	 * @property {Function} namespace
	 * 设置命名空间
	 *
	 * @private
	 * @static
	###
	namespace: (name, obj)->
		list = name.split '.'
		lastName = list.pop()
		o = $$
		for key, i in list
			if not o[key]
				o[key] = {}
			o = o[key]
		if obj
			if not $$[lastName]
				$$[lastName] = obj
			o[lastName] = obj
			obj.__name__ = lastName
		else
			obj = o[lastName]
		return obj
}

if window.console
	setTimeout ()->
		console.log("一个应用，要经历怎样的过程，才能抵达用户面前？\n一位新人，要经历怎样的成长，才能站在技术之巅？\n探寻这里的秘密；\n体验这里的挑战；\n成为这里的主人；\n加入兔展，你，可以影响世界。\n");
		console.log("请将简历发送至 %c hr@szzbmy.com（ 邮件标题请以“姓名-应聘XX职位-来自console”命名）","color:red");
		console.log("职位介绍：http://www.rabbitpre.com/job.html")
	, 500

###*
 * @class RP.class
 *
 * @alias $$.class
 * @singleton
 * @static
 * @author dd.wang; AsherTan; Jaremy Cheng; Ousiri
###
###*
 * @property {String} [ID_PREV="CMP_"]
 * 组件id前缀
 *
 * @private
 * @static
###
ID_PREV = 'CMP_'
###*
 * @property {Number} [ID_INDEX=1001]
 * 组件id索引当前累加值
 *
 * @private
 * @static
###
ID_INDEX = 1001
$$.class = {
	###*
	 * @method newId
	 * 产生一个新的实例id
	 *
	 * @param {String} [type="UNKNOWN"] 类型
	 * @return {String} 实例id
	 * @protected
	 * @static
	###
	newId: (type='UNKNOWN')->
		return ID_PREV + type.toUpperCase() + '_' + ID_INDEX++
	set: (name, obj)->
		resObj = $$.namespace name, obj
		return resObj
	get: (name)->
		return $$.namespace name
	create: (name, opts)->
		obj = @get name
		if not obj
			return
		cmp = new obj opts
		return cmp
	###*
	 * @method transformState
	 * state状态转换
	 *
	 * @protected
	 * @static
	###
	transformState: (data = {}, cfg = {})->
		state = data.state
		if not state
			state = data
			data = {}
			data.state = state
		# console.log state
		$.extend data, cfg
		return data
}

###*
 * @class RP.cmp
 *
 * @alias $$.cmp
 * @singleton
 * @static
 * @author dd.wang; AsherTan; Jaremy Cheng; Ousiri
###
###*
 * @property {String} [CMP_MAPPING={}]
 * 实例记录映射，存储每一个创建的cmp
 *
 * @private
 * @static
###
CMP_MAPPING = {}
$$.cmp = {
	###*
	 * @method set
	 * 设置实例
	 *
	 * @param {String} cmpId 实例id
	 * @param {Object} cmp 实例
	 * @return {Object} 实例本身
	 * @protected
	 * @static
	###
	set: (cmp)->
		cmpId = cmp.cmpId
		CMP_MAPPING[cmpId] = cmp
		return @
	###*
	 * @method getCmp
	 * 获取实例
	 *
	 * @param {String} cmpId 实例id
	 * @return {Object} 实例
	 * @protected
	 * @static
	###
	get: (cmpId)->
		return CMP_MAPPING[cmpId]
	###*
	 * @method delete
	 * 移除实例
	 *
	 * @param {String} cmpId 实例id
	 * @return {Object} 被移除的实例
	 * @protected
	 * @static
	###
	getName: (cmp)->
		return cmp.constructor.__name__
	getByCls: (cls)->
		$cmp = $(".#{cls}")
		cmpId = $cmp.attr 'id'
		if not cmpId
			return
		return @get cmpId
	delete: (cmpId)->
		cmp = CMP_MAPPING[cmpId]
		if cmp
			delete CMP_MAPPING[cmpId]
		return cmp
}

$$.logout = ()->
	console.log 'login out'

module.exports = $$
