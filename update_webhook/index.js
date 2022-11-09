let arc = require('@architect/functions')
let data = require('@begin/data')
const fetch = require('node-fetch')
let reftoken=require('../reftok.js')
require('dotenv').config({ path: '../.env' })
const { URLSearchParams } = require('url');
const dayjs = require('dayjs')
exports.handler=async function redir(req){
console.log('==>Start getting webhooks:')
users=await data.get({table:'totallists',key:'webhooks'})
if (!users || !users.data){
    console.log('==>No hooks to refresh(or build...)')
    return {'ok':true}
}
for (elem of users.data){
    //[{res},...]
    
res=await data.get({'table':'users',key:todo.clientState})
if(!res){
  return{
    'err':'no such user :('
  }
}  
if(dayjs(elem.expirationDateTime).unix()>((Date.now()/1000)+(60*60*12))){
    continue
}
if(Date.now()/1000>=res.expiry){
    utoken= await reftoken.refresh_token()
  }else{
    utoken=res.a_token
  }
  timeoffset=dayjs.unix((Date.now()/1000)+ (4230*60)).toISOString()
  body=
  {
    
      "expirationDateTime": timeoffset,
    
  }
  res=await fetch(process.env.GRAPH_API_ENDPOINT+'v1.0/subscriptions/'+elem.id, 
  {
      method: 'patch',
      body:    JSON.stringify(body),
      headers:{ 'Authorization': 'Bearer '+utoken , 'Content-Type': 'application/json'}})//'Prefer':'IdType="ImmutableId"' 
  res = await res.json()
  console.log('===>',res)
    


}


}