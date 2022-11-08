let arc = require('@architect/functions')
let data = require('@begin/data')
const fetch = require('node-fetch')
require('dotenv').config({ path: '../.env' })
const { URLSearchParams } = require('url');
exports.handler=async function redir(req){
console.log('==>Start getting channels:')
users=await data.get({table:'totallists',key:'mail-users'})
if (!users || !users.data){
    console.log('==>No users to refresh')
    return {'ok':true}
}
for(var i=0;i<users.data.length;i++){
    elem=users.data[i]
    
}

}