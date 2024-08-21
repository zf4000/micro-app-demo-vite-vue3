<template>
  <div id="app-container">
    <!-- 侧边导航栏 -->
    <!-- <micro-app
      name="left-sidebar-app"
      :url="url_leftsidebar"
      :data="sidebarData"
    ></micro-app> -->

    <!-- 重写了left-sidebar,简化架构 2024年8月21日 by jeff -->
    <left-sidebar @select="handleSelect"></left-sidebar>

    <router-view id="router-container" />

    <!-- 避免子应用被频繁渲染 -->
    <!-- <router-view id="router-container" v-slot="{ Component, route }">
      <component :is="Component" :key="route.name" />
    </router-view> -->
  </div>
</template>

<script lang="ts" setup>
import { LocationQueryValueRaw, useRouter } from "vue-router";
import microApp, { getActiveApps } from "@micro-zoe/micro-app";
import config from "./config";
import LeftSidebar from "./components/LeftSidebar.vue";

const router = useRouter();

const url_leftsidebar = `${config.sidebar}/child/sidebar/`;

// 测试代码,观察基座路由跳转时的状态,2024年8月21日 by jeff
// router.beforeEach((to, from) => {
//   console.warn("beforeEach", { to, from });
// });

/**
 * 子应用没有激活状态下,基座跳转到指定子应用路由测试 2024年8月21日 by jeff
 * @param childPath 子应用路由
 */
const changeChildViteRoute = (childPath: LocationQueryValueRaw = "/") => {
  router.push({
    path: "/app-vite", //对应路由设置属性: path: '/app-vite:page*',
    query: { "appname-vite": `#${childPath}` },
  });
  // ==============失败尝试===========
  // router.push("/app-vite/#/page2");
  // router.push({
  //   path: "/app-vite/#/page2",
  //   path: "/app-vite?appname-vite=%2F%23%2Fpage2",
  //   path: "/app-vite?appname-vite=%23/page2",
  //   path: "/app-vite?appname-vite=%2Fchild%2Fvite%2F%23%2Fpage2",
  // });
  //===========成功尝试============
  // url中的参数会被解析为query参数
  // router.push(`/app-vite?appname-vite=${encodeURIComponent("#/page2")}`);
  // router.push(`/app-vite?appname-vite=${microApp.router.encode("#/page2")}`);
  // router.push({
  //   path: "/app-vite", //对应路由设置属性: path: '/app-vite:page*',
  //   query: { "appname-vite": "#/page2" }, //key为<micro-app>中的name属性
  // });
  // window.location.href = "http://localhost:3000/main-vite/app-vite?appname-vite=%2Fchild%2Fvite%2F%23%2Fpage2";
  /*
  //期望的中的 router.currentRoute
  router.currentRoute = {
    "fullPath": "/app-vite?left-sidebar-app=%2Fchild%2Fsidebar%2F&appname-vite=%2Fchild%2Fvite%2F%23%2Fpage2",
    "path": "/app-vite",
    "query": {
        "left-sidebar-app": "/child/sidebar/",
        "appname-vite": "/child/vite/#/page2"
    },
    "name": "vite",
    "href": "/main-vite/app-vite?left-sidebar-app=%2Fchild%2Fsidebar%2F&appname-vite=%2Fchild%2Fvite%2F%23%2Fpage2"
  }
  */
  // 以下是激活状态下的跳转方法
  // microApp.router.push({
  //   name: "child-app",
  //   path: "/page2",
  //   replace: true,
  //   // replace: 是否使用replace模式,
  // });
};

// 👇 主应用向sidebar子应用下发一个名为pushState的方法
const sidebarData = {
  // 子应用sidebar通过pushState控制主应用跳转
  pushState: (appName: string, path: string, hash: string) => {
    console.log("leftsidebar 点击时向子应用传递参数", { appName, path, hash });
    /**
     * 当子应用还未渲染，通过基座控制路由跳转，子应用在初始化时会自己根据url渲染对应的页面
     * 当子应用已经渲染，则直接控制子应用进行内部跳转
     *
     * getActiveApps: 用于获取正在运行的子应用
     */
    if (!getActiveApps().includes(appName)) {
      console.warn("子应用未激活状态,基座中切换路由,path处理结果:", {
        appName,
        path,
        hash,
      });

      // 以下代码有问题 2024年8月21日 by jeff,注释后重写,
      // 子应用未激活状态
      // child-vite 和 child-react17子应用为hash路由，这里拼接一下hash值
      // hash && (path += `/#${hash}`);
      // router.push(`/app-vite?appname-vite=${encodeURIComponent("#/page2")}`);
      hash && (path += `?${appName}=${encodeURIComponent("#" + hash)}`);
      router.push(path);
    } else {
      // 子应用激活状态:
      let childPath = null;
      // child-vite 和 child-react17子应用是hash路由，hash值就是它的页面地址，这里单独处理
      if (hash) {
        childPath = hash;
      } else {
        // path的值形式如：/app-vue2/page2，这里/app-vue2是子应用的基础路由，/page2才是页面地址，所以我们需要将/app-vue2部分删除
        childPath = path.replace(/^\/app-[^/]+/, "");
        !childPath && (childPath = "/"); // 防止地址为空
      }

      // 主应用通过下发data数据控制子应用跳转
      microApp.setData(appName, { path: childPath });
      console.log(
        appName,
        "子应用激活状态,",
        `microApp.setData(${appName},path:${childPath})`
      );
    }
  },
};

/**
 * leftSidebar点击时跳转触发
 * @param appName 子应用名称
 * @param path 路径
 * @param hash hash
 */
const handleSelect = (appName: string, path: string, hash: string) => {
  console.log("emit fired", { appName, path, hash });
  sidebarData.pushState(appName, path, hash);
};
</script>

<style>
#app-container {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  text-align: center;
}

#router-container {
  flex: 1;
}

#public-links {
  padding: 10px 0;
}

#public-links a {
  text-decoration: underline;
  color: -webkit-link;
  cursor: pointer;
}

#public-links a:active {
  color: #f53f3f;
}
</style>
