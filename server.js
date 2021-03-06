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
    const { name, email, password, age, gender, practice, field, license, is_doc, about_me, years } = req.body;
    const salt = bcrypt.genSaltSync(5);
    const hash = bcrypt.hashSync(password, salt);

    console.log(req.body);

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
        about_me,
        years,
        joined: new Date()
    })
    .then(res.json("success"))
    
})

// login by email and password
app.post("/signin", (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    return knex.select("email", "password").from("users")
    .where("email", "=", email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0]["password"]);

        if (isValid) {
            return knex.select("user_id", "joined", "name", "email", "age", "gender", "is_doc", "practice", "field", "license", "about_me")
            .from("users")
            .then(data => res.send(data[0]))

        } else {
            return res.status(404).json("Wrong Credential")
        }
    })
    .catch(err => res.status(400).json("Wrong Credential"))
})

app.get("/users/:id", (req, res) => {
    console.log(req.params);
    const { id } = req.params;

    return knex.select("user_id", "joined", "name", "email", "age", "gender", "is_doc", "practice", "field", "license", "about_me")
               .from("users")
               .where("user_id", "=", id)
               .then(data => {
                   if (!data[0]) {
                       return res.send("no such user")
                   } else {
                        return res.send(data[0])
                   }
               })
               .catch(err => console.log(err))
})

app.post("/post/addPost", (req, res) => {
    console.log(req.body);
    const { post, user_id } = req.body;

    return knex("posts").insert({
        user_id,
        post,
        date: new Date()
    })
    .then(res.json("success"))
})

app.get("/post/getAllPosts", (req, res) => {
    
    return knex("posts").join('users', "users.user_id", "=", "posts.user_id")
           .select("posts.post_id", "posts.post", "posts.date", "posts.user_id", "users.name")
           .then(data => res.send(data))
    // return knex.select("*").from("posts").limit(10)
    //        .then(data => res.send(data)) 
})

app.get("/post/getUserPosts/:id", (req, res) => {
    const { id } = req.params;

    return knex.select("*").from("posts").where("user_id", "=", id).orderBy("date", "desc")
           .then(data => res.send(data))
        
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

app.get("/reply", (req, res) => {
    const { user_id, post_id } = req.body;

    knex.select("reply").from("replies").where("user_id", "=", user_id, "and", "post_id", "=", post_id)
    .then(data => {
        console.log(data);
        return data
    })
    .then(data => res.send(data))
})

app.listen(port, () => {
    console.log(`api is listening on port ${port}`)
})