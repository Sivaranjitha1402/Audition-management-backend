const Client = require('pg').Client;
const client=new Client({
    user:"postgres",
    password:"!@#$%^",
    host:"localhost",
    port:5432,
    database:"audition"
})

client.connect()
.then(()=>console.log("Connected Successfully"))
.catch(e=>console.log(e))
module.exports=client;