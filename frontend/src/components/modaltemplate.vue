<template>
    <!-- global modal -->
      <v-dialog
        v-model="modal.open"
        persistent
        width="500"
      >
 
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            {{modal.header}}
          </v-card-title>
  
          <v-card-text>
            <h4>Message:</h4>
            {{modal.text}}
            <template v-if="modal.source">
              <v-divider></v-divider>
              <h4>Source:</h4>
              <pre>
                {{modal.source}}
              </pre>
            </template>

          </v-card-text>
  
          <v-divider></v-divider>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="modal.open = false"
            >
              Schließen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script>
import eventHub from "./eventhub.js"  
export default {
  data: () => ({
    modal:{
      open:false,
      header:"",
      text:"",
      source:""
    }
  }),
  created(){
    eventHub.$on("open-modal",(data)=>{
      console.log("open-modal");
      this.modal.open = true;
      this.modal.header = data.title;
      this.modal.text = data.message;
      this.modal.source = data.source;
    });
  },
  beforeDestroy() {
    eventHub.$off('custom-event')
  }
};
</script>
