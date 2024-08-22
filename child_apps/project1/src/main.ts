import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";

// 定义以下类型后,避免ts报错
declare global {
  interface Window {
    // 关闭沙箱时,不存在window.eventCenterForAppNameVite对象 2024年8月20日 by jeff
    // eventCenterForAppNameVite: any;
    microApp: any; //EventCenterForMicroApp
    __MICRO_APP_ENVIRONMENT__: string;
    __MICRO_APP_BASE_APPLICATION__: string;
    unmount: () => void;
  }
}

/**
 * 微前端环境下,子应用中的window已经变成了 window.__MICRO_APP_PROXY_WINDOW__了
 * window.microApp 的类型 EventCenterForMicroApp
 *
 */

//#region 默认模式 每次渲染会顺序执行所有js

// 构造router
import routes from "./router";
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 判断是否子应用环境
const isMicroapp = window.__MICRO_APP_ENVIRONMENT__ || false;

const app = createApp(App);
app.use(router);
app.mount("#app");

if (isMicroapp) {
  // console.log("子应用中监听基座消息");
  // 监听基座传入数据
  window.microApp.addDataListener((data: any) => {
    console.log("子应用发现基座消息", data);
    // 当基座下发path时进行跳转
    if (data.path && data.path !== router.currentRoute.value.path) {
      router.push(data.path as string);
    }
  });

  /**
   * 子应用卸载时会自动执行window.unmount，在此可以进行卸载相关操作。
   */
  window.unmount = () => {
    console.log("子应用 project1 unmount触发");
    app.unmount();
    // 卸载所有数据监听函数
    window.microApp?.clearDataListener();
  };
}
//#endregion 默认模式

//#region umd模式 只在初次渲染时执行所有js,后续渲染只会执行mount unmount两个方法
/*

let app = null
let router = null
let history = null
// 👇 将渲染操作放入 mount 函数，子应用初始化时会自动执行
window.mount = () => {
  history = createWebHistory()
  router = createRouter({
    history,
    routes,
  })

  app = createApp(App)
  app.use(router)
  app.mount('#app')
}

// 👇 将卸载操作放入 unmount 函数，就是上面步骤2中的卸载函数
window.unmount = () => {
  app.unmount()
  history.destroy()
  app = null
  router = null
  history = null
}

// 如果不在微前端环境，则直接执行mount渲染
if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount()
}
*/
//#endregion umd模式
