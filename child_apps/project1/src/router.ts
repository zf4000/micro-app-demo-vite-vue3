import Home from "./components/Home.vue";
import Page1 from "./components/page1.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/page1",
    name: "page1",
    component: Page1,
  },
];

export default routes;
