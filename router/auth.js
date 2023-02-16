var mongoose = require('mongoose');
const express = require('express')
const User = require("../Models/Users")
const bcrypt = require("bcryptjs")
const router = express.Router()
const Authenticate = require("../Middleware/Authenticate")
const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Uploads/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
})
var upload = multer({ storage: storage })

const path = require("path");
router.use("/images", express.static(path.join("Uploads/images")));


router.post("/login", (req, res) => {

    const { email, password } = req.body
    //  console.log(req.body)
    User.findOne({ email: email, state: true }, async (err, user) => {
        if (user) {
            const isMatch = await bcrypt.compare(password[0], user.password)
            if (isMatch) {
                token = await user.generateAuthToken();
                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now() + 864000000),
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                }).send()
            }
            else {
                //  console.log("Password Did Not Match")

                res.send({ message: "Incorrect Credienteals" })
            }
        } else {
            //    console.log("User Not Registered")
            res.send({ message: "Incorrect Credienteals" })
        }
    })
})

router.post("/register", (req, res) => {
    console.log(req.body)

    const { name, email, password, number, role, location } = req.body

    User.findOne({ email: email }, (err, user) => {
        if (user) {
            res.send({ message: "User Already Registered" })
        } else {
            const user = new User({
                image:"",
                name: name[0],
                number: number[0],
                email: email[0],
                role: role[0],
                location: location[0],
                password: password[0],
            })
            user.save(async (err) => {
                if (err) {
                    console.log(err)
                    console.log("Hello")
                    res.send(err)
                }
                else {
                    res.status(200).send({ message: "Successfully Registration" })
                    token = await user.generateAuthToken();
                    res.cookie("jwtoken", token, {
                        expires: new Date(Date.now() + 864000000),
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none'
                    }).send()
                }
            })
        }

    })
    // res.send('my register api')
})

router.get("/home", Authenticate, async (req, res) => {
    res.send({ rootUser: req.rootUser, message: "on home page" })
})

router.get("/profile", Authenticate, async (req, res) => {
    res.send({ rootUser: req.rootUser, message: "on profile page" })
})


router.post('/signout', async (req, res) => {
    try {
        res.clearCookie('jwtoken').send("logout succesfull")

    } catch (e) {
        console.log(e.message)
    }
})

router.post("/updateprofile",upload.single('image'), async (req, res) => {
    try {
        const _id = req.body._id
        const name = req.body.name.toString()
        const number = req.body.number.toString()
        const email = req.body.email.toString()
        const role = req.body.role.toString()
        const location = req.body.location.toString()

        const Updateprofile = await User.findByIdAndUpdate({ _id: _id }, { $set: { image:req.file.filename, name: name, number: number,location:location,role:role, email: email } })

        if (!Updateprofile) {
            return res.status(404).send({ message: "Profile Is not Updated" });
        }
        else {
            res.send({ message: "Profile Is Updated" });
        }
    }
    catch (e) {
        res.send({ message: "Error" })
    }
})

router.post("/updateprofile2", async (req, res) => {
    try {
        const _id = req.body._id
        const name = req.body.name.toString()
        const number = req.body.number.toString()
        const email = req.body.email.toString()
        const role = req.body.role.toString()
        const location = req.body.location.toString()

        const Updateprofile = await User.findByIdAndUpdate({ _id: _id }, { $set: { name: name, number: number,location:location,role:role, email: email } })

        if (!Updateprofile) {
            return res.status(404).send({ message: "Profile Is not Updated" });
        }
        else {
            res.send({ message: "Profile Is Updated" });
        }
    }
    catch (e) {
        res.send({ message: "Error" })
    }
})


module.exports = router
