const express = require('express')
const app = express()
const  bcrypt = require('bcrypt')

const users = []

app.set('view-engine','ejs')
app.get('/', (req, res) => {
    res.render('index.ejs', {name:'Kyle'})
})

app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.listen(3000)
