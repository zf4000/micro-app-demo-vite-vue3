<template>
  <div id="sidebar-app">
    <h4>导航</h4>
    <el-menu
      class="el-menu-vertical-demo"
      :default-active="activeIndex"
      @select="select"
    >
      <el-menu-item index="/">
        <template #title>主应用首页</template>
      </el-menu-item>
      <el-menu-item index="/welcome">
        <template #title>welcome</template>
      </el-menu-item>
      <!-- 菜单(el-submenu) index为子应用名称，子菜单(el-menu-item) index为路由地址 -->

      <el-sub-menu index="appname-vite">
        <template #title>官方vite+vue3子应用</template>
        <el-menu-item index="/app-vite">
          <span class="menu-item-text">home</span>
        </el-menu-item>
        <el-menu-item index="/app-vite/page2">
          <span class="menu-item-text">page2</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script>
// import microApp from "@micro-zoe/micro-app";
import { useRouter } from "vue-router";

export default {
  name: "App",
  data() {
    return {
      activeIndex: "/", // 当前激活菜单的 index
    };
  },
  watch: {
    // 监听到路由变化时,改变left-sidebar的当前行信息
    $route: {
      handler: function (newRoute, oldRoute) {
        const { path, query } = newRoute;
        const hash = Object.values(query)[0]?.split("#")[1];
        console.warn({ path, hash });

        setTimeout(() => {
          // this.activeIndex = "/app-vite/page2";
          // console.warn({ path, hash });
          this.activeIndex = `${path}${!hash || hash === "/" ? "" : hash}`;
        }, 500);
      },
      // immediate: true // 立即执行一次
    },
  },
  created() {
    this.router = useRouter();
  },
  methods: {
    // 用户点击菜单时控制基座应用跳转
    select(index, indexPath) {
      // console.log("selec fired", { index, indexPath, microApp });
      // 因为 child-vite 和 child-react17 子应用是hash路由，所以需要传递hash值
      let hash = null;
      if (index === "/app-vite/page2") {
        const pathArr = index.split("/");
        index = "/" + pathArr[1];
        hash = "/" + pathArr[2];
      }

      // 获取子应用appName
      const appName = indexPath[0];

      // 基座控制子应用跳转.根据子应用是否激活来判断如何控制(未激活直接修改路由,否则传递参数) 2024年8月21日 by jeff
      let path = index;
      this.$emit("select", appName, path, hash);
    },
  },
};
</script>

<style>
#sidebar-app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: inline-block;
  margin-right: 40px;
  border-right: 1px solid rgb(230, 230, 230);
}

h4 {
  font-weight: revert;
}

.el-menu-item {
  font-size: 16px;
}

.el-menu {
  width: 200px;
  border-right: none;
}

.submenu-text {
  font-size: 16px;
  user-select: none;
}

.menu-item-text {
  font-size: 14px;
  user-select: none;
}
</style>
