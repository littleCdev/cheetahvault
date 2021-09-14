import eventHub from "./eventhub"
export default{
    open(title,message,source=null){
        console.group("emitting")
        console.log(title)
        console.log(message)
        console.groupEnd("emitting")
        eventHub.$emit("open-modal",{title,message,source});
    },
    close(){
        eventHub.$emit("close-modal");
    }
}