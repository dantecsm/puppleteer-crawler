const fs = require('fs');
const assert = require('assert');
const puppeteer = require('puppeteer');

const outputFile = 'danmakuList.json'
const errorLog = 'ErrorData.json'

var arr = []
var err = []
var begin = 2019
var total = 283834

var scrape = async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Users/20544/Desktop/chrome-win/chrome.exe',
    headless: false
  });
  const page = await browser.newPage();
  const pageURL = createPageURL(total)

  await page.goto(pageURL[0]);

  for (let start = begin; start < pageURL.length; start++) {
    try {
      page.goto(pageURL[start])
      await page.waitForNavigation();
    } catch (e) {
      err.push({url: decodeURI(pageURL[start]), reason: '网页打不开', error: e})
      fs.writeFileSync(errorLog, JSON.stringify(err))
      console.log(decodeURI(pageURL[start]) + ' 抽取错误因为网页打不开--------------------------------------------------------------')
      console.log('---------------------------------------------------------------------------------------------------------------')
      continue
    }

    try {
      var result = await page.evaluate(() => {
        var cols = JSON.parse(document.body.innerText).data.archives.map(archive => {
          var {aid, tid, pic, title, desc} = archive
          return {aid, tid, pic, title, desc}
        })
        return cols
      })

      assert(result !== null)

      arr = arr.concat(result)

      if(start % 100 === 0 || pageURL.length - start < 100) {
        fs.writeFileSync(outputFile, JSON.stringify(arr))
      }

      console.log(`${start+1} / ${pageURL.length}: ${decodeURI(pageURL[start])} 数据抽离完成！`)
    } catch (e) {
      err.push({url: decodeURI(pageURL[start]), reason: '解析失效', error: e})

      fs.writeFileSync(errorLog, JSON.stringify(err))

      console.log(decodeURI(pageURL[start]) + ' 抽取错误因为数据误解析--------------------------------------------------------------')
      console.log('---------------------------------------------------------------------------------------------------------------')
    }
  }

  browser.close();
  return 'ok';
};

scrape().then((value) => {
  console.log('全部网站数据获取成功');
});


/* util function */
async function getResourceTree(page) {
  var resource = await page._client.send('Page.getResourceTree');
  return resource.frameTree;
}

async function getResourceContent(page, url) {
  const {content, base64Encoded} = await page._client.send(
    'Page.getResourceContent',
    {frameId: String(page.mainFrame()._id), url},
  );
  assert.equal(base64Encoded, true);
  return content;
};

async function downloadImage(page, url, filename) {
  filename = 'download/' + filename;
  const content = await getResourceContent(page, url);
  const contentBuffer = Buffer.from(content, 'base64');
  fs.writeFileSync(filename, contentBuffer, 'base64');
}

async function sleep(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

function createPageURL(size = 20000) {
  size = Math.ceil(total / 50)
  console.log('一共需要爬取' + size + '页')

  var pageURL = []

  for(var i=begin; i<=size; i++) {
    pageURL.push(`https://api.bilibili.com/x/web-interface/newlist?rid=154&type=0&pn=${i}&ps=50`)
  }

  return pageURL
}
