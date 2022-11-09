let arc = require('@architect/functions')
let data = require('@begin/data')
const fetch = require('node-fetch')
var dayjs=require("dayjs")
var jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' })
const { URLSearchParams } = require('url');
exports.handler = async function create(req) {
  let todo = arc.http.helpers.bodyParser(req)

  const params = new URLSearchParams();
  params.append('client_id', process.env.CLIENT_ID);
  params.append('scope', 'Calendars.ReadWrite ChannelMessage.Read.All Mail.ReadWrite Mail.Send offline_access openid User.Read');
  params.append('code', todo.code);
  params.append('redirect_uri', process.env.REDIRECT_URI);
  params.append('grant_type', 'authorization_code');
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










  res2=await data.get({table:'totallists',key:'users'})
  if(!res2){
    udata=new Array()
  }
  else{udata=res2.data}
  console.log('==',udata)
  if(!udata.includes(res.key)){

  udata.push(res.key)}
  console.log(udata)
  res2=await data.set({table:'totallists',key:'users',data:udata})
  console.log(res2)


  //mail hook

//update webhooks lists
res2=await data.get({table:'totallists',key:'webhooks'})
if(!res2){
  udata=new Array()
}
else{udata=res2.data}
console.log('==',udata)
const hadsub = udata.some(function(el) {
if(!('clientState' in el)){return false}
  return el.clientState == res.key
})

if(!hadsub){

timeoffset=dayjs.unix((Date.now()/1000)+ (4230*60)).toISOString()
console.log(timeoffset)
body=
{
    "changeType": "created",
    "notificationUrl": process.env.MSHOOK_URI,
    "resource": "/me/messages",
    "expirationDateTime": timeoffset,
    "clientState": res.key
}
res=await fetch(process.env.GRAPH_API_ENDPOINT+'v1.0/subscriptions', 
{
    method: 'post',
    body:    JSON.stringify(body),
    headers:{ 'Authorization': 'Bearer '+a_token , 'Content-Type': 'application/json'}})//'Prefer':'IdType="ImmutableId"' 
res = await res.json()
console.log('==SC=>',res)
if('error' in res){return res;}
udata.push(res)}
console.log(udata)
res2=await data.set({table:'totallists',key:'webhooks',data:udata})
console.log(res2)




    return {ok:true,'key':res.key}
   
  }
