<style>
body {
    background-image: url("~@/assets/background.jpg") !important;
    background-repeat: no-repeat !important;
    background-attachment: fixed !important;
    background-position: center !important;
    background-size: cover !important;

    box-shadow: inset 0 0 5em 1em #000 !important;
}
.transparent {
    background-color: transparent !important;
}
</style>

<template>
    <v-app class="transparent">
        <router-view></router-view>
        <modal />
        <toast />
    </v-app>
</template>

<script>
import modal from "./components/modaltemplate.vue"  
import toast from "./components/toasttemplate.vue"  

export default {
    name: "App",
    components: {
        modal,
        toast
    },
    data: () => ({
        //
    }),
};
</script>
