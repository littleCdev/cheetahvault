<style scoped>
.transparent {
    background-color: transparent;
}
.float-right {
    float: right;
}
.w100 {
    width: 100vw !important;
    max-width: 100vw;
}
._100 {
    z-index: 100 !important;
    height: 100vh !important;
    width: 100vw !important;
}
._1002 {
    height: 100vh !important;
    width: 100vw !important;
    max-width: 100vw;
}

.dropmsg {
    font-size: 1.7rem;
    text-align: center;
    line-height: 100vh;
}

.bg {
    background-color: rgba(80, 80, 80, 0.548) !important;
}
</style>

<template>
    <v-app class="transparent">
        <v-overlay :value="hover" class="_100">
            <v-container
                class="_1002"
                @drop.prevent="dropevent"
                @dragleave.prevent
                @dragenter.prevent
                @dragover.prevent
            >
                <p class="dropmsg">
                    Drop files
                    <v-icon>mdi-cloud-upload</v-icon>
                </p>
            </v-container>
        </v-overlay>
        <Menu></Menu>

        <v-main>
            <div
                class="fill-height w100 transparent"
                @dragenter.prevent="hover = true"
            >
                <h4 class="text-center">Drag and drop files</h4>

                <v-row>
                    <v-col cols="8" offset="2">
                        <v-list class="bg">
                            <v-list-item-group>
                                <v-list-item
                                    v-for="(file, index) in files"
                                    :key="index"
                                    two-line
                                >
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            <p>
                                                <span class="text-left">{{
                                                    file.name
                                                }}</span>

                                                <span
                                                    v-if="file.progress == 100"
                                                    class="float-right"
                                                >
                                                    <v-icon class=""
                                                        >mdi-check</v-icon
                                                    >
                                                </span>
                                            </p>
                                        </v-list-item-title>
                                        <br />
                                        <v-list-item-subtitle>
                                            <v-progress-linear
                                                :value="file.progress"
                                            >
                                            </v-progress-linear>
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-col>
                </v-row>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import Axios from "axios";
import Menu from "./menu.vue";
export default {
    data: () => ({
        hover: false,
        files: [],
    }),
    methods: {
        /**
         * handles files that are pasted from clipboard and adds them to the uploadqueue
         */
        pasteevent(event){
            console.log("pasted");
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            
            for (let index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let blob = item.getAsFile();
                    console.log(blob);
                    let file = {
                        date: blob.lastModified,
                        file: blob,
                        name: blob.name,
                        progress: 0,
                        thumbnail: "",
                    };
                    this.files.push(file);
                    this.upload(file);
                }
            }
        },
        /**
         * handles files from the dropevent and adds them to the uploadqueue
         */
        dropevent(e) {
            this.hover = false;
            let droppedFiles = e.dataTransfer.files;
            if (!droppedFiles) return;
            console.log(droppedFiles);

            droppedFiles.forEach((element) => {
                console.log(new Date(element.lastModified));

                let file = {
                    date: element.lastModified,
                    file: element,
                    name: element.name,
                    progress: 0,
                    thumbnail: "",
                };
                this.files.push(file);
                this.upload(file);
            });
        },
        /**
         * uploads a single file 
         */
        async upload(file) {
            let formdata = new FormData();
            formdata.append("file", file.file);
            formdata.append("date", file.date);

            //let self = this; // little "hack" to have access to "this" inside th axioscallback
            let x = await Axios.post("upload", formdata, {
                onUploadProgress: function (progressEvent) {
                    var percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log(percentCompleted);
                    file.progress = percentCompleted;
                },
            });
            file.progress = 100;
            file.thumbnail = x.data.filepath + x.data.thumbnail;
            file.result = x.data;
        },
    },

    created(){
        console.log("created");
        document.onpaste = this.pasteevent;
    },
    components: {
        Menu,
    },
};
</script>
