import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);
const routes = [
    { path: "/", name: "index", component: () => import("../views/index.vue") },
    {
        path: "/",
        name: "gallery",
        component: () => import("../views/index.vue"),
    },
    {
        path: "/upload",
        name: "upload",
        component: () => import("../views/upload.vue"),
    },
    {
        path: "/login",
        name: "login",
        component: () => import("../views/login.vue"),
    },
    {
        path: "/logout",
        name: "logout",
        component: () => import("../views/logout.vue"),
    },
    {
        path: "*",
        name: "notfound",
        component: () => import("../views/404.vue"),
    },
];
const router = new VueRouter({ base: process.env.BASE_URL, routes });
export default router;
