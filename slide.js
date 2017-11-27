/**
 * 目标:制作轮播图原生js插件
 * author:jorden
 * startDate:2017-11-24 11:35
 * */
;(function (win) {
    var $Q = function (select, context) {
        var context = context || document;
        return context.querySelectorAll(select);
    }

    function Slide(options) {
        var defaultOpts = {
            pagenation: true,
            ulDOM: null,
            allLiDOM: null,
            pageDOM: null,
            timer: 3000,
            index: 0,
            isMoving: false
        }
        this.opts = Object.assign(defaultOpts, options);
        this.wrap = this.opts.wrap || document.body;

        
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
            html += html;
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
            var me = this,opts = me.opts;
            me.wrapWidth = me.wrap.offsetWidth;
            me.ulDOM = me.wrap.querySelectorAll('ul')[0];
            me.allLiDOM = me.ulDOM.querySelectorAll('li');
            me.ulDOM.style.width = me.wrapWidth * me.allLiDOM.length + 'px';
            me.ulDOM.style.transform = "translateX(0px)";
            [].slice.call(me.allLiDOM, 0).forEach(function (item) {
                item.style.width = me.wrapWidth + "px";
            })

        },

        // move: function (that) {
        //     that.index++;
        //     that.isMoving = true;
        //     var target = -1 * that.wrapWidth * that.index;
        //     var tempIndex = that.index;
        //     if (that.index >= that.allLiDOM.length / 2) {
        //         tempIndex = 0;
        //     }
        //     that.showBtn(tempIndex)
        // },
        // showBtn: function (idx) {
        //     var that = this;
        //     var childNode = that.pageDOM.querySelectorAll('span');
        //     [].slice.call(childNode, 0).forEach(function (item) {
        //         item.style.backgroundColor = "blue";
        //     });
        //     childNode[idx].style.backgroundColor = "red";
        // }
    }

    var slide = function (params) {
        return new Slide(params);
    }
    window.slide = slide
})(window)