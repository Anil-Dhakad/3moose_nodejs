var express = require('express');
var router = express.Router();
const axios = require('axios');
var fetch = require('node-fetch');
const cheerio = require('cheerio');
var yahooFinance = require('yahoo-finance');
var moment = require('moment')

router.get('/', async function (req, res, next) {
  console.log('hello')
  res.send('hello')
})
router.get('/top50', async function (req, res, next) {

  let to_date = moment.parseZone(moment().unix() * 1000).format("YYYY-MM-DD");

  let today_day = (new Date()).getDay()

  let d = new Date(to_date);
  if (today_day === 5) d.setDate(d.getDate() - 4);
  else if (today_day === 6) d.setDate(d.getDate() - 5);
  else if (today_day === 7) d.setDate(d.getDate() - 6);
  else d.setDate(d.getDate() - 7);

  let from_date = moment.parseZone(moment(d).unix() * 1000).format("YYYY-MM-DD");

  var SYMBOLS = [
    "VFTNX", "VDADX", "HAIAX", "CSXAX", "VMCTX", "TNWCX", "VINIX", "PRCOX", "USSPX", "FLCPX",
    'TIBIX', 'VDIGX', 'GEQYX', 'AUEIX', 'WFSPX', 'SWPPX', 'TISPX', 'FXAIX', 'FDFIX', 'GESSX',
    'SPINX', 'TISCX', 'PREIX', 'PRDGX', 'VRNIX', 'FITLX', 'PRBLX', 'GQEFX', 'VTCIX', 'VLACX',
    'PXLIX', 'SUSIX', 'DSEEX', 'NINDX', 'SNXFX', 'VRTTX', 'SRFMX', 'DFELX', 'DTMEX', 'BKTSX',
    'VFINX', 'SPFIX', 'LCIAX', 'NOSIX', 'SSEYX', 'SVSPX', 'SWTSX', 'FSKAX', 'HCMGX', 'DURPX'
  ];
  var FROM = from_date;
  var TO = to_date;

  yahooFinance.historical({
    symbols: SYMBOLS,
    from: FROM,
    to: TO
  }, function (err, result) {
    if (err) { throw err; }

    let object = []
    Object.values(result).map(function (k) {
      let innerObj = {}
      k.map((i, j) => {
        if (j === 0) innerObj.symbol = i.symbol
        innerObj[`${moment.parseZone(Date.parse(i.date)).format("YYYY-MM-DD")}`] = i.close
      })
      object.push(innerObj)
    })
    res.send({ data: object })
  });
})

router.get('/vanguardfunds', async function (req, res, next) {
  console.log('vanguardfunds')
  const url = 'https://money.usnews.com/funds/search?category=large-blend&name=Vanguard&etfs=true&mutual-funds=true';

  axios.get(url)
    .then(response => {
      console.log(response.data)
      const $ = cheerio.load(response.data);

      // console.log(response.data)

      let company = []

      $('div.DetailCardFunds__DetailCardBox-siloli-9')
        .each((i, elem) => {
          let innerObj = {
            FullName: $(elem).find('p.Heading__HeadingStyled-sc-1w5xk2o-0-p').text(),
            Ticker: ($(elem).find('span.fsjjRt').text()).split(' ')[0],
            Url: $(elem).find('a.Anchor-byh49a-0').attr('href'),
            Description: $(elem).find('p.Paragraph-sc-1iyax29-0').text(),
            ExpensionRatio: $(($(elem).find('div.DetailCardFunds__QuickRow-siloli-5')).find('div.Box-w0dun1-0')[1]).text(),
            TotalAssets: $(($(elem).find('div.DetailCardFunds__QuickRow-siloli-5')).find('div.Box-w0dun1-0')[2]).text(),
          }
          company.push(innerObj)
        })
      $.html();
      res.send({ admindata: company })
    })
})

module.exports = router;