const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const path = require('path')
require("./Connection/connection")
const dotenv = require('dotenv')
const PORT = process.env.PORT || 9002
dotenv.config({ path: "././config.env" })
app.use(cookieParser())
app.use(express.json())