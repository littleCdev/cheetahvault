import Vue from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import "./plugins/axios";
import "vuetify/dist/vuetify.min.css";
import vuetify from "./plugins/vuetify";


Vue.config.productionTip = false;

let url = ``;
if(process.env.NODE_ENV == "development")
    url = "https://cheetahstorage/api/cheetah/";

import axios from "axios";

axios.defaults.baseURL = url;
axios.defaults.withCredentials = true


Vue.prototype.$url = url;

new Vue({ 
    vuetify, 
    router, 
    render: (h) => h(App) 
}).$mount("#app");
