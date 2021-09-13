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

.bigtext{
    font-size: 2rem;
}


</style>>


<template>
    <div>
        <Menu v-if="markedFiles < 1" :key="markedFiles"></Menu>
        <MenuSelected v-if="markedFiles > 0" :album=true :key="markedFiles"></MenuSelected>

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
            </v-row>
        </v-main>
    </div>
</template>

<script>
import Axios from "axios";
import vuePlayer from "@algoz098/vue-player";

import Menu from "./menu.vue";
import MenuSelected from "./menuselected.vue"; // menu if items are selected (delete, add album etc)
import eventHub from "../components/eventhub";
import { MasonryInfiniteGrid } from "@egjs/vue-infinitegrid";
import axios from 'axios';
import axiosError  from "../components/checkAjaxError";
import trylogin from "../components/checkLogin";

export default {
    data: () => ({
        
        albumKey:"",
        albumname:"",
        _albumname:"", // saved albumname in case of "reset"
        titleEdit:false,

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

        eventHub.$on("remove", () => {
            this.removeFiles();
        });

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
        this.getAllTags();

        
        if(this.$route.query.edit){
            console.log("editmode")
            this.titleEdit=true;
            
        }
    },
    components: {
        Menu,
        vuePlayer,
        MasonryInfiniteGrid,
        MenuSelected
    },
};
</script>
