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
                    <h4 class="white--text">{{ file.filename }}</h4>
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="9" class="text-center nopad-bottop">

                            <img
                                v-if="file.filetype == 'image'"
                                class="max100 fade"
                                :src="
                                    $url +
                                    'public/f/' +
                                    sharekey+'/'+
                                    file.filepath +
                                    file.filename+'/file'
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
                                :src="
                                    $url +
                                    'files/' +
                                    file.filepath +
                                    file.filename
                                "
                                :poster="$url+'public/f/'+sharekey+'/'+file.filepath+file.videopreview.file+'/'+file.videopreview.file"

                                :autoplay="true"
                                :volume="volume"
                            ></vue-player>

                            <a :href="$url+'public/f/'+sharekey+'/'+file.filepath+file.filename+'/'+file.originalfilename" 
                                :download="file.filename"
                                 v-if="file.filetype == 'file'">
                                <h2 class="white--text">
                                    Download
                                    <v-icon>mdi-download</v-icon>
                                    <br>
                                    {{file.filename}}
                                    <br>
                                    {{file.filesize}}
                                </h2>
                            </a>

                        </v-col>

                        <v-col cols="3" class="white--text">
                            <v-row>
                                <v-col cols="12"
                                    ><p>Date: {{ file.filedate }}</p>
                                    </v-col>

                                <v-col cols="12"
                                    ><p :title="file.filesize">Size: {{ file.filesize }}</p></v-col
                                >
                                
                                <v-col cols="12">
                                    <a :href="$url+'public/f/'+sharekey+'/'+file.filepath+file.filename+'/'+file.filename" 
                                        :download="file.filename" class="white--text">
                                        Download
                                        <v-icon>mdi-download</v-icon>
                                        {{file.filename}} ({{file.filesize}})
                                    </a>
                                    
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
                this.volume = 0;
            }
        }
    },
    data: () => ({
        /**
         * volume for the videoplayer, is set to 0 if dialog is closed
         */
        volume:1,

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
    },
    methods: {
    },
};
</script>
