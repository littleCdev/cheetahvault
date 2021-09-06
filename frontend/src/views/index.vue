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

<template>
    <div>
        <Menu></Menu>

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
                                    'f/' +
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
                                    'f/' +
                                    dialog.filepath +
                                    dialog.filename
                                "
                                :poster="
                                    $url +
                                    'f/' +
                                    dialog.filepath +
                                    dialog.videopreview
                                "
                                :autoplay="true"
                            ></vue-player>

                            <!--- files, just show download icon --->
                            <a :href="$url+'f/'+dialog.filepath+dialog.filename" 
                                :download="dialog.originalfilename">
                                <h2 class="white--text">
                                    Download
                                    <v-icon>mdi-download</v-icon>
                                    <br>
                                    {{dialog.originalfilename}}
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
                <v-card
                    v-for="(file, index) in files"
                    :key="index"
                    @click="
                        dialog = file;
                        dialogopen = true;
                        getTags();
                    "
                    class="mx-auto my-12"
                    max-width="374"
                >
                    <v-img
                        v-if="file.filetype!='file'"
                        :width="file.thumbnailx"
                        :height="file.thumbnaily"
                        class="white--text align-end"
                        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                        contain
                        :src="$url + 'f/' + file.filepath + file.thumbnail"
                    >
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
                        <v-card-title v-text="file.originalfilename"></v-card-title>
                           
                    </v-img>



                </v-card>
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
import eventHub from "../components/eventhub";
export default {
    data: () => ({
        search: "",

        editmode: false,

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
        pageEndReached(/*entries, observer*/) {
            console.log(`pageEndReached`);
            this.loadNextPage();
        },

        async loadNextPage() {
            if (this.loading || this.endreached) return;

            this.page += 1;

            try {
                this.loading = true;
                console.log(`loading new page: ${this.page}`);
                let x = await Axios.get(
                    `images/${this.page}?search=${this.search}`
                );

                if (x.data.length == 0) {
                    console.log(`no images left after page: ${this.page}`);
                    this.endreached = true;
                    return;
                }

                for (let i = 0; i < x.data.length; i++) {
                    const element = x.data[i];
                    this.files.push(element);
                }

                this.loading = false;
            } catch (error) {
                console.log(error);
            }
        },

        async makePrivate() {
            try {
                let data = null;
                if (this.dialog.showinindex) {
                    data = await Axios.delete(
                        `image/${this.dialog.filename}/hidden`
                    );
                } else {
                    data = await Axios.put(
                        `image/${this.dialog.filename}/hidden`
                    );
                }
                console.log(data);
            } catch (e) {
                console.log(e);
            }
        },
        async getTags() {
            console.log("getting tags");
            this.values = [];
            try {
                let data = await Axios.get(`image/${this.dialog.id}/tags`);
                this.values = data.data;
            } catch (e) {
                console.log(e);
            }
        },
        async getAllTags() {
            try {
                let data = await Axios.get("tags");
                this.tags = data.data;
            } catch (e) {
                console.log(e);
            }
        },

        async saveTags() {
            try {
                await Axios.put(`image/${this.dialog.id}/tags`, {
                    tags: this.values,
                });
            } catch (e) {
                console.log(e);
            }
            this.getAllTags();
        },
        tagfilter(item, query, imtemText) {
            console.log(item);
            console.log(query);
            console.log(imtemText);

            if (this.values.includes(imtemText)) return 0;

            if (imtemText.startsWith(query)) return 1;

            return 0;
        },
        async getFiles() {
            this.loading = true;
            this.endreached = true;
            this.page = 0;
            let x = await Axios.get(
                `images/${this.page}?search=${this.search}`
            );
            this.loading = false;
            this.endreached = false;

            this.files = x.data;
            console.log("getFiles done");
        },
    },

    watch: {
        dialogopen: function (newValue) {
            if (!newValue) {
                this.dialog = null;
                this.fullimageloaded = false;
            }
        },
    },
    created() {
        console.log(this.$url);
        eventHub.$on("editmode", () => {
            this.editmode = !this.editmode;
        });
        eventHub.$on("search", (search) => {
            console.log(`searching...  ${search}`);
            this.search = search;
            this.getFiles();
        });
    },
    mounted() {
        this.getFiles();
        this.getAllTags();
    },
    components: {
        Menu,
        vuePlayer,
    },
};
</script>
