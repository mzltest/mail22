let data = require('@begin/data')
const fetch = require('node-fetch')
require('dotenv').config({ path: '../.env' })
exports.handler=async function redir(req){

        url='https://login.microsoftonline.com/'+process.env.TENANT_ID+'/oauth2/v2.0/authorize?client_id='+process.env.CLIENT_ID+
        '&response_type=code&redirect_uri='+encodeURIComponent(process.env.REDIRECT_URI)+'&response_mode=form_post&scope='+encodeURIComponent('Calendars.ReadWrite ChannelMessage.Read.All Mail.ReadWrite Mail.Send offline_access openid User.Read')


    return{
        statusCode:302,
        headers:{'Location':url}
    }
}