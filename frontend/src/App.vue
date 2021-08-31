<style>
body {
    background-image: url("~@/assets/background.jpg") !important;
    background-repeat: no-repeat !important;
    background-attachment: fixed !important;
    background-position: center !important;

    box-shadow: inset 0 0 5em 1em #000 !important;
}
.transparent {
    background-color: transparent !important;
}
</style>

<template>
    <v-app class="transparent">
        <router-view></router-view>
    </v-app>
</template>

<script>
export default {
    name: "App",

    data: () => ({
        //
    }),
};
</script>
