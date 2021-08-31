function toStr(orignaldate){
    orignaldate-=0;
    let filedate = new Date(orignaldate);

    console.log(filedate);

    let filedatestr = filedate.getFullYear()
                    +"-"+((filedate.getMonth()+1)+"").padStart(2,'0')
                    +"-"+(filedate.getDay()+"").padStart(2,'0')
                    +" "
                    +(filedate.getHours()+"").padStart(2,'0')
                    +":"+(filedate.getMinutes()+"").padStart(2,'0')
                    +":"+(filedate.getSeconds()+"").padStart(2,'0')


    return filedatestr;
}

module.exports={
    toStr
}