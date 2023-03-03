const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const Infouser = new mongoose.Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        required: true,

    },
    number: {
        type: String,
        required: true,
        minlength: [10, "Enter Valid Number"],
        maxlength: [10, "Enter Valid Number"],
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be Greater than 8 characters"]
    },
    confirmpassword: {
        type: String,
        require: true
    },
    teams: [
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ]
})

//generating tokens

Infouser.methods.generateAuthToken = async function () {
    try {
        let tokenLocal = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: tokenLocal });
        await this.save();
        return tokenLocal;

    } catch (err) {
        console.log(err)
    }
}

Infouser.pre('save', async function (next) {

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
})

const Users = mongoose.model("Users", Infouser);

module.exports = Users;