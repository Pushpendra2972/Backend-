require('dotenv').config()
// console.log(process.env)

const express = require('express')
// import express from "express"
const app = express()

// const port = 3000 

console.log("Updated code loaded");

app.get('/', (req, res)=> {
    res.send('hello world')
})

app.get('/twitter', (req, res)=> {
    res.send('pkverma2972@gmail.com')
})

app.get('/login', (req, res)=> {
    res.send('<h1>please login with username</h1>')
})

app.listen(process.env.PORT, ()=> {
    console.log(`example app listening on port ${PORT}`);

})

