;
(function (window) {


    // 辅助对象
    var Help = {
        /*监听过渡结束事件*/
        transitionEnd: function (dom, callback) {
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
        },
        // 获取节点
        $Q: function (select, context) {
            context = context || document;
            return context.querySelectorAll(select);
        },
        // 对象合并
        extend: function (target, source) {
            return Object.assign(JSON.parse(JSON.stringify(target)), source)
        },
        // 对内容区添加包裹层
        wrap: function (el, v) {
            var tmp = document.createElement('div');
            tmp.innerHTML = v;
            tmp = tmp.children[0];
            var _el = el.cloneNode(true);
            tmp.appendChild(_el);
            el.parentNode.replaceChild(tmp, el);
            return tmp;
        },
        // 添加过渡函数
        addTransition: function (dom, speed) {
            dom.style.transition = "all +" + speed + "+ms";
            dom.style.webkitTransition = "all " + speed + "ms"; /*做兼容*/
        },
        // 移除过渡函数
        removeTransition: function (dom) {
            dom.style.transition = "none";
            dom.style.webkitTransition = "none"; /*做兼容*/
        },
        // 定位translateX的值
        setTranslateX: function (dom, translatex) {
            dom.style.transform = "translateX(" + translatex + "px)";
            dom.style.webkitTransition = "translateX(" + translatex + "px)"
        },
    }

    var Slide = function (options) {
        var defaultOpts = {
            mainCell: '.slider', // 主节点
            conCell: '.bd ul', // 内容节点
            navCell: '.hd ul', // 导航节点
            pageCell: '.page', // 左右导航父节点
            prev: '.prev', // 上一页《
            next: '.next', // 下一页》
            curNavClassName: 'on', // 当前导航类名
            pageStateCell:'.pageState', // 1/2
            isLoop: true, // 是否循环播放
            showNav: false, // 是否显示显示导航栏
            isTouch: false, // 是否可以拖动
            hasHandle: false, //是否需要左右导航,
            effect: "leftLoop", // 特效模式        nomal leftLoop
            index: 0, // 下标 
            timer: null, // 计时器
            duration: 3, // 间隔时间
            speed: 300, // 过渡函数执行时间
            navDOMHTML:'' // 底部HTML自定义
                
        };
        this.opts = Help.extend(defaultOpts, options || {});
        this.bindData();

    };
    Slide.prototype = {
        // 常用全局对象绑定
        bindData: function () {
            var that = this,opts = that.opts;

            that.slideDOM = Help.$Q(opts.mainCell)[0]; // 主节点DOM

            that.slideWidth = that.slideDOM.offsetWidth; // 获取主节点的宽度

            that.conDOM = Help.$Q(opts.conCell, that.slideDOM)[0]; // 内容节点父对象 ---> [] 

            that.conDOMLens = that.conDOM.children.length; // 内容节点的length

            that.navDOM = Help.$Q(opts.navCell, that.slideDOM)[0].children; // 导航节点 ---> []

            that.pageDOM = Help.$Q(opts.pageCell, that.slideDOM)[0]; // 左右导航父对象

            that.pageStateDOM  = Help.$Q(opts.pageStateCell,that.slideDOM)[0];// 1/3

            that.index = that.opts.index; // index

            that.timer = that.opts.timer;

            that.effect = opts.effect;

            that.startX = 0;

            that.moveX = 0;

            that.distanceX = 0;

            that.isMove = false;

            that.renderWrap();

        },
        renderWrap: function () {
            var that = this,
                opts = that.opts;

            if(that.effect == "leftLoop"){
                that.conDOMLens += 2;

				that.conDOM.appendChild(that.conDOM.children[0].cloneNode(true));
                that.conDOM.insertBefore(that.conDOM.children[that.conDOMLens -3].cloneNode(true),that.conDOM.children[0]);
            }

            var conWidth = that.conDOMLens * that.slideWidth;
           
            var twCell = Help.wrap(that.conDOM, '<div class="tempWrap" style="overflow:hidden; position:relative;"></div>');

            that.conDOM = Help.$Q(opts.conCell, twCell)[0];
            if(that.effect == "leftLoop"){
                that.conDOM.style.cssText = "width:" + conWidth + "px;" + "position:relative;overflow:hidden;padding:0;margin:0;transform:translateX("+-that.slideWidth+"px)";
            }
            
            [].slice.call(that.conDOM.children, 0).forEach(function (node) {
                node.style.cssText = "display:table-cell;vertical-align:top;width:" + that.slideWidth + "px";
                Help.$Q('img', node).forEach(function (item) {
                    item.style.width = that.slideWidth + "px";
                })
            });
            // 处理 如果没有提供底部圆点，自动生成
            if(!that.navDOM.length && !opts.navDOMHTML){
                var temp = "";
                for(var i = 0;i<that.conDOMLens-2;i++){
                    temp += "<li></li>"
                };
            }else if(!that.navDOM.length && opts.navDOMHTML){
                var temp = "";
                for(var i = 0;i<that.conDOMLens-2;i++){
                    temp += that.opts.navDOMHTML.replace('$',"")
                }
            }
            that.navDOM = Help.$Q(that.opts.navCell, that.slideDOM)[0]
            that.navDOM.innerHTML = temp;
            that.navDOM = that.navDOM.children;
            that.navDOM[0].classList.add(opts.curNavClassName);
            
            that.init();
        },

        init: function () {
            var that = this,
                opts = that.opts;
            // 模块开关

            // 是否自动播放
            if (opts.isLoop) {
                that.autoplay()
            };
            // 是否需要底部导航
            if (opts.showNav) {
                that.clickNav();
            } else {
                [].slice.call(that.navDOM,0).forEach(function (node) {
                    node.style.display = "none";
                })
            };
            // 是否有左右导航
            if (opts.hasHandle) {
                that.pageNav();
            } else {
                that.pageDOM.style.display = "none"
            }

            // 是否可以拖动
            if (opts.isTouch) {
                that.conDOM.addEventListener('touchstart', function (e) {
                    that.touchstart(e)
                }, false);
            };
            that.pageStateEvent();

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
        // 重置定时器
        resetInterval(context){
            clearInterval(context.timer);
            context.reset();
            if (context.opts.isLoop) {
                context.timer = setInterval(function () {
                    context.index++; //自动轮播到下一张
                    Help.addTransition(context.conDOM,context.opts.speed);
                    Help.setTranslateX(context.conDOM,-context.index * context.slideWidth); //定位
                }, context.opts.duration*1000);
            };
            Help.transitionEnd(context.conDOM, function () {
                if (context.index > context.conDOMLens - 2) {
                    context.index = 1
                } else if (context.index <= 0) {
                    context.index = context.conDOMLens - 2
                };
                Help.removeTransition(context.conDOM); //清除过渡
                Help.setTranslateX(context.conDOM, -context.index * context.slideWidth)
                context.switchNav();
            })
         },
        
        // autoPlay
        autoplay: function () {
            var that = this;
            opts = that.opts;
            that.index = 1;
            that.timer = setInterval(function(){
                that.index++;
                Help.addTransition(that.conDOM,opts.speed);
                Help.setTranslateX(that.conDOM,-that.index*that.slideWidth);
            },opts.duration*1000)
           
            Help.transitionEnd(that.conDOM, function () {
                var me = that;
                if(me.effect == "leftLoop"){
                    if (me.index > me.conDOMLens - 2) {
                        me.index = 1
                    } else if (me.index <= 0) {
                        me.index = me.conDOMLens - 2
                    };
                    Help.removeTransition(me.conDOM); //清除过渡
                    Help.setTranslateX(me.conDOM, -me.index * me.slideWidth)
                }
                Help.removeTransition(me.conDOM); //清除过渡 
                me.switchNav();
            })
        },
       
        // 导航状态切换
        switchNav: function (current) {
            var that = this,
                opts = that.opts;               
            [].slice.call(that.navDOM,0).forEach(function (item) {
                item.className = "";
            });
            if (current == undefined) {
                that.navDOM[that.index-1].classList.add(opts.curNavClassName)
            } else {
                that.navDOM[current].classList.add(opts.curNavClassName)
            }
            that.pageStateEvent();         
        },
        pageStateEvent:function(){
            var that = this;
            if(that.pageStateDOM){
                that.pageStateDOM.innerHTML = "<span>"+(that.index)+"/"+(that.conDOMLens-2)+"</span>"
            }
        },
        // 导航点击事件
        clickNav: function () {
            var that = this,
                opts = that.opts;
            [].slice.call(that.navDOM,0).forEach(function (dot, index) {
                var me = that,
                    opts = that.opts;
                console.log(dot, index);
                dot.addEventListener('click', function () {
                    clearInterval(me.timer);
                    var target = -me.slideWidth * (index+1);
                    me.index = index+1;
                    me.switchNav()
                    Help.addTransition(me.conDOM, opts.speed);
                    Help.setTranslateX(me.conDOM, target);
                    me.resetInterval(me);
                }, false)
            })
        },
        move:function(status){
            var that = this,opts = that.opts;

            clearInterval(that.timer);
            switch(status){
                case 'add' :
                    that.index++;
                    break;
                case 'sub' :
                    that.index--;
                    break;
                default:break;
            };
            Help.addTransition(that.conDOM,opts.speed);
            Help.setTranslateX(that.conDOM, -that.index * that.slideWidth);   
            that.resetInterval(that);
        },    
        // 上一页 和 下一页
        pageNav: function () {
            var that = this,
                opts = that.opts;
            var prevDOM = Help.$Q(opts.prev, that.slideDOM)[0];
            var nextDOM = Help.$Q(opts.next, that.slideDOM)[0];
            prevDOM.addEventListener('click', function () {     
                that.move('sub');
            }, false);
            nextDOM.addEventListener('click', function () {           
                that.move('add');
            }, false);
        },
        // touch事件
        touchstart: function (e) {
            var that = this,
                opts = that.opts;
            clearInterval(that.timer);
            that.startX = e.touches[0].clientX;
            that.conDOM.addEventListener('touchmove', function (e) {
                that.touchmove(e)
            }, false);
            window.addEventListener('touchend', function (e) {
                that.touchend(e)
            }, false);
        },
        touchmove: function (e) {
            var that = this,
                opts = that.opts;
            clearInterval(that.timer);
            that.moveX = e.touches[0].clientX; //滑动时候的X
            that.distanceX = that.moveX - that.startX; //计算移动的距离

            Help.removeTransition(that.conDOM); //清除过渡
            Help.setTranslateX(that.conDOM, -that.index * that.slideWidth + that.distanceX); //实时的定位
            that.isMove = true; //证明滑动过
        },
        touchend: function (e) {
            var that = this,
                opts = that.opts;
            // 滑动超过 1/4 即为滑动有效，否则即为无效，则吸附回去
            if (that.isMove && Math.abs(that.distanceX) > that.slideWidth / 4) {
                //5.当滑动超过了一定的距离  需要 跳到 下一张或者上一张  （滑动的方向）*/
                if (that.distanceX > 0) { //上一张
                    that.move('sub');
                } else { //下一张
                    that.move('add')
                }
            }else{
                that.move();
            };
            that.resetInterval(that);
            that.conDOM.removeEventListener('touchmove', function (e) {
                that.touchmove(e)
            }, false);
            window.removeEventListener('touchend', function (e) {
                that.touchend(e)
            }, false);
        }
    };

    var slide = function (options) {
        return new Slide(options)
    };

    window.slide = slide;
})(window)
