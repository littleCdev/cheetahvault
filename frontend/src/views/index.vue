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

.stickyToMenu{
    position: sticky !important;
    top: 64px;
}

.albumlist{
    background-color: rgba(71, 71, 71, 0.774) !important;
}
.max100w{
    max-width: 100%;
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
                <v-col  class="d-none d-md-flex " cols="3">
                    <v-list class="transparent max100w" shaped>
                        <v-list-item-group class="stickyToMenu">
                            <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title class="white--text">Albums</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
    
                            <v-list-item
                                v-for="(album,index) in albums" :key="index"
                                class="albumlist"
                                @click="$router.push({name:'album',params:{'key':album.albumkey}})"
                            >
                                <v-list-item-avatar size="40">
                                    <v-img v-if="album.coverfile" :src="$url + 'files/' + album.coverfile.filepath + album.coverfile.thumbnail.file"></v-img>
                                </v-list-item-avatar>
    
                                <v-list-item-content class="truncate">
                                    <v-list-item-title >{{album.albumname}}</v-list-item-title>
                                    <v-list-item-subtitle>{{album.imagecount}} files</v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-col>
                <v-col sm="12" md="9" class="">
                    <masonry-infinite-grid
                        @request-append="onRequestAppend"
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
                                    class="white--text"
                                    :class="{'pad':item.marked}"
                                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                                    contain
                                    src="~@/assets/icon_file.png"
                                >
                                    <v-app-bar flat color="rgba(0, 0, 0, 0)" >
                                        <v-app-bar-nav-icon color="white">
                                            <v-icon :class="{'onhover':!item.marked}"
                                                @click.stop="markFile(item)">
                                                mdi-checkbox-marked-circle
                                            </v-icon>
                                        </v-app-bar-nav-icon>
                                    </v-app-bar>
                                    <v-card-title v-text="item.originalfilename"></v-card-title>
                                </v-img>
                            </v-card>
                        </div>
                    </masonry-infinite-grid>      
                </v-col>
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
import modal from '../components/modal';
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
         * array where all files are stored in 
         */
        files: [],

        /**
         * sort parameters
         */
        sortoptions: "asc=desc&order=upload",

        /**
         * set to true after login was checked, used to prevent event from grid with no login
         */
        loginChecked:false,
    }),
    methods: {
        /**
         * removes all files with "marked" attribute from array
         */
        removeMarkedFiles(){
            for (let i = this.files.length-1; i >= 0; i--) {
                console.log(i);
                if(this.files[i].marked)
                    this.files.splice(i,1);
            }
            this.clearMarkedFiles();
        },
        /**
         * deletes all marked files from server
         */
        async deleteMarkedFiles(){
            let fileKeys = [];
            for (let i = 0; i < this.files.length; i++) {
                if(this.files[i].marked)
                    fileKeys.push(this.files[i].filename);
            }

            try {
                this.loading = true;
                await axios.post("files/deletemany",{
                    files:fileKeys
                });
                this.removeMarkedFiles();
            } catch (error) {
                console.log(error);
                axiosError(error);
            }finally{
                this.loading = false;
            }

        },
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

        async onRequestAppend(e) {
            if(!this.loginChecked){
                console.log("not running onRequestAppend, login not checked");
                return;
            }

            console.group("loadmore");
            console.log(e);
            console.groupEnd("loadmore");
            
            if(e) e.wait();
            try {
                this.loading = true;
                let x = await Axios.get(
                    `search/${this.page}?search=${this.search}&${this.sortoptions}`
                );

                if (x.data.length == 0) {
                    console.log(`no images left after page: ${this.page}`);
                    return;
                }

                for (let i = 0; i < x.data.length; i++) {
                    const element = x.data[i];
                    element.marked = false;
                    this.files.push(element);
                }

                this.loading = false;
                this.page++;
            } catch (error) {
                console.log(error);
                axiosError(error);
            }finally{
                if(e) e.ready();
            }
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
        },


        /**
         * search event from menubar
         */
        eventSearch(searchstring){
            console.log(`searching...  ${searchstring}`);
            // reset current view
            this.page = 0;
            this.search = searchstring;
            this.files=[];
        },
        /**
         * arrowright event from lightbox
         */
        async eventLightBoxNext(){
            console.log(`${this.selectedIndex} ${this.files.length}`)
            if((this.selectedIndex+1) >= this.files.length){
                console.log(`requesting more due to keyboard event`)
                await this.onRequestAppend();
            }
            if((this.selectedIndex+1) <= this.files.length)
                this.selectedIndex++;
        },
        /**
         * arrowleft event from lightbox
         */
        eventLightBoxPrevious(){
            if(this.selectedIndex >0)
                this.selectedIndex--;
        },
        /**
         * add to album event from menubar
         */
        eventOpenAddToAlbum(){
            this.markedFilesArray = [];
            for (let i = 0; i < this.files.length; i++) {
                if(this.files[i].marked)
                    this.markedFilesArray.push(this.files[i]);
            }

            this.albumDialogOpen = true;            
        },

        eventSort(e){
            this.sortoptions = e;
            // reset current view
            this.page = 0;
            this.files=[];
        },

        getEvents(){
            return {
                "editmode":()=>this.editmode=!this.editmode,
                "search":this.eventSearch,
                "clear":this.clearMarkedFiles,
                "delete":this.deleteMarkedFiles,
                "lightboxprev":this.eventLightBoxPrevious,
                "lightboxnext":this.eventLightBoxNext,
                "lightboxclosed":()=>this.selectedIndex=-1,

                "addToAlbumClosed":()=>this.albumDialogOpen=false,
                "album":this.eventOpenAddToAlbum,

                "sort":this.eventSort,
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

        // init events
        for (const [key, value] of Object.entries(this.getEvents())) {
            eventHub.$on(key,value);
        }
    },
    destroyed(){
       // deinit events
        for (const [key, value] of Object.entries(this.getEvents())) {
            eventHub.$off(key,value);
        }
    },

    async mounted() {
        let result = "";

        try{
            result =await trylogin();
        }catch(e){
            modal.open("Error",e.stack);
            return;
        }
         
        console.log(result);
        if(result !== "user"){
            console.log("user not logged in, forwarding");
            this.$router.replace({
                name: "login"
            });
            return;
        }
        
        this.loginChecked = true;
        this.onRequestAppend();
        this.getAlbums();

    },
};
</script>
