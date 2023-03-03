var mongoose = require('mongoose');
const express = require('express')
const User = require("../Models/Users")
const Team = require("../Models/Teams")
const bcrypt = require("bcryptjs")
const router = express.Router()
const Authenticate = require("../Middleware/Authenticate")
const multer = require('multer')
const nodemailer = require("nodemailer");

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

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'pmsdummy16',
        pass: 'ztkgnmcwiaxsukml'
    }
})

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
router.get("/demo", (req, res) => {
    res.send("hii this is res")
})
router.post("/register", (req, res) => {
    console.log(req.body)

    const { name, email, password, number, role, location } = req.body

    User.findOne({ email: email }, (err, user) => {
        if (user) {
            res.send({ message: "User Already Registered" })
        } else {
            const user = new User({
                image: "",
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

router.post("/updateprofile", upload.single('image'), async (req, res) => {
    try {
        const _id = req.body._id
        const name = req.body.name.toString()
        const number = req.body.number.toString()
        const email = req.body.email.toString()
        const role = req.body.role.toString()
        const location = req.body.location.toString()

        const Updateprofile = await User.findByIdAndUpdate({ _id: _id }, { $set: { image: req.file.filename, name: name, number: number, location: location, role: role, email: email } })

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

        const Updateprofile = await User.findByIdAndUpdate({ _id: _id }, { $set: { name: name, number: number, location: location, role: role, email: email } })

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

router.post('/sendinvite', (req, res) => {
    const { to } = req.body
    console.log(to)
    const mailOptions = {
        from: 'pmsdummy16',
        to: to,
        subject: "Sending Email For password Reset",
        text: `You have been invited to join project management team  http://localhost:3000/register `
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("error", error);
            res.status(401).json({ status: 401, message: "email not send" })
        } else {
            console.log("Email sent", info.response);
            res.status(201).json({ status: 201, message: "Email sent Succsfully" })
        }
    })
})

router.post('/users', async (req, res) => {
    try {
        const usersData = await User.find({ _id: { $ne: req.body._id } }, { _id: true, name: true, number: true, role: true, email: true });
        // usersData = usersData.pretty();
        res.send(usersData);
        // console.log(usersData)

    } catch (e) {
        res.send(e)
    }
})

router.post('/createteam', async (req, res) => {
    const admin = {
        _id: mongoose.Types.ObjectId(req.body.rootUser._id),
        name: req.body.rootUser.name,
        number: req.body.rootUser.number,
        role: req.body.rootUser.role
    }
    const array = req.body.personName
    let members = [admin]
    try {
        for (obj of array) {
            const temp = await User.findOne({ name: obj }, { name: true, _id: true, number: true, role: true })
            if (temp) {
                console.log(temp)
                members.push(temp)
                //adding team name to user object

                const addedTeam = await User.findOneAndUpdate({ _id: temp._id }, { $push: { teams: req.body.teamName } })
            }
        }
        const addedTeam = await User.findOneAndUpdate({ _id: admin._id }, { $push: { teams: req.body.teamName } })

        console.log(members)
        const team = new Team({
            name: req.body.teamName,
            admin: admin,
            members: members
        })
        team.save(async (err) => {
            if (err) {
                console.log(err)
                res.send(err)
            }
            else {
                res.status(200).send({ message: "Successfull Team Registration" })
            }
        })
    } catch (e) {
        console.log(e.message)
    }
})

//not approved teams

router.get('/notapprovedteams', async (req, res) => {
    try {
        const data = await Team.find({ state: false })

        res.send(data)
    } catch (e) {
        res.send(e)
    }
})

//approve team

router.post('/approveteam',async(req,res)=>{
    const teamApproved = await Team.findOneAndUpdate({name:req.body.name},{state:true})

    if(teamApproved){
        res.status(200).send({message:"team is approved for this workspace"})
    }else{
        res.status(404).send()
    }
})

//delete team
router.post('/deleteteam',async(req,res)=>{
    const teamDeleted = await Team.findOneAndDelete({name:req.body.name})

    if(teamDeleted){
        res.status(200).send({message:"team is deleted for this workspace"})
    }else{
        res.status(404).send()
    }
})



//read team

router.post('/readteam', async (req, res) => {
    // console.log(req.body)

    const team = await Team.findOne({ name: req.body.name })

    res.send(team)
})
//my teams api

router.post('/myteams',async(req,res)=>{

    const array = req.body.rootUser.teams
    let teams = []
    
    for(obj of array){
        const tempteam = await Team.findOne({name:obj})
        if(tempteam){
            teams.push(tempteam)
        }
    }
    // console.log(teams)
    res.send(teams)

})
//all teams api

router.get('/allteams', async (req, res) => {
    const teams = await Team.find({ state: true })
    res.send(teams)
})

//team name change api
router.post('/renameteam',async(req,res)=>{
    const newnameset = await Team.findOneAndUpdate({name:req.body.name},{$set:{name:req.body.newname}})
    if(newnameset){
        res.send({message:"name is updated"})
    }
})

//remove from team

router.post('/reomvefromteam',async(req,res)=>{
    console.log(req.body.user[0])
    console.log(req.body.team._id)
    const findTeam = await Team.updateOne({_id:req.body.team._id},{$pull:{members:{name:req.body.user[0]}}})
    if(findTeam){
        const removedfromuser = await User.updateOne({name:req.body.user[0]},{$pull:{teams:req.body.team.name}})
        res.send({message:"user is removed from the team"})
    }
})


//add to team


router.post('/addusers',async(req,res)=>{
    const data = req.body.users
    const team = req.body.team
    // console.log(team)
    for(val of data){
        // console.log(val)
        const update =await Team.updateOne({_id:team._id},{$push:{members:{_id:val._id,name:val.name,number:val.number,role:val.role}}})
        if(update){
            const userupdate = await User.updateOne({_id:val._id},{$push:{teams:team.name}})
        }
    }
    res.send({message:"team members are updated"})
})
module.exports = router
