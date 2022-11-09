let arc = require('@architect/functions')
let data = require('@begin/data')
const fetch = require('node-fetch')
var jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' })
const { URLSearchParams } = require('url');
const TelegramBot = require('node-telegram-bot-api');
var escape = require('escape-html');
const util = require('util');
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TG_TOKEN
const tgbot=new TelegramBot(token)

async function reftoken(refresh_token){
    //take refresh_token and refresh it ,returning the new a_token,and update it in the db
    //db.key is jwt's sub
    const params = new URLSearchParams();
    params.append('client_id', process.env.CLIENT_ID);
   // params.append('scope', 'Calendars.ReadWrite ChannelMessage.Read.All Mail.ReadWrite Mail.Send offline_access openid User.Read');
   params.append('refresh_token', refresh_token);
   // params.append('redirect_uri', process.env.REDIRECT_URI);
    params.append('grant_type', 'refresh_token');
    params.append('client_secret', process.env.CLIENT_SECRET);
    
    
    res=await fetch('https://login.microsoftonline.com/'+process.env.TENANT_ID+'/oauth2/v2.0/token', { method: 'POST', body: params })
    res=await res.json()
    uid=jwt.decode(res.id_token).sub
    console.log(uid)
    a_token=res.access_token
    r_token=res.refresh_token
    expiry= Date.now()/1000+res.expires_in
    res=await data.set({table:'users','key':uid,a_token:a_token,r_token:r_token,expiry:expiry})
    console.log('==>',res)
    return a_token

}














exports.handler = async function create(req) {
  let todo = arc.http.helpers.bodyParser(req)
  if('validationToken' in req.queryStringParameters){
    return {text:req.queryStringParameters.validationToken}
  }
  if(!todo.clientState){
    return {'err':'no state specd'}
  }
  res=await data.get({'table':'users',key:todo.clientState})
  if(!res){
    return{
      'err':'no such user :('
    }
  }
  if(Date.now()/1000>=res.expiry){
    utoken= await reftoken()
  }else{
    utoken=res.a_token
  }
  if('telegramId' in res && res.telegramId!=0){
   chatid=res.telegramId
    }else{
      chatid=false
    }
  for(elem in todo.value){
    //they are all in foreach for that specific user
    res=await fetch(process.env.GRAPH_API_ENDPOINT+elem.resourceData['@odata.id'], 
    {headers:{ 'Authorization': 'Bearer '+utoken }})//'Prefer':'IdType="ImmutableId"' 
    res = await res.json()
    console.log('===>',res)
    mymsgdata=await data.set({'table':'mails',...res})//local cache
    if(chatid){
      mymsgkey=mymsgdata.key//local cache key for inline query usage

      
      text=util.format('%s<<ID<<\n<b>新邮件</b>\n<b>发件人:</b>%s\n<b>主题:</b>%s\n<b>预览:</b>\n%s',mymsgkey,
      escape(res.sender.emailAddress.name+'<'+res.sender.emailAddress.address+'>')
      ,escape(res.subject),escape(res.bodyPreview))
      keyboard=[
        [[{'text':'Web端查看(官方)','url':res.webLink}],[{'text':'仅查看正文(免登录)','url':process.env.MAIL_READLINK+mymsgkey}]],
        [[{'text':'查看信头(没什么用)','callback_data':mymsgkey+':'+'header'}]]
      ]
      if(process.env.TEST_ID){chatid=process.env.TEST_ID}
      tgbot.sendMessage(chatid,text,{parse_mode:'HTML',reply_markup:keyboard})
    }
   

  }
  return {'ok':true}
}
