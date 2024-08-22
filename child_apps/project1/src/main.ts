import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

// 定义以下类型后,避免ts报错
declare global {
  interface Window {
    // 关闭沙箱时,不存在window.eventCenterForAppNameVite对象 2024年8月20日 by jeff
    // eventCenterForAppNameVite: any;
    microApp: any; //EventCenterForMicroApp
    __MICRO_APP_NAME__: string;
    __MICRO_APP_ENVIRONMENT__: string;
    __MICRO_APP_BASE_APPLICATION__: string;
  }
}

/**
 * 微前端环境下,子应用中的window已经变成了 window.__MICRO_APP_PROXY_WINDOW__了
 * window.microApp 的类型 EventCenterForMicroApp
 */
console.log(window);

createApp(App).mount("#app");

// 监听基座传入数据
window.microApp.addDataListener((_data: any) => {});

// 解除监听
