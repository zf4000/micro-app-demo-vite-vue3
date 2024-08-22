# 基于micro-app-demo精简优化,针对基座和子应用都为vite+vue3的情况

## 背景描述

公司技术栈为vite+vue3+pnpm,打算使用微前端技术,方便后期扩展,选型为micro-app

发现官方的demo在vite+vue3情况下存在一些问题:

1. 用的是yarn
2. 兼顾了很多其他技术栈框架(如react等),代码相对vite+vue3而言有些冗余
3. 运行时默认关闭了沙箱,导致子应用无法正常显示(最新的micro-app版本好像已经支持开启沙箱,demo未同步更新)
4. 无法在基座中进入子应用特定页面
5. 其他一些小问题

索性单独弄了个版本出来,针对vite+vue3环境下做了相关精简和调整,基本达到预期效果,

有需要的人,请参考,

调整过程中,花了不少时间,如觉有用,请star

## 使用方法

分别进入 /main_apps/vite-vue3 和 /child_apps/vite-vue3

pnpm i

pnpm dev

访问 http://localhost:3000 即可

## 版本

micro-app: v1.0.0-rc.6
vue:3.4.38
vue-router: "4.4.3"
vite": 2.9.18
pmpm : 8.15.5
node: v16.17.0

## 修改内容

1. 改为了pnpm
2. 去掉了除vite+vue3之外其他的框架
3. 去掉了left-sidebar子应用,在基座中直接调用基座side-bar组件
4. 开启了沙箱功能,加入了iframe模式
5. 修复了在 vite+vue3下若干bug,参考以下.

## 官方的bug

- 问题1:参数缓存,导致从主应用控制子应用路由切换时,会传入意外的path参数

重现: 基座点击leftsidebar => #/ => #/page2 => 回基座=> #/

问题描述: 子应用先显示首页,过一会自动跳转到 #/page2

原因:缓存导致,官方说明:

setData第一个参数为子应用名称，第二个参数为传递的数据，它发送的数据都会被缓存下来。

micro-app会遍历新旧值中的每个key判断值是否有变化，如果所有数据都相同则不会发送（注意：只会遍历第一层key），如果数据有变化则将新旧值进行合并后发送。

参考:
<https://micro-zoe.github.io/micro-app/docs.html#/zh-cn/data?id=%e4%b8%89%e3%80%81%e4%b8%bb%e5%ba%94%e7%94%a8%e5%90%91%e5%ad%90%e5%ba%94%e7%94%a8%e5%8f%91%e9%80%81%e6%95%b0%e6%8d%ae>

解决办法: 通过配置或者手工清空数据

```js
  <micro-app clear-data></micro-app>
  microApp.clearData('my-app')
```

- 问题2:子应用无法正常渲染

原因:micro-app配置有问题,关闭了沙箱,而最新的micro-app已经支持了vite下开启沙箱

vue中必须改为iframe沙箱,且不能 disablesandbox,否则子应用不会正常显示

```vue
  // main_apps\vite-vue3\src\views\vite.vue
  <micro-app
    name="appname-vite"
    router-mode="search"
    :url="url"
    :iframe="true"
    :disableSandbox="false"
    inline
    clear-data
    :data="microAppData"
    @created="handleCreate"
    @beforemount="handleBeforeMount"
    @mounted="handleMount"
    @unmount="handleUnmount"
    @error="handleError"
    @datachange="handleDataChange"
  ></micro-app>
```

- 问题3: 子应用无法正确识别是否微应用环境

原因:官方demo关闭了沙箱,通过判断 window["micro-app-appname-vite"] 来识别,

解决方案: 开启沙箱(disablesandbox=true)后,改为通过 window.__MICRO_APP_ENVIRONMENT__ 进行判断即可

官方解释:每个应用只能控制自己的路由,不能跨路由控制,所以需要通过消息通知来实现

[参考官方说明](https://micro-zoe.github.io/micro-app/docs.html#/zh-cn/jump)

## 导航控制

[参考](https://micro-zoe.github.io/micro-app/docs.html#/zh-cn/router?id=navigation)

- 子应用中,在本应用内跳转
常规跳转,

- 子应用控制主应用跳转
默认情况下，子应用无法直接控制主应用的跳转，为此我们提供了一个API，将主应用的路由对象传递给子应用。

```js
# 主应用
import microApp from '@micro-zoe/micro-app'
// 注册主应用路由
microApp.router.setBaseAppRouter(主应用的路由对象)

# 子应用
// 获取主应用路由
const baseRouter = window.microApp.router.getBaseAppRouter() 
// 控制主应用跳转
baseRouter.主应用路由的方法(...) 
```

- 子应用中,控制其他子应用跳转

控制其它子应用跳转，并向路由堆栈添加一条新的记录

```js
/**
 * @param {string} name 必填，子应用的name
 * @param {string} path 必填，子应用除域名外的全量地址(也可以带上域名)
 * @param {boolean} replace 可选，是否使用replace模式，不新增堆栈记录，默认为false
 */
window.microApp.router.push({ name: '子应用名称', path: '页面地址', replace: 是否使用replace模式 })

```

- 子应用未激活时,基座控制子应用路由切换

直接在改变基座路由即可,参考如下:

```js
const changeChildViteRoute = (_childpath: LocationQueryValueRaw = "/") => {
  router.push({
    path: "/app-vite", //对应路由设置属性: path: '/app-vite:page*',
    query: { "appname-vite": "#"+_childpath }, // key对应<micro-app name>属性
  });
  
  // 或者
  router.push("/app-vite?appname-vite="+encodeURIComponent("#/page2"));

  // 或者
   window.location.href = "http://localhost:3000/main-vite/app-vite?appname-vite=%2Fchild%2Fvite%2F%23%2Fpage2";
  // ==============失败尝试===========
  // router.push("/app-vite/#/page2");
  // router.push({
  //   path: "/app-vite/#/page2",
  //   path: "/app-vite?appname-vite=%2F%23%2Fpage2",
  //   path: "/app-vite?appname-vite=%23/page2",
  //   path: "/app-vite?appname-vite=%2Fchild%2Fvite%2F%23%2Fpage2",
  // });
 
  
  
};
```

- 子应用激活时,基座中控制子应用路由切换

```js
  microApp.router.push({
    name: "child-app",
    path: "/page2",
    replace: true,
    // replace: 是否使用replace模式,
  });
  
```

## 数据通信

[参考官方文档](https://micro-zoe.github.io/micro-app/docs.html#/zh-cn/data?id=%e4%b8%80%e3%80%81%e5%ad%90%e5%ba%94%e7%94%a8%e8%8e%b7%e5%8f%96%e6%9d%a5%e8%87%aa%e4%b8%bb%e5%ba%94%e7%94%a8%e7%9a%84%e6%95%b0%e6%8d%ae)
