<style scoped>
.transparent {
    background-color: rgba(80, 80, 80, 0.548) !important;
}
a {
    text-decoration: none;
    color: white;
}
</style>

<style>
.v-text-field__details {
    display: none !important;
}

.v-icon {
    color: white !important;
}
</style>
<template>
    <v-app-bar app class="transparent">
        <router-link :to="{ name: 'index' }">
            <v-toolbar-title class="white--text"> Cheetahvault </v-toolbar-title>
        </router-link>
    </v-app-bar>
</template>

<script>

export default {
    props:{

    },
    methods: {
        
    },
    data: () => ({
    }),
};
</script>
