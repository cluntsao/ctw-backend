const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");

// const knex = require('knex')({
//     client: 'pg',
//     connection: {
//       host : '127.0.0.1',
//       user : 'postgres',
//       password : '8815',
//       database : 'postgres'
//     }
//   });

const knex = require('knex')({
    client : 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    }
})

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>")
})

app.post("/register", (req, res) => {
    const { name, email, password, age, gender, practice, field, license, is_doc } = req.body;
    const salt = bcrypt.genSaltSync(5);
    const hash = bcrypt.hashSync(password, salt);

    return knex('users').insert({
        name,
        password: hash,
        email,
        gender,
        age,
        is_doc,
        practice,
        field,
        license,
        joined: new Date()
    })
    .then(res.json("success"))
    
})

// login by email and password
app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    return knex.select("email", "password").from("users")
    .where("email", "=", email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0]["password"]);

        if (isValid) {
            return knex.select("user_id").from("users").then(data => res.send(data[0]))
        } else {
            return res.status(404).json("Wrong Credential")
        }
    })
    .catch(err => res.status(400).json("Wrong Credential"))
})

app.post("/post", (req, res) => {
    const { post, user_id } = req.body;

    knex("posts").insert({
        user_id,
        post,
        date: new Date()
    })
    .then(res.json("success"))
})

app.post("/reply", (req, res) => {
    const { reply, user_id, post_id } = req.body;

    knex("replies").insert({
        user_id,
        post_id,
        reply,
        date: new Date()
    })
    .then(res.json("success"))
})

app.listen(port, () => {
    console.log(`api is listening on port ${port}`)
})