import eventHub from "./eventhub"
export default{
    show(message){
        console.group("emitting-toast")
        console.log(message)
        console.groupEnd("emitting-toast")
        eventHub.$emit("open-toast",{message});
    },
    close(){
//        eventHub.$emit("close-toast");
    }
}