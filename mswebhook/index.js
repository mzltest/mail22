let arc = require('@architect/functions')
let data = require('@begin/data')
const fetch = require('node-fetch')
var jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' })
let reftoken=require('./reftok.js')
const { URLSearchParams } = require('url');
const TelegramBot = require('node-telegram-bot-api');
var escape = require('escape-html');
const util = require('util');
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TG_TOKEN
const tgbot=new TelegramBot(token)
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
    utoken= await reftoken.refresh_token()
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
