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
    return  {
        store: [],
        show: false,
        settings: {
            jsUrl: '',//eruda地址
            repUrl: null,//错误上报地址
            repMsg: '',//错误上报msg前缀，一般用于标识业务类型
            data: null, //需要上报的其他信息
            entry: null,
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
            let _this = this;
            window.onerror = function (msg, url, line, col, error) {
                _this.store.push({
                    error
                });
               new Image().src =_this.settings.repUrl+'?error='+error.stack+'&repMsg='+_this.settings.repMsg;
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
        init(){
            eruda.init();
            var erudaConsole = eruda.get('console');
            this.store.forEach((v) => {
                erudaConsole.error(v.error);
            });
        }//初始化eruda
    };
});
