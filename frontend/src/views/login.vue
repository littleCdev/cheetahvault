<style scoped>
    .transparent{
        background-color: transparent!important;
    }
</style>

<template>
    <v-app class="transparent">
        <Menu :titleOnly="true"></Menu>
        <v-main >
            <v-container fluid fill-height class="">
                <v-layout align-center justify-center>
                    <v-flex xs12 sm8 md4>
                        <v-card class="grey darken-1">
                            <v-card-title class="white--text">{{titleText}}</v-card-title>
                            <v-card-text>
                                <v-form>
                                <v-text-field
                                    prepend-icon="mdi-account"
                                    name="Username"
                                    label="Username"
                                    type="text"
                                    v-model="username"
                                    @keydown.enter="login"
                                ></v-text-field>
                                <v-text-field
                                    prepend-icon="mdi-lock"
                                    name="Password"
                                    label="Password"
                                    type="password"
                                    @keydown.enter="login"
                                    v-model="password"
                                ></v-text-field>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="gray" @click.stop="login">{{btnText}}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-main>
    </v-app>
</template>


<script>
import Axios from "axios";

import Menu from "./menu.vue";

import trylogin from "../components/checkLogin";
import axiosError  from "../components/checkAjaxError";

export default {
    data: () => ({
        loading: false,
        password:"",
        username:"",
        /**
         * true if there is no user and you have to add one first
         */
        signUp:false,

    }),
    methods: {
        async login(){
            try {
                if(this.signUp){
                    await Axios.post("login/adduser/",{
                        username:this.username,
                        password:this.password
                    });
                    this.signUp = false;
                }else{
                    await Axios.post("login/",{
                        username:this.username,
                        password:this.password
                    });


                    console.log("logged in, moving to index");
                    this.$router.replace({
                        name: "index"
                    });
                }             
            } catch (error) {
                console.log(error);
                axiosError(error);
            }
        }
    },
    computed:{
        btnText(){
            return this.signUp?"Sign up":"Login";
        },
        titleText(){
            return this.signUp?"Sign up":"Sign in";
        }
    },
    watch: {

    },
    async created() {
        let action = "";
        try {
            action = await trylogin();
            
        } catch (error) {
            console.log(error);
            axiosError(error);
            return;
        }
        switch(action){
            case "user":// lol redirect back
                this.$router.replace({
                    name: "index"
                });
            break;

            case "signup":
                console.log("/login returned 303 -> add user first")
                this.signUp = true;
                break

            case "login":
                console.log("/login returned 403 -> login")
                this.signUp = false;
                break
        }
    },
    mounted() {
    },
    components: {
        Menu,
    },
};
</script>