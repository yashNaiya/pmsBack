var mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config({path:"././config.env"})
var url = process.env.DATABASE;

mongoose.connect(url,).then(()=> {
    console.log('connection succesful');

}).catch((e)=> console.log(e));


