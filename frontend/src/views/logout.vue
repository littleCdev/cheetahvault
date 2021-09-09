<style scoped>

</style>

<template>
    <h5>please wait...</h5>
</template>


<script>
import Axios from "axios";
export default {
    data: () => ({
    }),
    methods: {
        async logout(){
            try {
                await Axios.get("login/logout");   
                console.log("logged out");   
            } catch (error) {
                console.log(error);
            }

            console.log("moving to index");
            this.$router.replace({
                name: "index"
            });
        }
    },
    computed:{
    },
    watch: {

    },
    async created() {
        this.logout();
    },
    mounted() {
    },
    components: {
    },
};
</script>