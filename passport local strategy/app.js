const express = require("express");
const ejs = require("ejs");
const User = require("./models/user.model")
require("./config/db")
require("dotenv").config();
require("./config/passport")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

const passport = require("passport")
const session = require('express-session')
const MongoStore = require('connect-mongo');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions"
  })
//   cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.set("view engine", "ejs");

//home route
app.get("/",(req,res)=>{
    res.render("home")
})
//register get
app.get("/register",(req,res)=>{
    res.render("register")
})

//register post
app.post("/register", async (req,res)=>{
    try {
        const user = await User.findOne({username: req.body.username})
        if(user){
            return res.status(400).send("user already exists")
        }
        bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
            const newUser = new User({
                username: req.body.username,
                password: hash
            })
            await newUser.save();
            res.status(201).redirect("login")
        });
        
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

const checkLogedIn = (req,res,next) =>{
    if(req.isAuthenticated()){
        return res.redirect("/profile")
    }
    next();
}

//login get
app.get("/login",checkLogedIn, (req,res)=>{
    res.render("login")
})


//login post
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/profile' }),);
  
const checkAuthenticated = (req,res,next) =>{
    if(req.isAuthenticated()){
        return res.render("profile")
    }
    next();
}
//profile get
app.get("/profile", checkAuthenticated, (req,res)=>{
   res.redirect("/login")  
})

//logout get
app.get("/logout",(req,res)=>{
    try {
        req.logOut((err)=>{
            if(err){
                return next(err);
            }
            res.redirect("/")
        })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

module.exports = app