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
            <v-toolbar-title> Cheetahvault </v-toolbar-title>
        </router-link>

        <template v-if="!titleOnly">
            <v-spacer></v-spacer>

            <v-text-field
                v-if="!noSearch"
                @change="search"
                v-model="searchvalue"
                color="white white--text"
                prepend-icon="mdi-magnify"
            ></v-text-field>

            <v-spacer></v-spacer>
            <router-link :to="{ name: 'upload' }">
                <v-toolbar-title>
                    <v-icon class="white--text">mdi-cloud-upload-outline</v-icon>
                    <!--- Upload -->
                </v-toolbar-title>
            </router-link>

            <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn dark icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-cog</v-icon>
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item-group>
                        <v-list-item>
                            <v-list-item-title @click="editmode"
                                >Editmode</v-list-item-title
                            >
                        </v-list-item>

                        <v-list-item v-if="album">
                            <v-list-item-title @click="emitAction('sharealbum')"
                                >Share album</v-list-item-title
                            >
                        </v-list-item>

                        <v-list-item v-if="album">
                            <v-list-item-title @click="emitAction('deletealbum')"
                                >Delete album</v-list-item-title
                            >
                        </v-list-item>

                        <v-list-item>
                            <v-list-item-title>
                                <router-link :to="{name:'logout'}" class="black--text">
                                    Logout
                                </router-link>
                                </v-list-item-title
                            >
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>
        </template>
    </v-app-bar>
</template>

<script>
import eventHub from "../components/eventhub";

export default {
    props:{
        "noSearch":{
            type:Boolean
        },
        "titleOnly":{
            type:Boolean
        },
        album:{
            type:Boolean,
            optional:true,
            default:false
        }
    },
    methods: {
        search() {
            eventHub.$emit("search", this.searchvalue);
        },
        editmode() {
            if (this.$route.name !== "index") {
                this.$router.replace({
                    name: "index",
                });
            }

            eventHub.$emit("editmode");
        },
        emitAction(action){
            eventHub.$emit(action)
        }
    },
    data: () => ({
        searchvalue: "",
    }),
};
</script>
