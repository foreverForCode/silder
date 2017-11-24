(function (window) {
    var $Q = function (select,content) {
        content = content || document;
        return content.querySelectorAll(select);
    }
    function Slide(options) {
        var that = this;
        var config = {
            cell:"",
            mainCls:'.bd ul',	
            navCls:'.hd ul',
            delay:0,	/*Tab延迟速度*/
			tabIndex:1,  /*默认的当前位置索引。1是第一个；tabIndex:1 时，相当于从第2个开始执行*/
			autoPage:false, /*是否自动分页，自定义如：autoPage:"<a>$</a>"*/
			autoPlay:true,	/*是否开启自动运行 true,false,  */
			autoSpeed:3000,	/*自动运行速度*/
        };
        that.opts = Object.assign(config, options);
        that.elCell = document.querySelector(opts.cell)
        that.init();
    }
    Slide.prototype = {
        init:function () {
            var that = this, opts = that.opts;
            that.mainCell = $Q(opts.mainCls,that.elCell)[0];
            that.navCell = $Q(opts.navCls,that.elCell)[0];
            that.mainSize = that.mainCell.children;
            that.mainWidth = that.elCell.offsetWidth;
        }
    }
    var slider = function (params) {
        return new Slide(params);
    }
    window.slider = slider;
})(window)