<template>
    <div>
        
        <micro-app 
            name='appname-project1' 
            url='http://localhost:5173/'
            :iframe="true"
            :disableSandbox="false"
            inline
            clear-data
            :level="2"
        ></micro-app>
    </div>
</template>
<script setup lang="ts">
</script>
<style scoped></style>