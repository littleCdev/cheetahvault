import axios from "axios";



async function login(){
    try{
        await axios.get("login/");
        return "user";
    }catch(error){
        if(error.response.status == 403){
            return "login";
        }else if(error.response.status == 303){
            return "signup";
        }
    }
}

export default login;