<style>
.max100 {
    width: initial;
    max-width: 100%;
    max-height: 90vh;
}

.nopad-bottop {
    padding-bottom: 0;
    padding-top: 0;
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


.whitebg {
    background-color: rgba(71, 71, 71, 0.774) !important;
}
a{
    /* i don't like the underline for links */
    text-decoration: none;
}
</style>>


<template>
    <div>
        <Menu></Menu>
        
        <lightBox
            v-if="album && !isfile"
            :files="album.files"
            :index=selectedIndex
            :notags=true
        ></lightBox>
       
        <v-main v-if="!isfile && album">
            <v-row>
                <v-col cols="8" offset="2">
                    <v-text-field
                        ref="title"
                        :disabled=true
                        class="bigtext"
                        color="white"
                        label="Album name"
                        v-model="album.name"
                    ></v-text-field>
                </v-col>
                <masonry-infinite-grid
                    class="container"
                    v-bind:gap="5">

                    <div
                        class="item"
                        v-for="(item,index) in album.files"
                        :key="index"
                    >
                        <v-card    
                            @click="selectedIndex=index;"
                            class="mx-auto my-12 hoveractivator"
                        >
                            <v-img 
                                v-if="item.filetype!='file'"
                                :width="item.thumbnail.x"
                                :height="item.thumbnail.y"
                                class="white--text "
                                
                                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                                contain
                                :src="$url + 'public/f/' + sharekey+'/'+ item.filepath + item.thumbnail.file+'/thumb'"
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
                                <v-card-title v-text="item.filename"></v-card-title>
                                
                            </v-img>
                        </v-card>
                    </div>
                </masonry-infinite-grid>      
            </v-row>
        </v-main>

        <v-main v-else-if="isfile && file">
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
                                    'public/f/' +
                                    sharekey+'/'+
                                    file.filepath +
                                    file.filename+'/x'
                                "
                                :width="file.imagex"
                                :height="file.imagey"
                            />

                            <vue-player
                                v-if="file.filetype == 'video'"
                                class="video"
                                :src="$url+'public/f/'+sharekey+'/'+file.filepath+file.filename+'/'+file.filename"
                                :poster="$url+'public/f/'+sharekey+'/'+file.filepath+file.videopreview.file+'/poster'"

                                :autoplay="false"
                            ></vue-player>

                            <a :href="$url+'public/f/'+sharekey+'/'+file.filepath+file.filename+'/'+file.filename" 
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

                                <v-col cols="12">
                                    <p :title="file.filesize">Size: {{ file.filesize }}</p>
                                </v-col>

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
        </v-main>

    </div>
</template>

<script>
import Menu from "./menuplain.vue";
//import eventHub from "../components/eventhub";
import { MasonryInfiniteGrid } from "@egjs/vue-infinitegrid";
import axios from 'axios';
import axiosError  from "../components/checkAjaxError";
import vuePlayer from "@algoz098/vue-player";


import lightBox from "../components/lightBoxpublic.vue";
export default {
    components: {
        Menu,
        MasonryInfiniteGrid,
        lightBox,
        vuePlayer
    },
    data: () => ({

        sharekey:"",

        isfile:undefined,

        file:null,

        album:null,

        /**
         * selected fileindex for lightbox
         * (index of this.files)
         */
        selectedIndex:-1,

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
        async getShare(){
            try {
                this.loading = true;
                
                let res = await axios.get(`/public/${this.sharekey}`)
                console.log(res);

                if(res.data.type==0){
                    this.isfile = true;
                    this.file = res.data.data;
                }else{
                    this.album = res.data.data;
                    this.isfile = false;
                }

            } catch (error) {
                axiosError(error);
            }finally{
                this.loading = false;
            }
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
    },
    async mounted() {
        this.sharekey = this.$route.params.key;
        this.getShare();
    },

};
</script>
