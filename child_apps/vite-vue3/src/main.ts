import { createApp, App as AppInstance } from "vue";
import {
  createRouter,
  createWebHashHistory,
  RouterHistory,
  Router,
} from "vue-router";
import App from "./App.vue";
import routes from "./router";

declare global {
  interface Window {
    // 关闭沙箱时,不存在window.eventCenterForAppNameVite对象 2024年8月20日 by jeff
    // eventCenterForAppNameVite: any;
    microApp: any;
    __MICRO_APP_NAME__: string;
    __MICRO_APP_ENVIRONMENT__: string;
    __MICRO_APP_BASE_APPLICATION__: string;
  }
}

/**
 * 与基座进行数据交互
 * 在不关闭沙箱的模式下,子应用中的window为代理对象,和真正的window对象(windows.rawWindow)不是一个对象.
 * 重要属性:
 * window.rawWindow 原始window对象-基座的window对象
 * window.microApp<EventCenterForMicroApp>.getData() 获得基座传入的参数
 * windows.__MICRO_APP_BASE_APPLICATION__
 * windows.rawWindow.eventCenterForAppNameVite==undefined
 * @param router
 */
function handleMicroData(router: Router) {
  // 以下代码为开启沙箱时的代码, 2024年8月20日 by jeff
  // 是否是微前端环境
  if (window.__MICRO_APP_ENVIRONMENT__) {
    // 主动获取基座下发的数据
    console.log("子应用获得基座数据:", window.microApp.getData());

    // 监听基座下发的数据变化
    // console.log("子应用开始监听基座数据变化");
    window.microApp.addDataListener((data: Record<string, unknown>) => {
      console.log("子应用发现基座数据变化:", data);

      // 当基座下发path时进行跳转
      if (data.path && data.path !== router.currentRoute.value.path) {
        router.push(data.path as string);
      }
    });

    // 向基座发送数据
    setTimeout(() => {
      window.microApp.dispatch({ myname: "child-vue3" });
    }, 3000);
  }

  //#region 关闭沙箱时相关代码
  // 以下代码为关闭沙箱时的代码-官方默认, 注释 2024年8月20日 by jeff
  // eventCenterForAppNameVite 是基座添加到window(rawWindow)的数据通信对象
  // if (window.eventCenterForAppNameVite) {
  //   // 主动获取基座下发的数据
  //   console.log(
  //     "child-vite getData:",
  //     window.eventCenterForAppNameVite.getData()
  //   );

  //   // 监听基座下发的数据变化
  //   window.eventCenterForAppNameVite.addDataListener(
  //     (data: Record<string, unknown>) => {
  //       console.warn("child-vite addDataListener:", data);

  //       if (data.path && typeof data.path === "string") {
  //         data.path = data.path.replace(/^#/, "");
  //         // 当基座下发path时进行跳转
  //         if (data.path && data.path !== router.currentRoute.value.path) {
  //           router.push(data.path as string);
  //         }
  //       }
  //     }
  //   );

  // 向基座发送数据
  //   setTimeout(() => {
  //     window.eventCenterForAppNameVite.dispatch({ myname: "child-vite" });
  //   }, 3000);
  // }

  //#endregion 关闭沙箱时相关代码
}

/**
 * 用于解决主应用和子应用都是vue-router4时相互冲突，导致点击浏览器返回按钮，路由错误的问题。
 * 相关issue：https://github.com/micro-zoe/micro-app/issues/155
 * 当前vue-router版本：4.0.12
 */
// function fixBugForVueRouter4(router: Router) {
//   // 判断主应用是main-vue3或main-vite，因为这这两个主应用是 vue-router4
//   if (
//     window.location.href.includes("/main-vue3") ||
//     window.location.href.includes("/main-vite")
//   ) {
//     /**
//      * 重要说明：
//      * 1、这里主应用下发的基础路由为：`/main-xxx/app-vite`，其中 `/main-xxx` 是主应用的基础路由，需要去掉，我们只取`/app-vite`，不同项目根据实际情况调整
//      *
//      * 2、因为vite关闭了沙箱，又是hash路由，我们这里写死realBaseRoute为：/app-vite#
//      */
//     const realBaseRoute = "/app-vite#";

//     router.beforeEach(() => {
//       if (typeof window.history.state?.current === "string") {
//         window.history.state.current = window.history.state.current.replace(
//           new RegExp(realBaseRoute, "g"),
//           ""
//         );
//       }
//     });

//     router.afterEach(() => {
//       if (typeof window.history.state === "object") {
//         window.history.state.current =
//           realBaseRoute + (window.history.state.current || "");
//       }
//     });
//   }
// }

/*
默认模式：子应用在初次渲染和后续渲染时会顺序执行所有js，以保证多次渲染的一致性。默认模式更适合渲染和卸载 不频繁 的子应用。
umd模式：子应用暴露出mount、unmount方法，此时只在初次渲染时执行所有js，后续渲染只会执行这两个方法，在多次渲染时具有更好的性能和内存表现。通常情况下，我们推荐使用umd模式，以获得更好的性能和内存表现，
两种模式任选其一
*/

//#region 默认模式
// const router = createRouter({
//   history: createWebHashHistory(),
//   routes,
// });

// const app = createApp(App);
// app.use(router);
// app.mount("#vite-app");

// console.log("微应用child-vite渲染了");

// handleMicroData(router);

// fixBugForVueRouter4(router);

// 监听卸载操作
// window.addEventListener("unmount", function () {
//   app.unmount();
//   // 卸载所有数据监听函数
//   window.eventCenterForAppNameVite?.clearDataListener();
//   console.log("微应用child-vite卸载了");
// });
//#endregion 默认模式

// ----------分割线---umd模式------两种模式任选其一-------------- //
let app: AppInstance | null = null;
let router: Router | null = null;
let history: RouterHistory | null = null;
// 将渲染操作放入 mount 函数
function mount() {
  history = createWebHashHistory();
  router = createRouter({
    history,
    routes,
  });

  app = createApp(App);
  app.use(router);
  app.mount("#vite-app");

  console.log("微应用child-vite渲染了");

  handleMicroData(router);

  // fixBugForVueRouter4(router)
}

// 将卸载操作放入 unmount 函数
function unmount() {
  app?.unmount();
  history?.destroy();
  // 卸载所有数据监听函数,开启沙箱情况下不再需要 注释2024年8月20日 by jeff
  // window.eventCenterForAppNameVite?.clearDataListener();
  window.microApp.clearDataListener();

  app = null;
  router = null;
  history = null;
  console.log("微应用child-vite卸载了,微应用的 unmount() fired");
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  console.warn("检测到微应用环境");
  // @ts-ignore
  // window["micro-app-appname-vite"] = { mount, unmount };

  // 2024年8月21日 by jeff
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount };
} else {
  console.warn("非微前端环境");
  // 非微前端环境直接渲染
  mount();
}
