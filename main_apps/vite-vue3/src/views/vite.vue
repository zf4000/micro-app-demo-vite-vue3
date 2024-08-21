<template>
  <div>
    <!-- 
      disableSandbox : 关闭沙箱,子应用为vite+vue3时不能为true 
      iframe : 子应用为vite+vue3时建议为true 
      clear-data : 当设置了clear-data，子应用卸载时会同时清空主应用发送给当前子应用，和当前子应用发送给主应用的数据。
      level : 预加载等级，可选（分为三个等级：1、2、3，1表示只加载资源，2表示加载并解析，3表示加载解析并渲染，默认为2）
    -->
    <micro-app
      name="appname-vite"
      router-mode="search"
      :url="url"
      :iframe="true"
      :disableSandbox="false"
      inline
      clear-data
      :data="microAppData"
      :level="2"
      @created="handleCreate"
      @beforemount="handleBeforeMount"
      @mounted="handleMount"
      @unmount="handleUnmount"
      @error="handleError"
      @datachange="handleDataChange"
    ></micro-app>
  </div>
</template>

<script lang="ts">
// import { EventCenterForMicroApp } from "@micro-zoe/micro-app";
import config from "../config";
import microApp from "@micro-zoe/micro-app";

// 开启沙箱的情况下,以下代码不需要 2024年8月20日 by jeff
// @ts-ignore 因为vite子应用关闭了沙箱，我们需要为子应用appname-vite创建EventCenterForMicroApp对象来实现数据通信
// window.eventCenterForAppNameVite = new EventCenterForMicroApp("appname-vite");

export default {
  name: "vite",
  data() {
    return {
      url: `${config.vite}/child/vite/`,
      microAppData: { msg: "来自基座的数据" },
    };
  },
  methods: {
    handleCreate(): void {
      console.log("child-vite 创建了");
    },

    handleBeforeMount(): void {
      console.log("child-vite 即将被渲染");
    },

    handleMount(): void {
      console.log("child-vite 已经渲染完成");
      setTimeout(() => {
        console.log("基座向子应用发送消息", microApp.getData("appname-vite"));
        /*
        setData第一个参数为子应用名称，第二个参数为传递的数据，它发送的数据都会被缓存下来。micro-app会遍历新旧值中的每个key判断值是否有变化，如果所有数据都相同则不会发送（注意：只会遍历第一层key），如果数据有变化则将新旧值进行合并后发送。
        */
        // @ts-ignore 基座向子应用发送数据,<micro-app data>属性变化,自动发消息给子应用
        this.microAppData = { msg: "来自基座的新数据" };
      }, 2000);
    },

    handleUnmount(): void {
      console.log("child-vite 卸载了");
    },

    handleError(): void {
      console.log("child-vite 加载出错了");
    },

    handleDataChange(e: CustomEvent): void {
      console.log("来自子应用 child-vite 的数据:", e.detail.data);
    },
  },
};
</script>

<style></style>
