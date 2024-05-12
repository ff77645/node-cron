const fs = require('fs')
const puppeteer = require('puppeteer-core')


async function main(){
  const browser = await puppeteer.launch({
    headless:'shell',
    executablePath:'/usr/bin/google-chrome',
    args:['--no-sandbox'],
    timeout:60000
  });

  // Create a page
  const page = await browser.newPage();
  const url = 'https://top.baidu.com/board?tab=realtime'

  await page.goto(url)

  const listWrap = await page.$('#sanRoot > main > div.container.right-container_2EFJr > div > div:nth-child(2)')

  const dataList = await listWrap.$$eval('.category-wrap_iQLoo.horizontal_1eKyQ',nodes=>{
    return nodes.map(node=>{
      const detailUrl = node.querySelector('.img-wrapper_29V76')?.href
      const imgUrl = node.querySelector('.img-wrapper_29V76 > img')?.src
      const title = node.querySelector('.content_1YWBm>a .c-single-text-ellipsis')?.innerText
      return {
        imgUrl,
        title,
        detailUrl
      }
      
    })
  })
  fs.writeFileSync('./data.json',JSON.stringify(dataList,null,2))
  
  await browser.close()
}

main()