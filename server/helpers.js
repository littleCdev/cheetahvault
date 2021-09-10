/**
 * 
 * @param {timestamp} orignaldate 
 * @returns {string} timestamp formatted as YYYY-MM-DD HH:mm:ss
 */
function DatetimeToStr(orignaldate){
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


// stolen from https://stackoverflow.com/a/14919494
/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
 function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
}

  

module.exports={
    DatetimeToStr,
    humanFileSize
}