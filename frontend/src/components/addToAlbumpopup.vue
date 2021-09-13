<style scoped>

</style>

<template>
    <v-dialog v-model="open">
        <v-card>
            <v-card-title>
                Add {{files.length}} files to 
            </v-card-title>
            <v-card-text>
                <v-row >
                    <v-col cols="12">
                        <v-list>
                            <v-subheader inset>New albums</v-subheader>
                            <v-list-item-group>
                                <v-list-item @click="newAlbum()">
                                    <v-list-item-icon>
                                        <v-icon class="black--text">mdi-folder-plus-outline</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-title>
                                        New album
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list-item-group>

                            <v-divider inset></v-divider>
  
                            <v-subheader inset>existing albums</v-subheader>
                            <v-list-item-group>
                                <v-list-item
                                    v-for="(album,index) in existingAlbums" :key="index"
                                    @click="existingAlbum(album.albumkey)"
                                >
                                    <v-list-item-icon>
                                        <v-icon class="black--text">mdi-image-album</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            {{album.albumname}}
                                        </v-list-item-title>
                                        

                                        <v-list-item-subtitle>
                                            {{album.albumdate}}
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-col>

                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>  
</template>

<script>
import axios from 'axios';
import eventhub from "../components/eventhub";

export default {
    props:{
        files:{
            type:Array,
            optional:false
        },
    },
    data: () => ({
        newAlbumName:"",
        open:true,
        existingAlbums:[]
    }),
    methods: {
        /**
         * adds files to the selected existing album and closes this diaload
         */
        async existingAlbum(key){
            console.log("existingAlbum")
            let fileKeys = [];

            for (let i = 0; i < this.files.length; i++) {
                fileKeys.push(this.files[i].filename);
            }
            try{
                let res = await axios.put(`/albums/${key}/files`,{
                    files:fileKeys
                });
                console.log(res.data);
            }catch(e){
                console.log(e);
            }
        },
        /**
         * creates a new album with default name and adds the files and forwards to the new album to edit the name
         */
        async newAlbum(){
            console.log("newAlbum")
            let fileKeys = [];

            for (let i = 0; i < this.files.length; i++) {
                fileKeys.push(this.files[i].filename);
            }
            try{
                let res = await axios.put("/albums/",{
                    files:fileKeys
                });
                console.log(res.data);

                this.$router.replace({
                    name: "album",
                    params:{
                        key:res.data.key
                    },
                    query:{
                        'edit':true
                    }
                });
            }catch(e){
                console.log(e);
            }
        },
        /**
         * gets all existing albums 
         */
        async getExistingAlbums(){
            try {
                let data = await axios.get("albums/")
                this.existingAlbums = data.data;
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        }
    },
    watch:{
        open:function(val){
            if(val === false){
                eventhub.$emit("addToAlbumClosed");
            }
        }
    },
    mounted(){
        this.getExistingAlbums();
        this.open=true;
    }
};
</script>
