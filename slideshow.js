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
        //封装一个tap事件
        tap: function (dom, callback) {
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
            showNav: true, // 是否显示显示导航栏
            isTouch: true, // 是否可以拖动
            hasHandle: true, //是否需要左右导航
            effect: "nomal", // 特效模式        nomal leftLoop
            index: 0, // 下标 
            timer: null, // 计时器
            duration: 3, // 间隔时间
            speed: 300, // 过渡函数执行时间
            navDOMHTML:''
                
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

            if(that.effect = "leftLoop"){
                that.conDOMLens += 2;

				that.conDOM.appendChild(that.conDOM.children[0].cloneNode(true));
				that.conDOM.insertBefore(that.conDOM.children[that.conDOMLens -2].cloneNode(true),that.conDOM.children[0]);
            }

            var conWidth = that.conDOMLens * that.slideWidth;
            var hdDOM = opts.navCell.replace(" li",""); 
            var navDOMFather = Help.$Q(hdDOM,that.slideDOM)[0].childNodes[1];

            var twCell = Help.wrap(that.conDOM, '<div class="tempWrap" style="overflow:hidden; position:relative;"></div>');

            that.conDOM = Help.$Q(opts.conCell, twCell)[0];

            that.conDOM.style.cssText = "width:" + conWidth + "px;" + "position:relative;overflow:hidden;padding:0;margin:0;";

            [].slice.call(that.conDOM.children, 0).forEach(function (node) {
                node.style.cssText = "display:table-cell;vertical-align:top;width:" + that.slideWidth + "px";
                Help.$Q('img', node).forEach(function (item) {
                    item.style.width = that.slideWidth + "px";
                })
            });

            if(!that.navDOM.length && !opts.navDOMHTML){
                var temp = "";
                for(var i = 0;i<that.conDOMLens-1;i++){
                    if(i == 0){
                        temp += "<li class="+that.opts.curNavClassName+"></li>"
                    }
                    temp += "<li></li>"
                };

                navDOMFather.innerHTML = temp;
            }else if(!that.navDOM.length && opts.navDOMHTML){
                var temp = "";
                for(var i = 0;i<that.conDOMLens;i++){
                    if(i == 0){
                        var str3 = that.opts.navDOMHTML.substring(0,3);
                        temp +=that.opts.navDOMHTML.replace(str3," "+str3+"class='on'").replace('$',"");
                    }
                    temp += that.opts.navDOMHTML.replace('$',"")
                }
                navDOMFather.innerHTML = temp;
            }

            this.navDOM = Help.$Q(this.opts.navCell, this.slideDOM)[0].children;
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
                that.navDOM.forEach(function (node) {
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
                that.touchinit();
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
        // 移动 ++ --
        move: function (moveStatus) {
            var that = this,
                opts = that.opts;
                // pagestate
            
            switch (moveStatus) {
                case 'add':
                    that.index++;
                    if (that.index > that.conDOMLens - 1) {
                        that.index = 0;
                    }
                    break;
                case 'sub':
                    that.index--;
                    if (that.index < 0) {
                        that.index = that.conDOMLens - 1;
                    }
                    break;
                default:
                    break;
            };
            Help.addTransition(that.conDOM, opts.speed);
            Help.setTranslateX(that.conDOM, -that.index * that.slideWidth)
            that.switchNav();
        },

        // autoPlay
        autoplay: function () {
            var that = this;
            opts = that.opts;

            that.timer = setInterval(function () {
                that.move('add');
            }, opts.duration * 1000);

            Help.transitionEnd(that.conDOM, function () {
                Help.removeTransition(that.conDOM); //清除过渡
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
                that.navDOM[that.index].classList.add(opts.curNavClassName)
            } else {
                that.navDOM[current].classList.add(opts.curNavClassName)
            }
            that.pageStateEvent();
            
        },
        pageStateEvent:function(){
            var that = this;
            if(that.pageStateDOM){
                that.pageStateDOM.innerHTML = "<span>"+(that.index+1)+"/"+that.conDOMLens+"</span>"
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
                    var target = -me.slideWidth * index;
                    me.index = index;
                    me.switchNav()
                    Help.addTransition(me.conDOM, opts.speed);
                    Help.setTranslateX(me.conDOM, target);
                    me.resetInterval(me);
                }, false)
            })
        },

        // 重置定时器
        resetInterval(context) {
            var that = this,
                opts = that.opts;
            clearInterval(context.timer);
            context.reset();
            if (context.opts.isLoop) {
                that.autoplay();
            };

        },

        // 上一页 和 下一页
        pageNav: function () {
            var that = this,
                opts = that.opts;
            var prevDOM = Help.$Q(opts.prev, that.slideDOM)[0];
            var nextDOM = Help.$Q(opts.next, that.slideDOM)[0];
            prevDOM.addEventListener('click', function () {
                that.resetInterval(that);
                that.move('sub');
            }, false);
            nextDOM.addEventListener('click', function () {
                that.resetInterval(that);
                that.move('add');
            }, false);
        },

        // touch启动
        touchinit: function () {
            var that = this,
                opts = that.opts;

            that.conDOM.addEventListener('touchstart', function (e) {
                that.touchstart(e)
            }, false);
            that.conDOM.addEventListener('touchmove', function (e) {
                that.touchmove(e)
            }, false);
            window.addEventListener('touchend', function (e) {
                that.touchend(e)
            }, false);
        },
        // touch事件
        touchstart: function (e) {
            var that = this,
                opts = that.opts;
            clearInterval(that.timer);
            that.startX = e.touches[0].clientX;
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
        }
    };

    var slide = function (options) {
        return new Slide(options)
    };

    window.slide = slide;
})(window)
