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

      <!-- el-sub-menu index为子应用名称(<micro-app name='子应用名称'),必须保持一致  -->
      <el-sub-menu index="appname-project1">
        <template #title>project1</template>
        <el-menu-item index="/app-project1">
          <span class="menu-item-text">首页</span>
        </el-menu-item>
        <el-menu-item index="/app-project1/page1">
          <span class="menu-item-text">page1</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
// import microApp from "@micro-zoe/micro-app";
import { useRouter, useRoute } from "vue-router";
import { ref, watch } from "vue";

const emit = defineEmits(["select"]);

const router = useRouter();
let route = useRoute();

const activeIndex = ref("/");

// 监听路由变化改变left-sidebar的当前菜单
watch(
  () => route.fullPath,
  (to, from) => {
    // console.log("warth", { from, to }, route);
    const newRoute = route;
    const { path, query } = newRoute;
    const hash = (Object.values(query)[0] as string)?.split("#")[1];
    // console.log("路由变化,改变left-sidebar当前菜单", { path, hash });

    setTimeout(() => {
      activeIndex.value = `${path}${!hash || hash === "/" ? "" : hash}`;
    }, 0);
  }
);

/**
 * 点击menu_item触发
 * @param index men_item.index
 * @param indexPath men_item的路径
 */
const select = (index: string, indexPath: string) => {
  // console.log("当前点击的path:", index);
  // 因为 child-vite 和 child-react17 子应用是hash路由，所以需要传递hash值
  const appName = indexPath[0];
  let hash = null;
  let path = index;

  // 判断index是否为微应用路径
  if (isMicroPath(index)) {
    console.log("将要访问子应用");
    //解析出 path,hash
    const { path: _path, hash: _hash } = resolveMicroPath(index);
    path = _path;
    hash = _hash;
    // console.log("解析结果:", { path, hash });
  }
  console.warn("left-sidebar 解析结果:", { appName, path, hash });
  emit("select", appName, path, hash);
};

/**
 * 判断是否微应用路径
 * @param {*} path menu_item传入的index
 */
const isMicroPath = (path: string) => {
  // 获得所有的微应用路由地址 : 包含 :page*
  const microKeys = router
    .getRoutes()
    .filter((item) => {
      return item.path.includes(":page*");
    })
    .map((item) => {
      const r = item.path.replace("/", "");
      return r.replace(":page*", "");
    });

  // 如果path中包含了microKeys中任何一个,return true;
  return microKeys.some((item) => {
    return path.includes(item);
  });
};
/**
 * 解析路径中的 path hash
 * @param {*} index : 带解析的路径 /app-vite/p1/p2?a=aa&b=bby#hhh
 */
const resolveMicroPath = (index: string) => {
  // 路由中可能带有query参数,可能有后续处理 to do
  const _r = router.resolve(index);
  const { path: _path, query: _query, hash: _hash } = _r;

  const pathArr = index.split("/");
  const path = "/" + pathArr[1];
  const hash = pathArr[2] ? `/${pathArr[2]}` : undefined;
  // const hash = "hash";
  // debugger;
  // console.warn({ path, hash });
  return { path, hash };
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
