<style>
.max100 {
    width: initial;
    max-width: 100%;
    max-height: 80vh;
}

.nopad-bottop {
    padding-bottom: 0;
    padding-top: 0;
}

.whitebg {
    background-color: rgba(71, 71, 71, 0.774) !important;
}

.fade {
    transition: opacity 0.6s;
    -webkit-transition: opacity 0.6s;
}
.opacity0 {
    opacity: 0;
}

.opacity1 {
    opacity: 1;
}

.video > video {
    max-height: 80vh;
    max-width: 100%;
}

a{
    /* i don't like the underline for links */
    text-decoration: none;
}


</style>

<style scoped>
.onhover{
    display: none !important;
}

.hoveractivator:hover .onhover{
    display: block !important;
}

.pad {
    border: 5px solid red;
}

.static{
    position: fixed;
}

.albumlist{
    background-color: rgba(71, 71, 71, 0.774) !important;
}
</style>>


<template>
    <div>
        <template v-if="albumDialogOpen">
            <AddToAblumDialog :files="markedFilesArray" ></AddToAblumDialog>
        </template>

        <Menu v-if="markedFiles < 1"  :album=false></Menu>
        <MenuSelected v-if="markedFiles > 0" :album=false ></MenuSelected>

        <v-dialog v-model="dialogopen" v-if="dialog">
            <v-card class="whitebg">
                <v-card-title class="justify-center">
                    <h4 class="white--text">{{ dialog.originalfilename }}</h4>
                </v-card-title>
                <v-card-text>
                    <v-row class="">
                        <v-col cols="9" class="text-center nopad-bottop">

                            <!--- images/photos --->
                            <img
                                v-if="dialog.filetype == 'image'"
                                class="max100 fade"
                                :src="
                                    $url +
                                    'files/' +
                                    dialog.filepath +
                                    dialog.filename
                                "
                                width="dialog.imagex"
                                height="dialog.imagey"
                                @load="fullimageloaded = true"
                                :class="{
                                    opacity0: !fullimageloaded,
                                    opacity1: fullimageloaded,
                                }"
                            />

                            <!--- videos --->
                            <vue-player
                                v-if="dialog.filetype == 'video'"
                                class="video"
                                :src="
                                    $url +
                                    'files/' +
                                    dialog.filepath +
                                    dialog.filename
                                "
                                :poster="
                                    $url +
                                    'files/' +
                                    dialog.filepath +
                                    dialog.videopreview
                                "
                                :autoplay="true"
                            ></vue-player>

                            <!--- files, just show download icon --->
                            <a :href="$url+'files/'+dialog.filepath+dialog.filename+'/'+dialog.originalfilename" 
                                :download="dialog.originalfilename"
                                 v-if="dialog.filetype == 'file'">
                                <h2 class="white--text">
                                    Download
                                    <v-icon>mdi-download</v-icon>
                                    <br>
                                    {{dialog.originalfilename}}
                                    <br>
                                    {{dialog.filesizestr}}
                                </h2>
                            </a>

                        </v-col>

                        <v-col cols="3" class="white--text">
                            <v-row class="" v-if="this.editmode">
                                <v-col cols="12"
                                    ><p>Date: {{ dialog.filedate }}</p></v-col
                                >
                                <v-col cols="12">
                                    <v-checkbox
                                        class="white--text"
                                        v-model="dialog.showinindex"
                                        label="Public"
                                        @change="makePrivate"
                                    ></v-checkbox>
                                </v-col>
                                <v-col cols="12">
                                    <v-combobox
                                        v-model="values"
                                        :items="tags"
                                        multiple
                                        persistent-hint
                                        small-chips
                                        deletable-chips
                                        @change="saveTags"
                                    >
                                    </v-combobox>
                                </v-col>
                            </v-row>

                            <v-row v-else>
                                <v-col cols="12"
                                    ><p>Date: {{ dialog.filedate }}</p></v-col
                                >
                                <v-col cols="12"
                                    ><p :title="dialog.filesize">Size: {{ dialog.filesizestr }}</p></v-col
                                >
                                <v-col cols="12">
                                    Public
                                    <v-icon
                                        v-if="dialog.showinindex"
                                        class="white--text"
                                        >mdi-check</v-icon
                                    >
                                    <v-icon v-else class="white--text"
                                        >mdi-block-helper</v-icon
                                    >
                                </v-col>

                                <v-col cols="12">
                                    <v-chip-group>
                                        <v-chip
                                            v-for="(tag, index) in values"
                                            :key="index"
                                        >
                                            {{ tag }}
                                        </v-chip>
                                    </v-chip-group>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>
       
       
       
        <v-main>
            <v-row>
                <v-col cols="2" class="">
                    <v-list class="transparent">
                        <v-list-item-group class="static">
                            <v-list-item
                                
                                v-for="(album,index) in albums" :key="index"
                                class="albumlist"
                                @click="$router.push({name:'album',params:{'key':album.albumkey}})"
                            >  
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{album.albumname}}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{album.imagecount}} files
                                    </v-list-item-subtitle>
                                </v-list-item-content>

                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-col>
                <v-col cols="10" class="">
                    <masonry-infinite-grid
                        class="container"
                        v-bind:gap="5">

                        <div
                            class="item"
                            v-for="(item,index) in files"
                            :key="index"
                        >
                            <v-card    
                                @click="
                                    dialog = item;
                                    dialogopen = true;
                                    getTags();
                                "
                                class="mx-auto my-12 hoveractivator"
                            >
                                <v-img 
                                    v-if="item.filetype!='file'"
                                    :width="item.thumbnailx"
                                    :height="item.thumbnaily"
                                    class="white--text "
                                    
                                :class="{'pad':item.marked}"
                                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                                    contain
                                    :src="$url + 'files/' + item.filepath + item.thumbnail"
                                >
                                    <v-app-bar flat color="rgba(0, 0, 0, 0)" >
                                        <v-app-bar-nav-icon color="white">
                                            <v-icon :class="{'onhover':!item.marked}"
                                                @click.stop="markFile(item)">
                                                mdi-checkbox-marked-circle
                                            </v-icon>
                                        </v-app-bar-nav-icon>
                                
                                    </v-app-bar>

                                </v-img>

                                <v-img
                                    v-else
                                    :width="200"
                                    :height="200"
                                    class="white--text align-end"
                                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                                    contain
                                    src="~@/assets/icon_file.png"
                                >
                                    <v-card-title v-text="item.originalfilename"></v-card-title>
                                    
                                </v-img>
                            </v-card>
                        </div>
                    </masonry-infinite-grid>      
                </v-col>
                
            </v-row>

            <v-row v-if="!endreached || !loading">
                <v-skeleton-loader
                    v-intersect="{
                        handler: pageEndReached,
                        options: {
                            threshold: [0, 0.5, 1.0],
                        },
                    }"
                    width="200"
                    height="200"
                    type="card"
                ></v-skeleton-loader>
            </v-row>
        </v-main>
    </div>
