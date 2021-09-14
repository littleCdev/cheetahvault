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

.bigtext{
    font-size: 2rem;
}


</style>>


<template>
    <div>
        <Menu v-if="markedFiles < 1" :key="markedFiles" :album=true></Menu>
        <MenuSelected v-if="markedFiles > 0" :album=true :key="markedFiles"></MenuSelected>
        
        <lightBox
            :files="files"
            :index=selectedIndex
        ></lightBox>
       
        <v-main>
            <v-row>
                <v-col cols="8" offset="2">
                    <v-text-field
                        ref="title"
                        :disabled="!titleEdit"
                        class="bigtext"
                        color="white"
                        label="Album name"
                        v-model="albumname"
                    ></v-text-field>
                </v-col>
                <v-col cols="2" class="bigtext">
                    <a v-if="titleEdit" @click.stop="titleEdit=false;saveTitle()">
                        <v-icon large>mdi-content-save</v-icon>
                    </a>
                    <a v-if="titleEdit" @click.stop="titleEdit=false;resetTitle()">
                        <v-icon large>mdi-close</v-icon>
                    </a>
                    <a v-if="!titleEdit" @click.stop="titleEdit=true">
                        <v-icon large>mdi-pencil</v-icon>
                    </a>
                </v-col>
                <masonry-infinite-grid
                    class="container"
                    v-bind:gap="5">

                    <div
                        class="item"
                        v-for="(item,index) in files"
                        :key="index"
                    >
                        <v-card    
                            @click="selectedIndex=index;"
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
            </v-row>
        </v-main>
    </div>
</template>

<script>
import Axios from "axios";
import Menu from "./menu.vue";
import MenuSelected from "./menuselected.vue"; // menu if items are selected (delete, add album etc)
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
        lightBox
    },
    data: () => ({
        /**
         * selected fileindex for lightbox
         * (index of this.files)
         */
        selectedIndex:-1,

        /**
         * albumkey
         */
        albumKey:"",
        /**
         * albumname, will be loaded from albumkey
         */
        albumname:"",
        /**
         * saved albumname in case of "reset"
         */
        _albumname:"",
        /**
         * editable inputfield for albumname
         */
        titleEdit:false,

        /**
         * search emitted by menu
         */
        search: "",

        /**
         * count of marked files
         */
        markedFiles:0,
        /**
         * will only be filled when "openAlbumDialog" is opend
         */
        markedFilesArray:[],
        /**
         * loadingindicator
         */
        loading: false,
        /**
         * page for scrolling
         */
        page: 0,
        /**
         * page end indicator to prevent endless loading
         */
        endreached: false,
        /**
         * array where all files are stored in 
         */
        files: [],
    }),
    methods: {
        async deleteAlbum(){
            try {
                await axios.delete(`albums/${this.albumKey}/`)
                this.$router.replace({
                        name: "index"
                    });
            } catch (error) {
                console.log(error);
                axiosError(error);
            }
        },
        async removeFiles(){
            try {
                let fileKeys = [];
                for (let i = 0; i < this.files.length; i++) {
                    if(this.files[i].marked)
                        fileKeys.push(this.files[i].filename);
                }
                this.loading = true;
                await axios.post(`albums/${this.albumKey}/files`,{
                    files:fileKeys
                })

                for (let i = this.files.length-1; i >= 0; i--) {
                    console.log(i);
                    if(this.files[i].marked)
                        this.files.splice(i,1);
                }

                this.markedFiles = 0;
                this.markedFilesArray = [];

            } catch (error) {   
                console.log(error);
                axiosError(error);
            }finally{
                this.loading = false;
            }
        },
        /**
         * resets the albumtitle to original
         */
        resetTitle(){
            this.albumname = this._albumname;
        },
        async saveTitle(){
            try {
                await axios.put(`albums/${this.albumKey}/name`,{
                    title:this.albumname
                });
                this._albumname = this.albumname;
                console.log("saved new name")
            } catch (error) {
                console.log(error);
                axiosError(error);
            }
        },
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
         * gets files using this.page and this.search
         */
        async getFiles() {
            this.loading = true;
            try{
                let x = await Axios.get(
                    `albums/${this.albumKey}`
                );
                this.loading = false;
                this.endreached = false;

                this.files = [];

                for (let i = 0; i < x.data.files.length; i++) {
                    const element = x.data.files[i];
                    element.marked = false;
                    this.files.push(element);
                }
                this.albumname = x.data.albumname;
                this._albumname = x.data.albumname;

                // set focus if titleEdit was set to true via url "?edit=asdas"
                if(this.titleEdit){
                    this.$refs.title.focus();
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

    },
    created() {
        document.onpaste = null;

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

        // clear selection
        eventHub.$on("clear", () => {
            this.clearMarkedFiles();
        });

        // open "add to album" popup
        eventHub.$on("album", () => {
            this.markedFilesArray = [];
            for (let i = 0; i < this.files.length; i++) {
                if(this.files[i].marked)
                    this.markedFilesArray.push(this.files[i]);
            }

            this.albumDialogOpen = true;
        });

        // close "add to album" popup
        eventHub.$on("addToAlbumClosed", () => {
            this.albumDialogOpen = false;
        });

        // remove files from album event
        eventHub.$on("remove", () => {
            this.removeFiles();
        });
        // delete album
        eventHub.$on("deletealbum", () => {
            this.deleteAlbum();
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

        this.albumKey = this.$route.params.key;
        this.getFiles();
        
        // enable edit-title if query hast ?edit set
        // focus will be set after info is loaded
        if(this.$route.query.edit){
            console.log("editmode")
            this.titleEdit=true;
            
        }
    },

};
</script>
