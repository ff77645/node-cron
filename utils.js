exports.awaitFn = async time=>{
  return new Promise(r=>setTimeout(r,time))
}