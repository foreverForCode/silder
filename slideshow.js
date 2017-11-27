;
(function (window) {

    /*封装一个事件 过渡结束事件*/
    var transitionEnd = function (dom, callback) {
        //1.给谁加事件
        //2.事件触发后处理什么业务
        if (!dom || typeof dom != 'object') {
            //没dom的时候或者不是一个对象的时候 程序停止
            return false;
        }
        dom.addEventListener('transitionEnd', function () {
            callback && callback();
        });
        dom.addEventListener('webkitTransitionEnd', function () {
            callback && callback();
        });
    }

    //封装一个tap事件
    var tap = function (dom, callback) {
        if (!dom || typeof dom != 'object') {
            //没dom的时候或者不是一个对象的时候 程序停止
            return false;
        }

        var isMove = false; //是否滑动过
        var time = 0; //刚刚触摸屏幕的事件  touchstart的触发事件

        dom.addEventListener('touchstart', function () {
            //记录触发这个事件的时间
            time = Date.now(); //时间戳 毫秒
        });
        dom.addEventListener('touchmove', function () {
            isMove = true;
        });
        win.addEventListener('touchend', function (e) {
            //1.没有滑动过
            //2.响应事件在150ms以内   要求比click要响应快
            if (!isMove && (Date.now() - time) < 150) {
                callback && callback(e);
            }

            //重置参数
            isMove = false;
            time = 0;
        });

    }
    // 获取节点
    var $Q = function (select, context) {
        context = context || document;
        return context.querySelectorAll(select);
    }
    // 对象合并
    var extend = function (target, source) {
        return Object.assign(JSON.parse(JSON.stringify(target)), source)
    }

    var Slide = function (options) {
        var defaultOpts = {
            isLoop: true,             // 是否循环播放
            showPage: false,          // 是否显示显示导航栏
            wrap: '',                 // 大盒子
            ulDOM: '',                // 图片Ul
            allLiDOM: null,           // 图片列表
            navDOM: '',               // 导航Ul
            index: 1,                 
            timer: null,
            duration: 2000 // 间隔时间
        };
        this.opts = extend(defaultOpts, options || {});
        this.wrap = $Q(this.opts.wrap)[0];
        this.ulDOM = $Q(this.opts.ulDOM, this.wrap)[0];
        this.allLiDOM = $Q('li', this.ulDOM);
        this.navDOM = $Q(this.opts.navDOM, this.wrap)[0];
        this.imgWidth = this.wrap.offsetWidth;
        this.navDots = $Q('li', this.navDOM);
        this.index = this.opts.index;
        this.timer = this.opts.timer;
        this.startX = 0;
        this.moveX = 0;
        this.distanceX = 0;
        this.isMove = false;
        this.init();
    };
    Slide.prototype = {
        init: function () {
            var that = this,
                opts = that.opts;
            if (opts.isLoop) {
                that.autoplay()
            };

            that.ulDOM.addEventListener('touchstart', function (e) {
                that.touchstart(e)
            }, false);
            that.ulDOM.addEventListener('touchmove', function (e) {
                that.touchmove(e)
            }, false);
            window.addEventListener('touchend', function (e) {
                that.touchend(e)
            }, false);
            if(!that.opts.showPage){
                that.navDOM.style.display="none";
            }
        },
        // 重置参数
        reset: function () {
            var that = this,
                opts = that.opts;

            that.startX = 0;
            that.moveX = 0;
            that.distanceX = 0;
            that.isMove = false;

        },
        // 添加过渡函数
        addTransition: function () {
            var that = this,
                opts = that.opts;
            that.ulDOM.style.transition = "all 0.3s";
            that.ulDOM.style.webkitTransition = "all 0.3s"; /*做兼容*/
        },
        // 移除过渡函数
        removeTransition: function () {
            var that = this,
                opts = that.opts;
            that.ulDOM.style.transition = "none";
            that.ulDOM.style.webkitTransition = "none"; /*做兼容*/
        },
        // 定位translateX的值
        setTranslateX: function (translatex) {
            var that = this,
                opts = that.opts;
            that.ulDOM.style.transform = "translateX(" + translatex + "px)";
            that.ulDOM.style.webkitTransition = "translateX(" + translatex + "px)"
        },
        // autoPlay
        autoplay: function () {
            var that = this;
            opts = that.opts;
            that.index = 1;
            that.timer = setInterval(function () {
                that.index++;
                that.addTransition();
                that.setTranslateX(-that.index * that.imgWidth)
            }, opts.duration);

            transitionEnd(that.ulDOM, function () {
                if (that.index > that.allLiDOM.length - 2) {
                    that.index = 1
                } else if (that.index <= 0) {
                    that.index = that.allLiDOM.length - 2
                };
                that.removeTransition(); //清除过渡
                that.setTranslateX(-that.index*that.imgWidth)
                that.switchNav();
            })
        },
        // 导航状态切换
        switchNav: function () {
            var that = this,
                opts = that.opts;
            that.navDots.forEach(function (item) {
                item.className = "";
            });

            that.navDots[that.index - 1].className = "now"
        },
        // touch
        touchstart: function (e) {
            var that = this,
                opts = that.opts;
            clearInterval(that.timer);
            that.startX = e.touches[0].clientX;
        },
        touchmove: function (e) {
            var that = this,
                opts = that.opts;
            that.moveX = e.touches[0].clientX; //滑动时候的X
            that.distanceX = that.moveX - that.startX; //计算移动的距离

            that.removeTransition(); //清除过渡
            that.setTranslateX(-that.index * that.imgWidth + that.distanceX); //实时的定位
            that.isMove = true; //证明滑动过
        },
        touchend: function (e) {
            var that = this,
                opts = that.opts;
            // 滑动超过 1/3 即为滑动有效，否则即为无效，则吸附回去
            if (that.isMove && Math.abs(that.distanceX) > that.imgWidth / 3) {
                //5.当滑动超过了一定的距离  需要 跳到 下一张或者上一张  （滑动的方向）*/
                if (that.distanceX > 0) { //上一张
                    that.index--;
                } else { //下一张
                    that.index++;
                }
            }
            that.addTransition(); //加过渡动画
            that.setTranslateX(-that.index * that.imgWidth); //定位

            that.reset();
            //加定时器
            clearInterval(that.timer); //严谨 再清除一次定时器
            if (that.opts.isLoop) {
                that.timer = setInterval(function () {
                    that.index++; //自动轮播到下一张
                    that.addTransition(); //加过渡动画
                    that.setTranslateX(-that.index * that.imgWidth); //定位
                }, that.opts.duration);
            }

            transitionEnd(that.ulDOM, function () {
                if (that.index > that.allLiDOM.length - 2) {
                    that.index = 1
                } else if (that.index <= 0) {
                    that.index = that.allLiDOM.length - 2
                };
                that.switchNav();
            })
        }
    };

    var slide = function (options) {
        return new Slide(options)
    };

    window.slide = slide;
})(window)