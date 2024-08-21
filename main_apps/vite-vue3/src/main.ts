import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import microApp from "@micro-zoe/micro-app";

microApp.start({
  plugins: {
    modules: {
      "appname-vite": [
        {
          // fetch获得代码后对js代码的处理:
          // import xx from xx 替换成
          // import xx from http://子应用地址/{vite.baseName}/xxx
          loader(code) {
            if (process.env.NODE_ENV === "development") {
              // 这里 /basename/ 需要和子应用vite.config.js中base的配置保持一致
              code = code.replace(
                /(from|import)(\s*['"])(\/child\/vite\/)/g,
                (all) => {
                  return all.replace(
                    "/child/vite/",
                    "http://localhost:4007/child/vite/"
                  );
                }
              );
            }

            return code;
          },
        },
      ],
    },
  },
});

const app = createApp(App);

app.use(router).use(ElementPlus).mount("#app");
