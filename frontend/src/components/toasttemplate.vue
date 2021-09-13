<template>
    <v-snackbar
        v-model="toast.open"
        top
        left
      >
        {{ toast.text }}
  
        <template v-slot:action="{ attrs }">
          <v-btn
            color="pink"
            text
            v-bind="attrs"
            @click="toast.open = false"
          >
            X
          </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
import eventHub from "./eventhub.js";

export default {
  data: () => ({
    toast:{
        open:false,
      text:""
    }
  }),
  created(){
    eventHub.$on("open-toast",(data)=>{
      console.log("open-toast");
      this.toast.open = true;
      this.toast.text = data.message;
    });
  },
  beforeDestroy() {
    eventHub.$off('open-toast')
  }
}
</script>