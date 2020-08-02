const express = require('express');
const conn = require('../Config/connect');
const app = express();

app.use(express.json());
var users = [];
conn.query("select * from users")
    .then(results => {
        users = results.rows;
    })
    .catch(e => console.log(e))
app.post('/api/v1/user/login', (req, res) => {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    }
    const check = users.find(usern => usern.name === req.body.name);
    if (check) {
        const check_email = users.find(usere => usere.email === req.body.email);
        if (check_email) {
            console.log("Login successfull")
        }
        else {
            console.log("Login failed")
        }
    }
    else {
        console.log("Login failed")
    }
})

const port = process.env.port || 3002;
app.listen(port, () => {
    console.log(`listening port ${port} `)
})