#errorEruda
1kb(gzip)代码搞定开发调试发布，错误监控上报，用户问题定位。

- 支持错误监控和上报
- 支持 Eruda错误展示
- 支持开发url拉起Eruda

#安装

    <script src="js/errorEruda/errorEruda.js"></script>
npm暂时未上传可以通过试用


     import  errorEruda from 'errorEruda/errorEruda'
#使用方法

     errorEruda.config({
            jsUrl: '//cdn.jsdelivr.net/eruda/1.2.2/eruda.min.js',//eruda地址
            repUrl: "http://127.0.0.1:3000/",//错误上报地址
            repMsg: 'test',//错误上报msg前缀，一般用于标识业务类型
            entry: "#app"
        })`
eruda可以试用cdn当然也支持下载到本地使用


     jsUrl: '/eruda/1.2.2/eruda.min.js',//eruda地址
后台获取error和repMsg

    http://127.0.0.1:3000/?error=ReferenceError:%20asdasdas%20is%20not%20defined%20%20%20%20at%20http://localhost:63342/errorEruda/index.html?errorEruda=show:108:17&repMsg=test
errorEruda会监听window.onerror并把错误信息保存下来，并且上报到repUrl，你也可以召唤到Eruda并显示出来错误和相关日志。
#url启动errorEruda
url里带上errorEruda=show 就能显示vConsole面板。如:

        http://jqvue.com/demo/errorEruda/index.html?errorEruda=show`
