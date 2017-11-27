/*

 @Name：jeTouchSlide v2.0 触屏滑动特效插件移动版
 @Author：陈国军
 @Date：2016-2-20
 @官网：http://www.jayui.com/jetouchslide/
        
*/
;(function( window, factory) {
	if ( typeof define === "function" && define.amd ) {
        define(factory);
    } else if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory();
    } else {
        window.jeSlide = factory();
    }
})(this, function() {
    var Slide = {}, doc = document, query = "querySelectorAll", Jes = function(ele) { return doc[query](ele);  };
    Slide.extend = function(Obj, source, override) {
		if (override === undefined) override = true;
		for (var property in source) {
			if (override || !(property in Obj)) {
				Obj[property] = source[property];
			}
		}
		return Obj;
    };
    //查询样式是否存在
    Slide.hasClass = function(elem, cls) {
        elem = elem || {};
        return new RegExp("\\b" + cls + "\\b").test(elem.className);
    };
    //添加样式
    Slide.addClass = function(elem, cls) {
        elem = elem || {};
        Slide.hasClass(elem, cls) || (elem.className += " " + cls);
        elem.className = elem.className.replace(/^\s|\s$/g, "").replace(/\s+/g, " ");
        return this;
    };
    //删除样式
    Slide.removeClass = function(elem, cls) {
        elem = elem || {};
        if (Slide.hasClass(elem, cls)) {
            elem.className = elem.className.replace(new RegExp("(\\s|^)" + cls + "(\\s|$)"), "");
        }
        return this;
    };
    //事件监听器
    Slide.on = function(obj, type, callback) {
        if (obj.addEventListener) {
            obj.addEventListener(type, callback, false);
        }
        return this;
    };
    //移除事件
    Slide.removeon = function(obj, type, callback) {
        if (obj.removeEventListener) {
            obj.removeEventListener(type, callback, false);
        }
        return this;
    };
    var TouchSlide = function(options) {
		var config = {
			slideCell:"#touchSlide",//运行效果主对象！，例如 slideCell:"#touchSlide"
			titCell:".hd li", // 导航对象，当自动分页设为true时为“导航对象包裹层”
			mainCell:".bd",  // 切换对象包裹层，可以是tagName或者className
			effect:"left", // 效果，支持 left、leftLoop
			autoPlay:false,  // 自动播放
			delayTime:200, // 效果持续时间
			interTime:2500,  // 自动运行间隔
			defaultIndex:0, // 默认的当前位置索引。0是第一个； defaultIndex:1 时，相当于从第2个开始执行
			titOnClassName:"on", // 当前导航对象添加的className
			autoPage:false, // 自动分页，当为true时titCell为“导航对象包裹层”
			prevCell:".prev", // 前一页按钮
			nextCell:".next", // 后一页按钮
			pageStateCell:".pageState", // 分页状态对象，用于显示分页状态，例如：2/3
			pnLoop:true, // 前后按钮点击是否继续执行效果，当为最前/后页是会自动添加“prevStop”/“nextStop”控制样色
			startFun:null, // 每次切换效果开始时执行函数，用于处理特殊情况或创建更多效果。用法 satrtFun:function(i,c){ }； 其中i为当前分页，c为总页数
			endFun:null, // 每次切换效果结束时执行函数，用于处理特殊情况或创建更多效果。用法 endFun:function(i,c){ }； 其中i为当前分页，c为总页数
			switchCell:"img", //加载图片时的对象，可以是tagName或者className
			switchLoad:"data-src" //为图片实际路径的属性名称
		}
        var that = this, newConfig = JSON.parse(JSON.stringify(config));
        that.config = Slide.extend(newConfig, options);
        that.init();
    };
    TouchSlide.prototype.init = function() {
		var that = this, opts = that.config, slideCell = opts.slideCell;
		if (!Jes(slideCell)) return false;
		//全局对象
		var effect = opts.effect;
		var prevBtn = Jes(slideCell + " " + opts.prevCell)[0], 
			nextBtn = Jes(slideCell + " " + opts.nextCell)[0], 
			pageState = Jes(slideCell + " " + opts.pageStateCell)[0], 
			conBox = Jes(slideCell + " " + opts.mainCell)[0];
		if (!conBox) return false;
		var conBoxSize = conBox.children.length;
		var navObj = Jes(slideCell + " " + opts.titCell);
		var navObjSize = navObj ? navObj.length :conBoxSize;
		var sLoad = opts.switchLoad;
		/*字符串转换*/
		var index = parseInt(opts.defaultIndex), delayTime = parseInt(opts.delayTime), interTime = parseInt(opts.interTime);
		var autoPlay = opts.autoPlay == "false" || opts.autoPlay == false ? false :true;
		var autoPage = opts.autoPage == "false" || opts.autoPage == false ? false :true;
		var loop = opts.pnLoop == "false" || opts.pnLoop == false ? false :true;
		var oldIndex = index, inter = null, timeout = null, endTimeout = null;
		var startX = 0, startY = 0, distX = 0, distY = 0, dist = 0;
		//手指滑动距离
		var isTouchPad = /hp-tablet/gi.test(navigator.appVersion);
		var hasTouch = "ontouchstart" in window && !isTouchPad;
		var touchStart = hasTouch ? "touchstart" :"mousedown", touchMove = hasTouch ? "touchmove" :"", touchEnd = hasTouch ? "touchend" :"mouseup";
		var slideH = 0, slideW = conBox.parentNode.clientWidth;
		// mainCell滑动距离
		var twCell, scrollY, tempSize = conBoxSize;
		// 创建包裹层
		var wrap = function(el, v) {
			var tmp = document.createElement("div"), _el = el.cloneNode(true);
			tmp.innerHTML = v;
			tmp = tmp.children[0];
			tmp.appendChild(_el);
			el.parentNode.replaceChild(tmp, el);
			conBox = _el; // 重置conBox
			return tmp;
		};
		//处理分页
		if (navObjSize == 0) navObjSize = conBoxSize;
		if (autoPage) {
			navObjSize = conBoxSize;
			navObj = navObj[0];
			navObj.innerHTML = "";
			var str = "";
			if (opts.autoPage == true || opts.autoPage == "true") {
				for (var i = 0; i < navObjSize; i++) {
					str += "<li>" + (i + 1) + "</li>";
				}
			} else {
				for (var i = 0; i < navObjSize; i++) {
					str += opts.autoPage.replace("$", i + 1);
				}
			}
			navObj.innerHTML = str;
			navObj = navObj.children;
		}
		if (effect == "leftLoop") {
			tempSize += 2;
			conBox.appendChild(conBox.children[0].cloneNode(true));
			conBox.insertBefore(conBox.children[conBoxSize - 1].cloneNode(true), conBox.children[0]);
		}
		twCell = wrap(conBox, '<div class="tempWrap" style="overflow:hidden; position:relative;"></div>');
		conBox.style.cssText = "width:" + tempSize * slideW + "px;" + "position:relative;overflow:hidden;padding:0;margin:0;";
		for (var i = 0; i < tempSize; i++) {
			conBox.children[i].style.cssText = "display:table-cell;vertical-align:top;width:" + slideW + "px";
		}
		var doStartFun = function() {
			if (typeof opts.startFun == "function") {
				opts.startFun(index, navObjSize);
			}
		};
		var doEndFun = function() {
			if (typeof opts.endFun == "function") {
				opts.endFun(index, navObjSize);
			}
		};
		var doSwitchLoad = function(moving) {
			var curIndex = (effect == "leftLoop" ? index + 1 :index) + moving;
			var rollImg = function(ind) {
				var imgtest = /\#|\./.test(opts.switchCell);
				if(imgtest && sLoad != "") {
					var img = document.querySelector(slideCell + " " + opts.mainCell).children[ind].querySelectorAll(opts.switchCell); 
				}else{ 
				    var img = conBox.children[ind].getElementsByTagName(opts.switchCell);
				};
				for (var i = 0; i < img.length; i++) {
					if (img[i].getAttribute(sLoad)) {
						opts.switchCell == "img" ? img[i].setAttribute("src", img[i].getAttribute(sLoad)) : img[i].style.backgroundImage = "url('" + img[i].getAttribute(sLoad) + "')";
						img[i].removeAttribute(sLoad);  
						if(imgtest) Slide.removeClass(img[i], opts.switchCell.substr(1));
					}
				}
			};
			rollImg(curIndex);
			if (effect == "leftLoop") {
				switch (curIndex) {
				  case 0:
					rollImg(conBoxSize);
					break;

				  case 1:
					rollImg(conBoxSize + 1);
					break;

				  case conBoxSize:
					rollImg(0);
					break;

				  case conBoxSize + 1:
					rollImg(1);
					break;
				}
			}
		};
		//动态设置滑动宽度
		var orientationChange = function() {
			slideW = twCell.clientWidth;
			conBox.style.width = tempSize * slideW + "px";
			for (var i = 0; i < tempSize; i++) {
				conBox.children[i].style.width = slideW + "px";
			}
			var ind = effect == "leftLoop" ? index + 1 :index;
			translate(-ind * slideW, 0);
		};
		Slide.on(window, "resize", orientationChange);
		//滑动效果
		var translate = function(dist, speed, ele) {
			ele = (!!ele) ? ele.style : conBox.style;
			ele.webkitTransitionDuration = ele.MozTransitionDuration = ele.msTransitionDuration = ele.OTransitionDuration = ele.transitionDuration = speed + "ms";
			ele.webkitTransform = "translate(" + dist + "px,0)" + "translateZ(0)";
			ele.msTransform = ele.MozTransform = ele.OTransform = "translateX(" + dist + "px)";
		};
		//效果函数
		var doPlay = function(isTouch) {
			switch (effect) {
			  case "left":
				if (index >= navObjSize) {
					index = isTouch ? index - 1 :0;
				} else if (index < 0) {
					index = isTouch ? 0 :navObjSize - 1;
				}
				if (sLoad != null) {
					doSwitchLoad(0);
				}
				translate(-index * slideW, delayTime);
				oldIndex = index;
				break;

			  case "leftLoop":
				if (sLoad != null) {
					doSwitchLoad(0);
				}
				translate(-(index + 1) * slideW, delayTime);
				if (index == -1) {
					timeout = setTimeout(function() {
						translate(-navObjSize * slideW, 0);
					}, delayTime);
					index = navObjSize - 1;
				} else if (index == navObjSize) {
					timeout = setTimeout(function() {
						translate(-slideW, 0);
					}, delayTime);
					index = 0;
				}
				oldIndex = index;
				break;
			}
			//switch end
			doStartFun();
			endTimeout = setTimeout(function() {
				doEndFun();
			}, delayTime);
			//设置className
			for (var i = 0; i < navObjSize; i++) {
				Slide.removeClass(navObj[i], opts.titOnClassName);
				if (i == index) {
					Slide.addClass(navObj[i], opts.titOnClassName);
				}
			}
			if (loop == false) {
				//loop控制是否继续循环
				Slide.removeClass(nextBtn, "nextStop");
				Slide.removeClass(prevBtn, "prevStop");
				if (index == 0) {
					Slide.addClass(prevBtn, "prevStop");
				} else if (index == navObjSize - 1) {
					Slide.addClass(nextBtn, "nextStop");
				}
			}
			if (pageState) {
				pageState.innerHTML = "<span>" + (index + 1) + "</span>/" + navObjSize;
			}
		};
		// doPlay end
		//初始化执行
		doPlay();
		//自动播放
		if (autoPlay) {
			inter = setInterval(function() {
				index++;
				doPlay();
			}, interTime);
		}
		//点击事件
		if (navObj) {
			for (var i = 0; i < navObjSize; i++) {
				(function() {
					var j = i;
					Slide.on(navObj[j], "click", function(e) {
						clearTimeout(timeout);
						clearTimeout(endTimeout);
						index = j;
						doPlay();
					});
				})();
			}
		}
		if (nextBtn) {
			Slide.on(nextBtn, "click", function(e) {
				if (loop == true || index != navObjSize - 1) {
					clearTimeout(timeout);
					clearTimeout(endTimeout);
					index++;
					doPlay();
				}
			});
		}
		if (prevBtn) {
			Slide.on(prevBtn, "click", function(e) {
				if (loop == true || index != 0) {
					clearTimeout(timeout); clearTimeout(endTimeout);
					index--; doPlay();
				}
			});
		}
		//触摸开始函数
		var tStart = function(e) {
			clearTimeout(timeout);  clearTimeout(endTimeout);
			scrollY = undefined;  distX = 0;
			var point = hasTouch ? e.touches[0] :e;
			startX = point.pageX;  startY = point.pageY;
			//添加“触摸移动”事件监听
			Slide.on(conBox, touchMove, tMove);
			//添加“触摸结束”事件监听
			Slide.on(conBox, touchEnd, tEnd);
		};
		//触摸移动函数
		var tMove = function(e) {
			if (hasTouch) {
				if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
			}
			//多点或缩放
			var point = hasTouch ? e.touches[0] :e;
			distX = point.pageX - startX;
			distY = point.pageY - startY;
			if (typeof scrollY == "undefined") {
				scrollY = !!(scrollY || Math.abs(distX) < Math.abs(distY));
			}
			if (!scrollY) {
				e.preventDefault();
				if (autoPlay) { clearInterval(inter);  }
				switch (effect) {
				  case "left":
					if (index == 0 && distX > 0 || index >= navObjSize - 1 && distX < 0) {
						distX = distX * .4;
					}
					translate(-index * slideW + distX, 0);
					break;

				  case "leftLoop":
					translate(-(index + 1) * slideW + distX, 0);
					break;
				}
				if (sLoad != null && Math.abs(distX) > slideW / 3) {
					doSwitchLoad(distX > -0 ? -1 :1);
				}
			}
		};
		//触摸结束函数
		var tEnd = function(e) {
			if (distX == 0) return;
			e.preventDefault();
			if (!scrollY) {
				if (Math.abs(distX) > slideW / 10) {
					distX > 0 ? index-- :index++;
				}
				doPlay(true);
				if (autoPlay) {
					inter = setInterval(function() {
						index++; doPlay();
					}, interTime);
				}
			}
			Slide.removeon(conBox, touchMove, tMove);
			Slide.removeon(conBox, touchEnd, tEnd);
		};
		//添加“触摸开始”事件监听
		Slide.on(conBox, touchStart, tStart);
        
    };
    var jeSlide = function(options) {
        return new TouchSlide(options || {});
    };
    return jeSlide;
});