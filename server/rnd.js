module.exports={
    filename:(length=10,filename="")=>{
        let range = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+_";
        let count = range.length;

        let name = "";
        for (let i = 0; i < length; i++) {
            let index = Math.floor(Math.random()*count+1);
            name += range.charAt(index);
        }


        if(filename.length > 0){
            let dot = filename.lastIndexOf(".");
            if(dot>0){
                name+=filename.substr(dot);
            }
        }


        return name;
    }
}