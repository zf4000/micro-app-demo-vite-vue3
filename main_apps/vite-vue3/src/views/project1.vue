<template>
  <div>
    <micro-app
      name="appname-project1"
      url="http://localhost:5173/"
      :iframe="true"
      :data="data"
    ></micro-app>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const data = ref({ msg: "来自基座的数据" });
</script>
<style scoped></style>
