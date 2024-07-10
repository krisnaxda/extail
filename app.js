const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const ShortUniqueId = require('short-unique-id')
const { body, validationResult, check } = require('express-validator')
const bodyParser = require('body-parser');


const app = express()
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }))
const sitelink = 'http://localhost:3000/'

const urlMap = {};

//add mongo connect
const short = require('./model/url')


//add ejs 
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

app.listen(port, (() => {
    console.log(`Extail Running on http://localhost:${port}`)
}))



  // index page
  app.get('/', (req, res) => {
    const locals = {
      title: 'Homepage',
      description: 'Page Description',
      layout: 'partials/header.ejs'
    };
    res.render('index', locals)
  });


  // function generate short id
  async function generateShortId() {
    const uid = await new ShortUniqueId({
      length: 5
    });
    const shortId =  await uid.rnd()
    const checkId = await short.findOne({ shortLink: shortId })
    do {
      const shortId =  await uid.rnd()
    } while (checkId);
    return shortId;
  }


  //add shortener url
  app.post('/short',body('url').isURL(),async (req,res) => {
    const longUrl = req.body.url
    const protocolRegex = /(http|https):\/\//;
    const ogLink = longUrl.replace(protocolRegex, ''); 
    const locals = {
      title: 'Url Not Valid',
      layout: 'partials/header.ejs',
      longUrl
    }
    const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.render('notvalid', locals)
      }
        
        const shortLink = await generateShortId()
        
        const saverURL = await new short({ogLink: ogLink})
        saverURL.shortLink = await shortLink
        saverURL.visit = 0

        await short.insertMany(saverURL).then( () => {
          res.redirect(`/short/${shortLink}`)
        })
  })


  app.get('/short/:url', async (req, res) => {
    const url = await short.findOne({ shortLink: req.params.url });
    const query = req.params.url;
    const locals = {
      title: 'Shorting URL Success',
      description: 'Url Shortener Success',
      layout: 'partials/header.ejs',
      url,
      query,
      sitelink
    };

    if(url == null){
      return res.status(404).send(`Url Not found! data : ${url} || parameter ${query}`)
    }else{
      console.log(url)
      return res.render('success', locals)
    }
  })
  
// Redirect function
const redirect = async (req, res) => {
  const shortId = await req.params.shortUrl;

  try {
     const shortUrlData = await short.findOne({shortLink: shortId})

     if(!shortUrlData) {
      console.log(shortUrlData)
      return res.status(404).send(`Url Not found! data : ${shortUrlData} || parameter ${shortId}`)
     }
      
    shortUrlData.visit++
    await shortUrlData.save()

    const redirectUrl = `http://${shortUrlData.ogLink}`
    res.redirect(301, redirectUrl)
  }catch (err) {
    console.error('Error fetching shortened URL:', err)
    res.status(500).send('Internal server werror')
  }
}


//page redirect 
app.get('/:shortUrl', redirect);


module.exports = app