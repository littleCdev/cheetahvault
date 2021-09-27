<style>
.video > video {
    max-height: 80vh;
    max-width: 100%;
}
</style>

<style scoped>
.whitebg {
    background-color: rgba(71, 71, 71, 0.774) !important;
}
.max100 {
    width: initial;
    max-width: 100%;
    max-height: 80vh;
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
</style>

<template>
    <v-dialog v-model="dialogopen" v-if="file">
        <share-popup v-if="shareopen" :file="file.filename"></share-popup>
            <v-card class="whitebg">
                <v-card-title class="justify-center">
                    <h4 class="white--text">{{ file.originalfilename }}</h4>
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="9" class="text-center nopad-bottop">

                            <img
                                v-if="file.filetype == 'image'"
                                class="max100 fade"
                                :src="
                                    $url +
                                    'files/' +
                                    file.filepath +
                                    file.filename
                                "
                                :width="file.imagex"
                                :height="file.imagey"
                                @load="fullimageloaded = true"
                                :class="{
                                    opacity0: !fullimageloaded,
                                    opacity1: fullimageloaded,
                                }"
                            />

                            <vue-player
                                v-if="file.filetype == 'video'"
                                class="video"
                                v-model="videoplaying"
                                :src="
                                    $url +
                                    'files/' +
                                    file.filepath +
                                    file.filename
                                "
                                :poster="
                                    $url +
                                    'files/' +
                                    file.filepath +
                                    file.videopreview
                                "
                                :autoplay="true"
                            ></vue-player>

                            <a :href="$url+'files/'+file.filepath+file.filename+'/'+file.originalfilename" 
                                :download="file.originalfilename"
                                 v-if="file.filetype == 'file'">
                                <h2 class="white--text">
                                    Download
                                    <v-icon>mdi-download</v-icon>
                                    <br>
                                    {{file.originalfilename}}
                                    <br>
                                    {{file.filesizestr}}
                                </h2>
                            </a>

                        </v-col>

                        <v-col cols="3" class="white--text">
                            <v-row>
                                <v-col cols="12"
                                    ><p>Date: {{ file.filedate }}</p>
                                </v-col>
                                <v-col cols="12">
                                    <a class="white--text" @click="shareopen=true">Share <v-icon >mdi-share</v-icon> </a>
                                    
                                </v-col>

                                <v-col cols="12"
                                    ><p :title="file.filesize">Size: {{ file.filesizestr }}</p></v-col
                                >
                                <v-col cols="12">
                                    Public
                                    <v-icon
                                        v-if="file.showinindex"
                                        class="white--text"
                                        >mdi-check</v-icon
                                    >
                                    <v-icon v-else class="white--text"
                                        >mdi-block-helper</v-icon
                                    >
                                </v-col>


                                <v-col cols="12"
                                    v-if="editmode">
                                    Tags <v-icon @click="editmode=false">mdi-window-close</v-icon>
                                    <v-combobox
                                        v-model="tags"
                                        :items="allTags"
                                        multiple
                                        persistent-hint
                                        small-chips
                                        deletable-chips
                                        @change="saveTags"
                                    >
                                    </v-combobox>
                                </v-col>


                                <v-col cols="12"
                                    v-else>
                                    Tags <v-icon @click="editmode=true">mdi-pencil-outline</v-icon>
                                    <v-chip-group>
                                        <v-chip
                                            v-for="(tag, index) in tags"
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
</template>

<script>

import vuePlayer from "@algoz098/vue-player";
import sharePopup from "../components/sharePopup.vue";
import axios from 'axios';
import axiosError  from "../components/checkAjaxError";
import eventHub from "../components/eventhub";

export default {
    components:{
        vuePlayer,
        sharePopup
    },
    props:{
        files:{
            type:Array,
            optinal:false
        },
        index:{
            type:Number,
            optinal:false,
        },
    },
    watch:{
        index: function (newValue) {
            console.log(`index: ${newValue}`);
            this.file = this.files[this.index];
            this.getTagsForFile();
            this.dialogopen = true;
            this.fullimageloaded = false;
        },
        dialogopen:function(newValue){
            if(!newValue){
                console.log("dialog closed, setting stopping video")
                this.videoplaying = false;
            }else{
                this.videoplaying = true;
            }
        }
    },
    data: () => ({
        /**
         * sharepopup open
         */
        shareopen:false,
        /**
         * true-> tags are editable
         */
        editmode:false,
        /**
         * will be set to false if dialog is closed
         */
        videoplaying:true,

        /**
         * tags from the file
         * will be loaded on change
         */
        tags:[],

        /**
         * all existing tags for autocomplete
         */
        allTags:[],

        /**
         * 
         */
        dialogopen:true,

        /**
         * file from the props array
         */
        file:null,
        /**
         * for transition
         */
        fullimageloaded:false
    }),
    mounted(){
        if(this.index < 0)
            return;
        this.file = this.files[this.index];
        this.getTagsForFile();
    },
    async created(){
        eventHub.$on("createShareClosed", () => {
            this.shareopen = false;
        });
        // keyboard navigation
        document.addEventListener('keydown', (e)=>{
            if(e.code == "ArrowLeft"){
                eventHub.$emit("lightboxprev")
            }else if(e.code == "ArrowRight"){
                eventHub.$emit("lightboxnext")
            }
        });
    },
    destroyed() {
        document.removeEventListener("keydown");
    },
    methods: {
        /**
         * gets tags for currently selected file
         */
        async getTagsForFile() {
            console.log("getting tags for file");
            this.values = [];
            try {
                let data = await axios.get(`files/${this.file.id}/tags/`);
                this.tags = data.data;
            } catch (e) {
                console.log(e);
                axiosError(e);
            }
        },
        /**
         * gets all existing tags -> this.allTags
         */
        async getAllTags() {
            try {
                let data = await axios.get("tags/");
                this.allTags = data.data;
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
                await axios.put(`files/${this.file.id}/tags/`, {
                    tags: this.tags,
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

            if (this.tags.includes(imtemText)) return 0;

            if (imtemText.startsWith(query)) return 1;

            return 0;
        },
    },
};
</script>
