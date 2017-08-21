;(function (root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory()
    else if (typeof define === 'function' && define.amd)
        define([], factory)
    else if (typeof exports === 'object')
        exports["errorEruda"] = factory();
    else
        root["errorEruda"] = factory()
})(this, function () {
    return {
        store: [],
        show: false,
        settings: {
            jsUrl: '',//eruda地址
            repUrl: null,//错误上报地址
            repMsg: '',//错误上报msg前缀，一般用于标识业务类型
            data: null, //需要上报的其他信息
            entry: null,
            browser: '',//浏览器版本
        },
        config (config) {
            if (config.entry) {
                this.settings = config;
                let _this = this;
                document.addEventListener("DOMContentLoaded", function () {
                    _this.entry(config.entry)
                });
            }
            this.console();
            let parameter = this.getParameter("errorEruda");
            if (parameter) {
                if (parameter === 'show') {
                    this.show = true;
                    this.log(this.show)
                } else {
                    this.show = false;
                    this.log(this.show)
                }
            }
        },//配置处理
        console(){
            this.browserLoad();
            let _this = this;
            window.onerror = function (msg, url, line, col, error) {
                _this.store.push({
                    type: 'error',
                    msg: error
                });
                _this.upload(error.stack, "TypeError");
                // new Image().src = _this.settings.repUrl + '?error=' + error.stack + '&repMsg=' + _this.settings.repMsg + '&browser=' + _this.settings.browser + '&type=TypeError';
            };
            document.addEventListener("error", function (e) {
                let error = '';
                if (e.target.localName == 'link') {
                    error = e.target.href;
                }
                else {
                    error = e.target.src;
                }
                // new Image().src = _this.settings.repUrl + '?error=' + error + '&repMsg=' + _this.settings.repMsg + '&browser=' + _this.settings.browser + '&type=' + e.target.localName;
                _this.upload(error, e.target.localName);
            }, true);
            var open = window.XMLHttpRequest.prototype.open;
            window.XMLHttpRequest.prototype.open = function (method, url) {
                this.addEventListener('readystatechange', function () {
                    if (this.readyState == 4 && this.status != 200) {
                        _this.upload(url, "http", method + "|" + this.status);
                        //new Image().src = _this.settings.repUrl + '?error=' + this.responseURL + '&repMsg=' + _this.settings.repMsg + '&browser=' + _this.settings.browser + '&type=http&httpState=' + this.status;
                    }
                })
                open.apply(this, arguments);
            }

            var log = window.console.log,
                info = window.console.info,
                warn = window.console.warn,
                debug = window.console.debug,
                error = window.console.error

            window.console.log = function () {
                _this.store.push({
                    type: 'log',
                    msg: arguments[0]
                })
                log.apply(console, arguments)
            }

            window.console.info = function () {
                _this.store.push({
                    type: 'info',
                    msg: arguments[0]
                })
                info.apply(console, arguments)
            }

            window.console.warn = function () {
                _this.store.push({
                    type: 'warn',
                    msg: arguments[0]
                })
                warn.apply(console, arguments)
            }

            window.console.debug = function () {
                _this.store.push({
                    type: 'debug',
                    msg: arguments[0]
                })
                debug.apply(console, arguments)
            }

            window.console.error = function () {
                _this.store.push({
                    type: 'error',
                    msg: arguments[0]
                })
                if (arguments[0].stack) {
                    _this.upload(arguments[0].stack, "TypeError");
                } else {
                    _this.upload(arguments[0].toString(), "TypeError");
                }
                //new Image().src = _this.settings.repUrl + '?error=' + arguments[0].stack + '&repMsg=' + _this.settings.repMsg + '&browser=' + _this.settings.browser + '&type=TypeError';
                error.apply(console, arguments)
            }
        },
        entry(selector){
            let count = 0,
                entry = document.querySelector(selector);
            if (entry) {
                let _this = this;
                entry.addEventListener('click', function () {
                    count++;
                    if (count > 5) {
                        count = -10000;
                        _this.show = true;
                        _this.log(_this.show);
                    }
                })
            }
        },//判断点击次数
        loadScript(src, callback){
            var s,
                r,
                t;
            r = false;
            s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = src;
            s.onload = s.onreadystatechange = function () {
                //console.log( this.readyState ); //uncomment this line to see which ready states are called.
                if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true;
                    callback();
                }
            };
            t = document.getElementsByTagName('script')[0];
            t.parentNode.insertBefore(s, t);
        },//加载调试器
        getParameter(n) {
            let m = window.location.hash.match(new RegExp('(?:#|&)' + n + '=([^&]*)(&|$)')),
                result = !m ? '' : decodeURIComponent(m[1]);
            return result || this.getParameterByName(n);
        },
        getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
        log(show){
            let _this = this;
            this.loadScript(this.settings.jsUrl, function () {
                if (show) {
                    _this.init();
                }
            })
        },//显示控制台
        browserLoad(){
            let ua = window.navigator.userAgent,
                ret = "";
            if (/Firefox/g.test(ua)) {
                ua = ua.split(" ");
                ret = "Firefox|" + ua[ua.length - 1].split("/")[1]
            } else if (/MSIE/g.test(ua)) {
                ua = ua.split(";");
                ret = "IE|" + ua[1].split(" ")[2]
            } else if (/Opera/g.test(ua)) {
                ua = ua.split(" ");
                ret = "Opera|" + ua[ua.length - 1].split("/")[1]
            } else if (/Chrome/g.test(ua)) {
                ret = "Chrome|" + ua[ua.length - 2].split("/")[1]
                if (ret.split("|")[1] == "undefined") {
                    ret = "Chrome|" + ua.substr(ua.lastIndexOf("Chrome/") + 7, 2);
                }
            } else if (/^apple\s+/i.test(navigator.vendor)) {
                ua = ua.split(" ");
                ret = "Safair|" + ua[ua.length - 2].split("/")[1]
            } else {
                ua = ua.split(" ");
                ret = "未知浏览器"
            }
            this.settings.browser = ret;

        },
        upload(error, type, status){
            new Image().src = this.settings.repUrl + '?error=' + error + '&repMsg=' + this.settings.repMsg + '&browser=' + this.settings.browser + '&type=' + type + "&httpState=" + status;
        },//上传错误
        init(){
            eruda.init();
            var erudaConsole = eruda.get('console');
            this.store.forEach((v) => {
                erudaConsole[v.type](v.msg);
            });

        }//初始化eruda
    };
});
