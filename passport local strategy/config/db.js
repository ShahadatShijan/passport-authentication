const mongoose = require("mongoose");
require("dotenv").config();
const url = process.env.MONGO_URL

mongoose.connect(url)
    .then(() => {
        console.log(`database is connected`);
    })
    .catch((error)=>{
        console.log(`database is connected`);
        console.log(error.message)
    })