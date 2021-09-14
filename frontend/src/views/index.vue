<style>


.nopad-bottop {
    padding-bottom: 0;
    padding-top: 0;
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

        <light-box
            :files="files"
            :index=selectedIndex
        ></light-box>
       
       
       
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
                                @click="openOrMark(item,index)"
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

import Menu from "./menu.vue";
import MenuSelected from "./menuselected.vue"; // menu if items are selected (delete, add album etc)
import AddToAblumDialog from "../components/addToAlbumpopup.vue";
import eventHub from "../components/eventhub";
import { MasonryInfiniteGrid } from "@egjs/vue-infinitegrid";
import axios from 'axios';
import axiosError  from "../components/checkAjaxError";
import trylogin from "../components/checkLogin";

import lightBox from "../components/lightBox.vue";
export default {
    components: {
        Menu,
        MasonryInfiniteGrid,
        MenuSelected,
        AddToAblumDialog,
        lightBox
    },
    data: () => ({
        /**
         * selected fileindex for lightbox
         * (index of this.files)
         */
        selectedIndex:-1,
        /**
         * dialog for adding files to an album
         */
        albumDialogOpen:false,

        /**
         * albums for sidemenu
         */
        albums:[],

        /**
         * searchvalue emitted from menu
         */
        search: "",

        /**
         * count of marked files
         * will only be modified if markFile(),openOrMark(),clearMarkedFiles() is used
         */
        markedFiles:0,
        /**
         * will only be filled when "openAlbumDialog" is opend
         */
        markedFilesArray:[], 

        /**
         * loading indicator
         */
        loading: false,

        /**
         * page for scrolling
         */
        page: 0,
        /**
         * end reached indicator 
         */
        endreached: false,
        /**
         * array where all files are stored in 
         */
        files: [],


        loginChecked:false, // prevent the pageEndReachedEvent from firing before login was checked in mounted();
    }),
    methods: {
        /**
         * opens or marks file
         * if there is more than one file selected the popup wont open and the file will be selected
         */
        openOrMark(file,index){
            if(this.markedFiles > 0){
                this.markFile(file);
                return;
            }
            // open dialog
            this.selectedIndex = index;
        },
        /**
         * adds an file to selected ones
         */
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
        this.getAlbums();

    },
};
</script>
