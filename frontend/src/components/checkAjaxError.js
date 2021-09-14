import modal from "./modal";

async function check(err){
    console.log(err.response);
    
    if(err.response.status == 403){ // dont show body since it might contain passwords
        modal.open("Error",err.response.data.message);
    }else{
        modal.open("Error",err.response.data.message,err.response.config);
    }
}
export default check;