<script setup lang="ts">
import { getAllApps } from "@micro-zoe/micro-app";
import { useRouter } from "vue-router";

const router = useRouter();

// 获得所有已激活app
const allapp = getAllApps(); // [子应用name, 子应用name, ...]
</script>

<template>
  <div>{{ allapp }}</div>
</template>

<style scoped></style>
