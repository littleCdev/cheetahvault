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
                            @click.stop="emitAction('clear')"
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

        <template v-if="!album">
            <v-toolbar-title class="action-icon">
                <v-tooltip bottom>
                    <template v-slot:activator="{on,attr}">
                        <a href="#" @click.stop="emitAction('album')">
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
                        <a href="#delete" @click.stop="emitAction('delete')">
                            <v-icon class="white--text"
                                v-bind="attr"
                                v-on="on"
                            >mdi-delete</v-icon>    
                        </a>
                        
                    </template>
                    Delete selected files
                </v-tooltip>
            </v-toolbar-title>
        </template>

        <!-- show dropdown on albumpage -->
        <template v-else>
            <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn dark icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-cog</v-icon>
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item-group>
                        <v-list-item>
                            <v-list-item-title @click="emitAction('album')">
                                <v-icon class="black--text">mdi-image-plus</v-icon>
                                Add files to an album
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title @click="emitAction('remove')">
                                <v-icon class="black--text">mdi-delete</v-icon>
                                Remove files from Album
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title @click="emitAction('delete')">
                                <v-icon class="black--text" >mdi-delete</v-icon>
                                Delete files
                            </v-list-item-title>
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
        album:{
            type: Boolean,
            optional:true,
            default:false
        }
    },
    methods: {
        emitAction(action){
            eventHub.$emit(action,"");
        }
    },
    data: () => ({
    }),
};
</script>
