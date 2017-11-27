/**
 * 目标:制作轮播图原生js插件
 * author:jorden
 * startDate:2017-11-24 11:35
 * */
;
(function (win) {
    var $Q = function (select, context) {
        var context = context || document;
        return context.querySelectorAll(select);
    };
    //返回角度  
    var GetSlideAngle = function (dx, dy) {
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
    var isTouchPad = /hp-tablet/gi.test(navigator.appVersion);
    var hasTouch = "ontouchstart" in window && !isTouchPad;

    function Slide(options) {
        var defaultOpts = {
            pagenation: true,
            autoplay: false,
            ulDOM: null,
            allLiDOM: null,
            pageDOM: null,
            timer: null,
            index: 1,
        }
        this.opts = Object.assign(defaultOpts, options);
        this.wrap = this.opts.wrap || document.body;
        this.wrap.style.height = this.opts.wrapHeight;
        this.startX = 0;
        this.startY = 0;
        this.initX = 0;
        this.init();

    };

    Slide.prototype = {
        /**
         * 初始入口
         * 功能：1.自主渲染内容页面 2. 给页面添加动态效果 3. 启动延迟函数 
         * 
         */
        init: function () {
            var me = this,
                opts = me.opts;
            me.renderHtml(opts.content);
            me.setting();
            me.showBtn(opts.index);
            if (opts.autoplay) {
                me.loop();
            };
            me.ulDOM.addEventListener('touchstart', function (e) {
                me.touchstart(e)
            }, false);
            me.ulDOM.addEventListener('touchmove', function (e) {
                me.touchmove(e)
            }, false);
            me.ulDOM.addEventListener('touchend', function (e) {
                me.touchend(e)
            }, false);
        },
        renderHtml: function (content) {
            var me = this,
                opts = me.opts;
            var ulNode = this.renderUl(content);
            me.wrap.appendChild(ulNode);
            if (me.opts.pagenation) {
                var pageNode = me.renderPagenation(content);
                me.wrap.appendChild(pageNode);
                me.pageDOM.style.left = "calc(50% - " + parseInt(me.pageDOM.offsetWidth / 2) + "px)";
            }

        },
        renderUl: function (content) {
            var me = this,
                opts = me.opts;
            var ul = document.createElement('ul');
            var html = "",
                lens = content.length;
            for (var i = 0; i < lens; i++) {
                var item = me.renderLi(content[i]);
                html = html + item;
            };
            var first = me.renderLi(content[0]);
            var last = me.renderLi(content[lens - 1]);
            html = last + html + first;
            ul.innerHTML = html;
            return ul
        },
        renderLi: function (item) {
            return "<li><a><img width='100%' src=" + item.src + "></a></li>"
        },
        renderPagenation: function (content) {
            var me = this,
                opts = me.opts;
            me.pageDOM = document.createElement('div'),
                lens = content.length || 0;
            me.pageDOM.className = "page";

            for (var j = 0; j < lens; j++) {
                var childNode = document.createElement('span');
                me.pageDOM.appendChild(childNode)
            };

            return me.pageDOM;

        },
        setting: function () {
            var me = this,
                opts = me.opts;
            me.wrapWidth = me.wrap.offsetWidth;
            me.ulDOM = me.wrap.querySelectorAll('ul')[0];
            me.allLiDOM = me.ulDOM.querySelectorAll('li');
            me.ulDOM.style.width = me.wrapWidth * me.allLiDOM.length + 'px';
            me.ulDOM.style.transform = "translateX(" + -me.wrapWidth + "px)";
            me.ulDOM.style.transitionDuration = "0ms";
            [].slice.call(me.allLiDOM, 0).forEach(function (item) {
                item.style.width = me.wrapWidth + "px";
            })

        },
        move: function (idx) {
            var me = this,
                opts = me.opts;

            var target = -1 * me.wrapWidth * idx;
            var lens = opts.content.length;
            if (target >= 0) {
                opts.index = $Q('li', me.ulDOM).length;
                setTimeout(function () {
                    me.ulDOM.style.transitionDuration = "0ms";
                }, 0)

                me.ulDOM.style.transform = "translateX(" + -me.wrapWidth * lens + "px)";
                return;
            }
            if (-target < me.ulDOM.offsetWidth) {
                me.ulDOM.style.transitionDuration = "200ms";
                me.ulDOM.style.transform = "translateX(" + target + "px)";
            } else {
                opts.index = 1;
                setTimeout(function () {
                    me.ulDOM.style.transitionDuration = "0ms";
                    me.ulDOM.style.transform = "translateX(" + -me.wrapWidth + "px)";
                }, 0)
            };
        },

        loop: function () {
            var me = this,
                opts = me.opts;

            opts.timer = setInterval(function () {
                var that = me;
                opts.index++;
                me.showBtn(opts.index);
                console.log(opts.index)

                me.move(opts.index - 1);
                if (me.wrapWidth * opts.index > me.wrapWidth * (opts.content.length + 1)) {
                    clearInterval(me.opts.timer);
                    opts.index = 1;

                    setTimeout(function () {
                        that.ulDOM.style.transform = "translateX(" + -me.wrapWidth + "px)";
                        that.ulDOM.style.transitionDuration = "0ms";
                        that.loop()
                    }, 1000)

                }
            }, 2000)
        },
        showBtn: function (idx) {
            var me = this,
                opts = me.opts;
            var childNode = me.pageDOM.querySelectorAll('span');
            [].slice.call(childNode, 0).forEach(function (item) {
                item.style.backgroundColor = "blue";
            });
            idx = idx - 2;
            if (childNode[idx] == undefined) {
                idx = 0;
            }
            childNode[idx].style.backgroundColor = "red";
        },

        // 滑动事件
        touchstart: function (e) {
            var me = this,
                opts = me.opts;
            var point = hasTouch ? e.touches[0] : e;
            var currentDist = me.ulDOM.style.transform.replace('translateX(', "").replace("px)", "");
            currentDist = parseInt(currentDist);
            me.startX = point.pageX;
            me.startY = point.pageY;
            me.initX = point.pageX - currentDist;
        },

        touchmove: function (e) {
            var me = this,
                opts = me.opts;
            var point = hasTouch ? e.touches[0] : e;
            var dist = point.pageX - me.initX;
            me.ulDOM.style.transform = "translateX(" + dist + "px)";

        },
        touchend: function (e) {
            var me = this,
                opts = me.opts;
            var point = hasTouch ? e.changedTouches[0] : e;
            var endX = point.pageX;
            var endY = point.pageY;
            var distriX = endX - me.startX;
            var distriY = me.startY - endY;
            var angle = GetSlideAngle(distriX, distriY);
            console.log(angle, 'result');
            if (angle >= -45 && angle < 45) {
                // --->
                opts.index--;
            } else if (angle >= 45 && angle < 135) {
                //    上
            } else if (angle >= -135 && angle < -45) {
                //   下 
            } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
                //  <---
                opts.index++;
            }

            me.move(opts.index);


        }

    }

    var slide = function (params) {
        return new Slide(params);
    }
    window.slide = slide
})(window)