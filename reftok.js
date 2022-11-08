let arc = require('@architect/functions')
let data = require('@begin/data')
const fetch = require('node-fetch')
var jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/.env' }) //we are on the root dir...
const { URLSearchParams } = require('url');
async function refresh_token(refresh_token){
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

module.exports.refresh_token=refresh_token