const puppeteer = require('puppeteer-core')
const http = require('https')
const dns = require('dns')
const fs = require('fs')
const {awaitFn} = require('../utils.js')


main()

async function main(){
  const host = await getHost()
  const baseUrl = host.domain
  const pages = 2


  const browser = await puppeteer.launch({
    headless:'shell',
    executablePath:'/usr/bin/google-chrome',
    args:['--no-sandbox'],
    timeout:60000
  });
  const page = await browser.newPage();
  const dataList = []
  for(let i = 1;i<pages;i++){
  const fullPath = `${baseUrl}/thread0806.php?fid=25&search=&page=${i}`
    await page.goto(fullPath)
    const table = await page.$('#ajaxtable')
    if(!table) {
      await page.screenshot({
        fullPage:true,
        path:`./screenshot/caoliu/calou_page_${i}.png`
      })
      browser.close()
      throw new Error('table 不存在')
    }
    
    const data = await getPageData(page,{
      baseUrl,
      currentPage:i
    })
    dataList.push(...data)
    await awaitFn(2000)
  }

  fs.writeFileSync('./caoliu-datalist.json',JSON.stringify(dataList,null,2))

  await browser.close()
}

async function getPageData(page,{baseUrl,currentPage}){

  await page.screenshot({
    fullPage:true,
    path:`./screenshot/caoliu/calou_page_${currentPage}.png`
  })
  
  const data = await page.$$eval('#ajaxtable #tbody>tr',nodes=>{
    return nodes.map(node=>{
      const ta = node.querySelector('td.tal a')
      const title = ta?.innerText
      const url = ta?.href
      const timestamp = node.querySelector('tr>td:nth-child(3) .s3')?.dataset?.timestamp
      const reply = node.querySelector('tr>td:nth-child(4)')?.innerText
      const download = node.querySelector('tr>td:nth-child(5)')?.innerText
      return {
        title,
        url,
        timestamp,
        reply:isNaN(+reply) ? 0 : +reply,
        download:isNaN(+download) ? 0 : +download
      }
    })
  })
  return data
}

async function getHost(){
  const urls = [
    'https://cl.y66t.eu.org',
    'https://cl.7207x.xyz',
    'https://cl.7207y.xyz',
    'https://cl.7207z.xyz',
    'https://www.t66y.com'
  ]

  const checkHost = host =>{
    return new Promise((resolve,reject)=>{
      const res = http.request({method:'GET',host,port:443},res=>{
        res.statusCode === 200 ? resolve(host) : reject(host)
      })
      res.on('error',(err)=>{
        reject(err)
      })
      res.end()
    })
  }

  const getHost = domain =>{
    return new Promise((resolve,reject)=>{
      dns.resolve(domain,(err,address)=>{
        if(err) return reject(err)
        resolve({
          domain,
          address
        })
      })
    })
  }

  return await Promise.any(urls.map(url=>getHost(url)))
}