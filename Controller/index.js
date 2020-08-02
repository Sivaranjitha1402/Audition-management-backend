const express = require('express');
const fileUpload = require('express-fileupload');
const conn = require('../Config/connect');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.get('/api/user', async (req, res) => {
    if ((req.query.email) || (req.query.role)) {
        var em = String(req.query.email).slice(1, -1)
        await conn.query(`select * from users where role_id=(select id from role where role_name = '${req.query.role}') OR email in (${em})`)
            .then(results => {
                res.json({
                    results,
                    status: 1
                })
            })
            .catch(e => res.json({
                message: "error",
                status: 0
            }))
    }
    else {
        await conn.query("select * from usersdata")
            .then(results => {
                users = results.rows;
                res.json({
                    users,
                    status: 1
                })
            })
            .catch(e => console.log(e))
    }
})
// app.get('/delete',(req,res)=>{
//     conn.query("truncate table users");
//     res.send("Cleared");
// })
app.post('/api/user/login', async (req, res) => {
    const q = `select * from "usersdata" where email='${req.body.email}'`;
    await conn.query(q)
        .then(async (results) => {
            console.log(results);
            const { rows } = results;
            const [user] = rows;
            const password = user.password;
            const valid = await bcrypt.compare(req.body.password, password);
            if (valid) {
                console.log("Login Successfull")
                const login = {
                    email: req.body.email,
                    id: user.id,
                    name:user.name,
                    phone:user.phone,
                    role:user.role,
                }
                jwt.sign({ login }, 'secretkey', (err, token) => {
                    res.json({
                        token,
                        status: 1
                    });
                });
            }
            else {
                console.log("Login  Failed");
                res.json({
                    message: "failed",
                    status: 0
                });
            }
        })
        .catch(e => {
            console.log("Login  Failed", e);
            res.json({
                message: "failed",
                status: 0
            });
        });
})
app.post('/api/user/register', async (req, res) => {
    var users = [];
    await conn.query("select * from usersdata")
        .then(results => {
            console.log(results.rows);
            users = results.rows;
        })
        .catch(e => console.log(e))
    const checkEmail = users.find(user_email => user_email.email === req.body.email);
    const checkPhone = users.find(user_phone => user_phone.email === req.body.phone);
    if (!checkEmail && !checkPhone) {
        if (!(req.body.password.length <= 5)) {
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                pass = hash;
                var ins = `insert into "usersdata"(name, password, email, phone, role) values ('${req.body.name}','${pass}','${req.body.email}','${req.body.phone}','${req.body.role}')`;
                conn.query(ins)
                    .then(() => {
                        console.log("inserted successfully");
                        res.json({
                            message: "inserted successfully",
                            status: 1
                        });
                    })
                    .catch(e => console.log(e))
            });
        }
        else {
            console.log("Another email")
            res.json({
                message: "Another mail",
                status: 0
            })
        }
    }
    else {
        if (checkPhone) {
            console.log("Try another Phone number, provided is already used");
            res.json({
                message: "Try another  Phone number, provided  is already used",
                status: 0
            });
        }
        if (checkEmail) {
            console.log("Try another emailid, email id is already used");
            res.json({
                message: "Try another emailid, email id is already used",
                status: 0
            });
        }

    }
})


app.post('/api/user/home', (req, res) => {
    jwt.verify(req.body.token, 'secretkey', (err, authData) => {
        if (err) {
            res.json({
                message: "First login",
                status: 0
            })
        }
        else {
            res.json({
                authData:authData.login,
                message: "Login Successfull",
                status: 1
            });
        }
    })
})


app.post('/api/user/getdata', (req, res) => {
    jwt.verify(req.body.token, 'secretkey', async (err, authData) => {
        if (err) {
            res.json({
                message: "First login",
                status: 0
            })
        }
        else {
            await conn.query(`select * from user where id=${authData.login.id} `)
                .then(data => {
                    res.json({
                        data,
                        message: "Updated Successfully",
                        status: 1
                    });
                })
        }
    })

})
// Upload Endpoint
app.post('/api/user/upload', (req, res) => {
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
  
    const file = req.files.file;
    const fileName = file.name.replace(/ /g, "_");
    file.mv(`/home/sivaranjitha/sivaranjitha/Audition/frontend/public/uploads/${fileName}`, err => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
  
      res.json({ fileName: file.name, filePath: `/uploads/${fileName}` });
    });
  });
app.post('/api/user/edit', (req, res) => {
    jwt.verify(req.body.token, 'secretkey', async (err, authData) => {
        if (err) {
            res.json({
                message: "First login",
                status: 0
            })
        }
        else {
            bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
                const pass = hash;
                const login = req.body;
                await conn.query(`update user set name='${req.body.name}',password='${pass}' where id='${authData.login.id}'`)
                    .then(() => {
                        console.log("updated successfully");
                        res.json(
                            {
                                Message: "updated successfully",
                                login,
                                status: 1

                            });
                    })
                    .catch(e => console.log(e));
            });
        }
    })
})
const port = process.env.port || 3002
app.listen(port, () => {
    console.log(`listening port ${port} `)
})