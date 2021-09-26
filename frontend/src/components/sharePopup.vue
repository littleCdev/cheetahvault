<style scoped>

</style>

<template>
    <v-dialog v-model="open">
        <v-card>
            <v-card-title>
                Share
            </v-card-title>
            <v-card-text>
                <v-row >
                    <v-col cols="12">
                        <v-list>
                            <v-subheader inset>New sharelink</v-subheader>
                            <v-list-item-group>
                                <v-list-item @click="createNewShare()">
                                    <v-list-item-icon>
                                        <v-icon class="black--text">mdi-folder-plus-outline</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-title>
                                        New link
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list-item-group>

                            <v-divider inset></v-divider>
  
                            <v-subheader inset>Existing shares</v-subheader>
                            <v-list-item-group>
                                <v-list-item
                                    v-for="(share,index) in existingShares" :key="index"
                                    @click.stop="putLinkToClipboard(share.key)"
                                >
                                    <v-list-item-icon>
                                        <v-icon class="black--text">mdi-share</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            {{share.key}}
                                        </v-list-item-title>
                                        

                                        <v-list-item-subtitle>
                                            created {{share.sharedate}}
                                        </v-list-item-subtitle>
                                    </v-list-item-content>

                                    <v-list-item-action>
                                        <v-btn icon @click.stop="revokeShare(share.key)" title="revoke share">
                                            <v-icon color="grey lighten-1">mdi-folder-remove</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
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
import axiosError  from "../components/checkAjaxError";

export default {
    props:{
        file:{
            type:String,
            optional:true,
            default:undefined
        },
        album:{
            type:String,
            optional:true,
            default:undefined
        }
    },
    data: () => ({
        open:true,
        existingShares:[]
    }),
    methods: {
        async revokeShare(sharekey){
            //alert(`revoke ${sharekey}`);
            try{
                this.loading = true;
                await axios.delete(`share/${sharekey}`);
                
                // i'm too lazy to remove the entry from the array atm
                this.getExistingShares();
            }catch(e){
                console.log(e);
                axiosError(e);
            }finally{
                this.loading = false;
            }
        },
        async putLinkToClipboard(sharekey){
            //alert(`putLinkToClipboard ${sharekey}`);
            let url = `${window.location.origin}/#/s/${sharekey}`

            navigator.clipboard.writeText(url).
                then(function() {
                    console.log('Async: Copying to clipboard was successful!');
                }, function(err) {
                    console.error('Async: Could not copy text: ', err);
                });
        },

        /**
         * creates a new sharelink
         */
        async createNewShare(){
            let url = this.file? `share/file`:`share/album`;
            try{
                this.loading = true;
                let res = await axios.put(url,{
                    key:this.file || this.album
                });
                console.log(res.data);
                this.existingShares.unshift(res.data);
            }catch(e){
                console.log(e);
                axiosError(e);
            }finally{
                this.loading = false;
            }
        },
        
        /**
         * gets all existing shares for this file 
         */
        async getExistingShares(){

            let url = this.file? `share/file/${this.file}`:`share/album/${this.album}`;

            try {
                this.loading = true;
                let data = await axios.get(url);
                this.existingShares = data.data;
                console.log(data);
            } catch (error) {
                console.log(error);
                axiosError(error);
            }finally{
                this.loading = false;
            }
        }
    },
    watch:{
        open:function(val){
            if(val === false){
                eventhub.$emit("createShareClosed");
            }
        }
    },
    mounted(){
        this.getExistingShares();
        this.open=true;
    }
};
</script>
