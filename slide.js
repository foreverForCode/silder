/**
 * 目标:制作轮播图原生js插件
 * author:jorden
 * startDate:2017-11-24 11:35
 * */

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
    this.wrap.style.height = this.opts.wrapHeight;
    this.ulDOM = this.opts.ulDOM;
    this.allLiDOM = this.opts.allLiDOM;
    this.pageDOM = this.opts.pageDOM;
    this.content = this.opts.content;
    this.wrapWidth = 0;
    this.delay = null;
    this.isMoving = this.opts.isMoving;
    this.index = this.opts.index;

    this.init();

};

Slide.prototype = {
    /**
     * 初始入口
     * 功能：1.自主渲染内容页面 2. 给页面添加动态效果 3. 启动延迟函数 
     * 
    */
    init: function () {
        var that = this;
        that.renderHtml(that.content);
        that.setting();
        that.delay = setTimeout(that.move(that), that.opts.timer)
    },
    renderHtml: function (content) {
        var ulNode = this.renderUl(content);
        this.wrap.appendChild(ulNode);
        if (this.opts.pagenation) {
            var pageNode = this.renderPagenation(content);
            this.wrap.appendChild(pageNode);
            this.pageDOM.style.left = "calc(50% - " + parseInt(this.pageDOM.offsetWidth / 2) + "px)";
        }

    },
    renderUl: function (content) {
        var ul = document.createElement('ul');
        var html = "",
            lens = content.length;
        for (var i = 0; i < lens; i++) {
            var item = this.renderLi(content[i]);
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
        this.pageDOM = document.createElement('div'),
            lens = content.length;
        this.pageDOM.className = "page";

        for (var j = 0; j < lens; j++) {
            var childNode = document.createElement('span');
            this.pageDOM.appendChild(childNode)
        };

        return this.pageDOM;

    },
    setting: function () {
        var me = this;
        this.wrapWidth = this.wrap.offsetWidth;
        this.ulDOM = this.wrap.querySelectorAll('ul')[0];
        this.allLiDOM = this.ulDOM.querySelectorAll('li');
        this.ulDOM.style.width = this.wrapWidth * this.allLiDOM.length + 'px';
        this.ulDOM.style.transform = "translateX(0px)";
        [].slice.call(this.allLiDOM, 0).forEach(function (item) {
            item.style.width = me.wrapWidth + "px";
        })

    },
    moveaction: function (that, target) {

        var me = that,
            temp = {};
        clearInterval(temp.timer);
        temp.timer = setInterval(function () {
            var current = parseInt(me.ulDOM.style.transform.replace("translateX(", "").replace("px)", ""));
            console.log(current, "current")
            var speed = (target - current) / 10;
            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
            console.log(current, target, speed)
            if (current == target) {
                clearInterval(temp.timer);
                if (me.index >= me.allLiDOM.length / 2) {
                    me.index = 0;
                    me.ulDOM.style.transform = "translateX(0px)";
                };
                me.delay = setTimeout(me.move(me), me.opts.timer);
                return; //神级return 因为有return的存在，避免了回退 
            };
            var diff = current + speed;
            var temps = "translateX(" + diff + "px)";
            console.log(temps, 'temps')
            me.ulDOM.style.transform = temps;
        }, 60)
    },
    move: function (that) {
        that.index++;
        that.isMoving = true;
        var target = -1 * that.wrapWidth * that.index;
        that.moveaction(that, target);
        var tempIndex = that.index;
        if (that.index >= that.allLiDOM.length / 2) {
            tempIndex = 0;
        }
        that.showBtn(tempIndex)
    },
    showBtn: function (idx) {
        var that = this;
        var childNode = that.pageDOM.querySelectorAll('span');
        [].slice.call(childNode, 0).forEach(function (item) {
            item.style.backgroundColor = "blue";
        });
        childNode[idx].style.backgroundColor = "red";
    }
}