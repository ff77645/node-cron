const {CronJob} = require("cron")
const {resolve} = require("path")
const {execFile} = require("child_process")
const jobConfigs = require('./job.config.js')
require('dotenv').config()



const logger = {
  log(...args){
    console.log(new Date().toLocaleString(),...args)
  },
  error(...args){
    console.error(new Date().toLocaleString(),...args)
  },
}


function runJob(config){
  logger.log(`任务: ${config.name} 已注册.`);
  const file = resolve('./jobs',config.path)
  return ()=>{
    const startTime = Date.now()
    logger.log(config.name,'开始执行~~~')
    execFile('node',[file],(error,stdout,stderr)=>{
      if(error) return logger.error(`${config.name}, 执行失败.`,error)
      if(stdout) logger.log(`${config.name} > stdout:\n${stdout}`)
      if(stderr) logger.error(`${config.name} > stderr:\n${stderr}`)
      logger.log(config.name,'执行完成.',`耗时:${Date.now() - startTime}`)
    })
  }
}

jobConfigs.forEach(config=>{
  new CronJob(
    config.cron,
    runJob(config),
    null,
    true
  )
})

