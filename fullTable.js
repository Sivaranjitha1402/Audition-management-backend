const Client = require('pg').Client;
const client=new Client({
    user:"postgres",
    password:"!@#$%^",
    host:"localhost",
    port:5432,
    database:"postgres"
})


client.connect()
.then(()=>console.log("Connected Successfully"))
.then(()=>client.query("select * from my_table"))
.then(results=> console.table(results.rows))
.catch(e=>console.log(e))
.finally(()=>client.end())



// where name=$1",["siva"]