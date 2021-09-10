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

.action-icon{
    padding-left: 20px;
}
</style>
<template>
    <v-app-bar app class="transparent">
        <router-link :to="{ name: 'index' }">
            <v-toolbar-title> Cheetahvault </v-toolbar-title>
        </router-link>

        <v-spacer></v-spacer>

            <v-toolbar-title class="action-icon white--text">
                <v-tooltip bottom>
                    <template v-slot:activator="{on,attr}">
                        <a href="#delete"
                            @click.stop="clear()"
                            v-bind="attr"
                            v-on="on">
                            <v-icon class="white--text"> mdi-close</v-icon>
                            Clear selection
                        </a>
                    </template>
                    Clear select
                </v-tooltip>
            </v-toolbar-title>
        <v-spacer></v-spacer>

            <v-toolbar-title class="action-icon">
                <v-tooltip bottom>
                    <template v-slot:activator="{on,attr}">
                        <a href="#" @click.stop="album()">
                            <v-icon class="white--text"
                                v-bind="attr"
                                v-on="on"
                            >mdi-image-plus</v-icon>
                        </a>
                    </template>
                    Add images to an album
                </v-tooltip>
            </v-toolbar-title>

            <v-toolbar-title class="action-icon">
                <v-tooltip bottom>
                    <template v-slot:activator="{on,attr}">
                        <a href="#delete" @click.stop="filedelete()">
                            <v-icon class="white--text"
                                v-bind="attr"
                                v-on="on"
                            >mdi-delete</v-icon>    
                        </a>
                        
                    </template>
                    Delete selected files
                </v-tooltip>
            </v-toolbar-title>
    </v-app-bar>
</template>

<script>
import eventHub from "../components/eventhub";

export default {
    methods: {
        album() {
            eventHub.$emit("album", "");
        },
        filedelete() {
            eventHub.$emit("delete", "");
        },
        clear() {
            eventHub.$emit("clear", "");
        },
    },
    data: () => ({
    }),
};
</script>