</template>

<script>
import Axios from "axios";
import vuePlayer from "@algoz098/vue-player";

import Menu from "./menu.vue";
import MenuSelected from "./menuselected.vue"; // menu if items are selected (delete, add album etc)
import AddToAblumDialog from "../components/addToAlbumpopup.vue";
import eventHub from "../components/eventhub";
import { MasonryInfiniteGrid } from "@egjs/vue-infinitegrid";
import axios from 'axios';
import axiosError  from "../components/checkAjaxError";
import trylogin from "../components/checkLogin";

export default {
    data: () => ({

        albumDialogOpen:false,

        albums:[],

        search: "",

        editmode: false,

        markedFiles:0,
        markedFilesArray:[], // will only be filled when "openAlbumDialog" is opend

        loading: false,
        fullimageloaded: false,

        dialogopen: false,
        dialog: null,
        page: 0,
        endreached: false,
        files: [],

        values: [],
        tags: ["testtag", "tag"],

        loginChecked:false, // prevent the pageEndReachedEvent from firing before login was checked in mounted();
    }),
    methods: {
        markFile(file){
            file.marked = !file.marked;
    
            if(file.marked)
                this.markedFiles++;
            else
                this.markedFiles--;
        },
        /**
         * unselects all files
         */
        clearMarkedFiles(){
            for (let i = 0; i < this.files.length; i++) {
                this.files[i].marked = false;
            }
            this.markedFiles = 0;
        },
        /**
         * page end trigger, tries to load the next page
         */
        pageEndReached(/*entries, observer*/) {
            if(!this.loginChecked) 
                return;

            console.log(`pageEndReached`);
            this.loadNextPage();
        },
        /**
         * loads the next page
         */
        async loadNextPage() {
            if (this.loading || this.endreached) return;

            this.page += 1;

            try {
                this.loading = true;
                console.log(`loading new page: ${this.page}`);
                let x = await Axios.get(
                    `search/${this.page}?search=${this.search}`
                );

                if (x.data.length == 0) {
                    console.log(`no images left after page: ${this.page}`);
                    this.endreached = true;
                    return;
                }

                for (let i = 0; i < x.data.length; i++) {
                    const element = x.data[i];
                    element.marked = false;
                    this.files.push(element);
                }

                this.loading = false;
            } catch (error) {
                console.log(error);
                axiosError(error);
            }
        },
        /**
         * marks currently selected file private or public
         */
        async makePrivate() {
            try {
                let data = null;
                if (this.dialog.showinindex) {
                    data = await Axios.delete(
                        `files/${this.dialog.filename}/hidden/`
                    );
                } else {
                    data = await Axios.put(
                        `files/${this.dialog.filename}/hidden/`
                    );
                }
                console.log(data);
            } catch (e) {
                console.log(e);
                axiosError(e);
            }
        },
        /**
         * gets tags for currently selected file
         */
        async getTags() {
            console.log("getting tags");
            this.values = [];
            try {
                let data = await Axios.get(`files/${this.dialog.id}/tags/`);
                this.values = data.data;
            } catch (e) {
                console.log(e);
                axiosError(e);
            }
        },
        /**
         * gets all existing tags -> this.tags
         */
        async getAllTags() {
            try {
                let data = await Axios.get("tags/");
                this.tags = data.data;
            } catch (e) {
                console.log(e);
                axiosError(e);
            }
        },
        /**
         * saves  tags for the current open file
         */
        async saveTags() {
            try {
                await Axios.put(`files/${this.dialog.id}/tags/`, {
                    tags: this.values,
                });
            } catch (e) {
                console.log(e);
                axiosError(e);
            }
            this.getAllTags();
        },
        /**
         * filters tags for the tag autocomplete field so already assigned tags aren't showing up
         */
        tagfilter(item, query, imtemText) {
            console.log(item);
            console.log(query);
            console.log(imtemText);

            if (this.values.includes(imtemText)) return 0;

            if (imtemText.startsWith(query)) return 1;

            return 0;
        },
        /**
         * gets files using this.page and this.search
         */
        async getFiles() {
            this.loading = true;
            this.endreached = true;
            this.page = 0;
            try{
                let x = await Axios.get(
                    `search/${this.page}?search=${this.search}`
                );
                this.loading = false;
                this.endreached = false;

                this.files = [];

                for (let i = 0; i < x.data.length; i++) {
                    const element = x.data[i];
                    element.marked = false;
                    this.files.push(element);
                }

            }catch(error){
                if(error.response.status == 403){
                    this.$router.replace({
                        name: "login"
                    });
                    return;
                }
                axiosError(error);
            }
            console.log("getFiles done");
        },
        /**
         * gets all existing albums
         */
        async getAlbums(){
            try {
                let res = await axios.get("/albums/");
                this.albums = res.data;
            } catch (error) {
                axiosError(error);
                console.log(error);
            }
        }
    },

    watch: {
        /**
         * checks if the dialog closed since it does not emit an event
         */
        dialogopen: function (newValue) {
            if (!newValue) {
                this.dialog = null;
                this.fullimageloaded = false;
            }
        },
        /**
         * checks if the dialog closed since it does not emit an event
         */
        albumDialogOpen: function (newValue) {
            console.log(`albumDialogOpen: ${newValue}`);
        },
    },
    created() {

        document.onpaste = null;
        console.log(this.$url);
        // edit mode from menubar
        eventHub.$on("editmode", () => {
            this.editmode = !this.editmode;
        });
        // search event from menubar
        eventHub.$on("search", (search) => {
            console.log(`searching...  ${search}`);
            this.search = search;
            this.getFiles();
        });


        eventHub.$on("clear", () => {
            this.clearMarkedFiles();
        });

        eventHub.$on("album", () => {
            this.markedFilesArray = [];
            for (let i = 0; i < this.files.length; i++) {
                if(this.files[i].marked)
                    this.markedFilesArray.push(this.files[i]);
            }

            this.albumDialogOpen = true;
        });

        eventHub.$on("addToAlbumClosed", () => {
            this.albumDialogOpen = false;
        });
    },
    async mounted() {
        let result =await trylogin();
        console.log(result);
        if(result !== "user"){
            console.log("user not logged in, forwarding");
            this.$router.replace({
                name: "login"
            });
            return;
        }
        
        this.loginChecked = true;
        this.getFiles();
        this.getAllTags();
        this.getAlbums();

    },
    components: {
        Menu,
        vuePlayer,
        MasonryInfiniteGrid,
        MenuSelected,
        AddToAblumDialog
    },
};
</script>
