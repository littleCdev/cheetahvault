import axios from "axios";



async function login(){
    try{
        await axios.get("login/");
        return "user";
    }catch(error){

        // errors like "network error" do not have an response
        if(error.response === undefined)
            throw error;

        if(error.response.status == 403){
            return "login";
        }else if(error.response.status == 303){
            return "signup";
        }else{
            throw error;
        }
    }
}

export default login;