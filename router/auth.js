var mongoose = require('mongoose');
const express = require('express')
const User = require("../Models/Users")
const Team = require("../Models/Teams")
const Workspace = require("../Models/Workspaces")
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
const { EOF } = require('dns');

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
router.post("/register", async (req, res) => {
    // console.log(req.body)
    const { name, email, password, number, role, location } = req.body

    const users = await User.find()
    console.log(users)
    if (!users.length) {
        const type = 0

        User.findOne({ email: email }, (err, user) => {
            if (user) {
                res.send({ message: "User Already Registered" })
            } else {
                const user = new User({
                    image: "",
                    name: name[0],
                    number: number[0],
                    email: email[0],
                    type: type,
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
    } else {
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
    }



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
// get user profile

router.post('/readuser',async(req,res)=>{
    console.log(req.body)
    const user = await User.findOne({_id:req.body._id})
    console.log(user)
    res.send(user)
})
router.post('/createteam', async (req, res) => {

    const teamExists = await Team.find({name:req.body.teamName})
    if(teamExists){
        res.send({message:"Team of same name already exists"})
    }
    else{
        
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
          
            const isAdmin = req.body.rootUser.type
            let team = {}
            if (isAdmin === 0) {
                team = new Team({
                    name: req.body.teamName,
                    admin: admin,
                    state: true,
                    members: members
                })
            } else {
                team = new Team({
                    name: req.body.teamName,
                    admin: admin,
                    members: members
                })
            }
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

router.post('/approveteam', async (req, res) => {
    const teamApproved = await Team.findOneAndUpdate({ name: req.body.name }, { state: true })

    if (teamApproved) {
        res.status(200).send({ message: "team is approved for this workspace" })
    } else {
        res.status(404).send()
    }
})

//delete team
router.post('/deleteteam', async (req, res) => {

    if (req.body.team.admin._id === req.body.rootUser._id) {
        const action = {
            name: req.body.team,
            action: 'delete',
            by: req.body.rootUser,
            metadata: `Team Deletion`
        }
        const teamDeleted = await Team.findOneAndUpdate({ name: req.body.team.name }, { $push: { action: action } })

        if (teamDeleted) {
            res.status(200).send({ message: "team is deleted for this workspace" })
        } else {
            res.status(404).send()
        }
    } else {
        res.send({ message: "you are not authorized to change the team name" })
    }
})



//read team

router.post('/readteam', async (req, res) => {
    // console.log(req.body)

    const team = await Team.findOne({ name: req.body.name })

    res.send(team)
})
//my teams api

router.post('/myteams', async (req, res) => {

    const array = req.body.rootUser.teams
    let teams = []
    // console.log(array)
    for (obj of array) {
        const tempteam = await Team.findOne({ name: obj })
        if (tempteam) {
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

router.get('/actionnotapproved', async (req, res) => {
    const teams = await Team.find({ 'action.0': { $exists: true } })
    let array = []
    for (val of teams) {
        // console.log(val.action)
        // array.push(val.action[0])
        for (act of val.action) {
            array.push(act)
        }
    }
    // console.log(array)
    res.send(array)
})
router.post('/renameteam', async (req, res) => {

    if (req.body.team.admin._id === req.body.rootUser._id) {

        const action = {
            name: req.body.team,
            action: 'rename',
            by: req.body.rootUser,
            metadata: `${req.body.team.name} to ${req.body.newname}`
        }

        const newnameset = await Team.findOneAndUpdate({ name: req.body.team.name }, { $push: { action: action } })
        if (newnameset) {
            res.send({ message: "name is updated" })
        }
    } else {
        res.send({ message: "you are not authorized to change the team name" })

    }
})

//remove from team

router.post('/reomvefromteam', async (req, res) => {
    // console.log(req.body.user[0])
    // console.log(req.body.team)
    // console.log(req.body.rootUser.name)
    if (req.body.team.admin._id === req.body.rootUser._id) {
        if(req.body.rootUser.name === req.body.user[0] ){
            res.send({message:"Admin can not be removed from the team"})
        }else{
            const action = {
                name: req.body.team,
                action: 'remove from team',
                by: req.body.rootUser,
                metadata: `${req.body.user[0]}`
            }
            const remove = await Team.findOneAndUpdate({ name: req.body.team.name }, { $push: { action: action } })
        }
    }
    else {
        res.send({ message: "you are not authorized to change the team name" })
    }

})


//add to team

router.post('/addusers', async (req, res) => {
    const name = []
    const data = req.body.users
    for (val of data) {
        name.push(' ' + val.name)
    }
    let flag = 0
    const team = req.body.team
    for(val of name){
        for(member of team.members){
            if(val.trim()===member.name){
                flag=1
            }
        }
    }
    if(flag){
        res.send({message:"user already exists in a team"})
    }else{

        if (req.body.team.admin._id === req.body.rootUser._id) {
            const action = {
                name: req.body.team,
                action: 'add user',
                by: req.body.rootUser,
                metadata: name
            }
            
            const remove = await Team.findOneAndUpdate({ name: req.body.team.name }, { $push: { action: action } })
        } 
        else {
            res.send({ message: "you are not authorized to change the team name" })
        }
        console.log(data)
        for(val of data){
            // console.log(val)
            const update =await Team.updateOne({_id:team._id},{$push:{members:{_id:val._id,name:val.name,number:val.number,role:val.role}}})
            if(update){
                const userupdate = await User.updateOne({_id:val._id},{$push:{teams:team.name}})
            }
        }
        res.send({message:"team members are updated"})
    }
})

router.post('/rejectaction',async(req,res)=>{
    const {data} = req.body
    const update = await Team.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
    res.send({message:"Request rejected"})
})

router.post('/approveaction', async (req, res) => {
    const { data } = req.body
    if (data[1] === 'add user') {
  
        for(val of data[3]){
            const user = await User.findOne({name:val.trim()})
            if(user){
                console.log(user)
                const update = await Team.updateOne({_id:data[0]._id},{$push:{members:{_id:user._id,name:user.name,number:user.number,role:user.role}}})
                if(update){
                    console.log(update)
                    const userupdate = await User.updateOne({_id:user._id},{$push:{teams:data[0].name}})
                }
            }
        }
        const update = await Team.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
        res.send("Team members are updated")
    } else if (data[1] === 'remove from team') {
        // console.log('2')
        const findTeam = await Team.updateOne({ _id:data[0]._id }, { $pull: { members: { name: data[3] } } })
        const removedfromuser = await User.updateOne({ name: data[3] }, { $pull: { teams: data[0] } })

        if(findTeam && removedfromuser){
            const update = await Team.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
            res.send("User removed from the team")
        }else{
            res.send()
        }


    } else if (data[1] === 'rename') {
        console.log('3')
        console.log(data[3].split('to ').pop())
        const renameTeam = await Team.updateOne({ _id: data[0]._id }, { $set: { name: data[3].split('to ').pop() } })

        if (renameTeam) {
            const update = await Team.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
            res.send("New team name is set")
        } else {
            res.send()
        }

    } else if (data[1] === 'delete') {
        // console.log('4')
        const deleteTeam = await Team.deleteOne({ _id: data[0]._id })
        if (deleteTeam) {
            res.send("Team deleted")
        } else {
            res.send('error happened')
        }
    }
})

//add workspace

router.post('/createworkspace',async(req,res)=>{
    console.log(req.body.name)
    const isWorkspace =await Workspace.find({name:req.body.name})
    console.log(isWorkspace)
    if(!(isWorkspace.length===0)){
        res.send({message:"workspace of same name already exists"})
    }else{
        const workspace = new Workspace({
            name:req.body.name
        })
        workspace.save(async(err)=>{
            if(err){
                res.send(err)
            }else{
                res.send({message:"new workspace added"})
            }
        })
    }
})


//read workspaces

router.get('/readworkspaces',async(req,res)=>{
    const workspaces = await Workspace.find({},{name:1})
    // console.log(workspaces)
    res.send(workspaces)
})

router.post('/currentworkspace',async(req,res)=>{
    const data = await Workspace.findOne({_id:req.body._id})
    if(data){
        res.send(data)
    }else{
        res.send()
    }
})

//add customer to workspace

router.post('/addcustomer',async(req,res)=>{
    try{
        let exists = false
        const workspace = await Workspace.findOne({_id:req.body._id})
        const {name,location,number,website,email} = req.body.customerData
        const client = {
            name: name.toString(),
            number: number.toString(),
            email:email.toString(),
            location:location.toString(),
            website:website.toString()
        }
        for(cli of workspace.client){
            if(name===cli.name)
            exists = true
            
        }
        if(exists){
            res.send({message:"client with same name already exists"})
        }else{
            const updated = await Workspace.findByIdAndUpdate({_id:req.body._id},{$push:{client:client}})
            if(updated){
                console.log('updated')
                res.send({message:"client is added to this wokspace"})
            }
        }
    }catch(err){
        console.log(err)
        res.send(err)
    }
})

//add project without client

router.post('/addproject',async(req,res)=>{
    try{

        let exists = false
        const workspace = await Workspace.findOne({_id:req.body._id})
        const {info,manager,requirements} = req.body.projectData

        const project = {
            name:info.name,
            due:info.due,
            manager:manager,
            requirements:requirements
        }
        for(pro in workspace.projects){
            if(info.name===pro.name)
            exists=true
        }
        if(exists){
            res.send({message:"project with same name already exists"})
        }else{
            const updated = await Workspace.findByIdAndUpdate({_id:req.body._id},{$push:{projects:project}})
            if(updated){
                res.send({message:"project is added to this wokspace"})
            }
        }
    }catch(err){
        console.log(err)
        res.send(err)
    }

})

router.post('/readclients',async(req,res)=>{
    const workspaceClients = await Workspace.findOne({_id:req.body._id},{client:1}) 

    console.log(workspaceClients)
    res.send(workspaceClients)
})

router.post('/readprojects',async(req,res)=>{
    const workspaceProjects = await Workspace.findOne({_id:req.body._id},{projects:1}) 

    console.log(workspaceProjects)
    res.send(workspaceProjects)
})

//add group

router.post('/addgroup',async(req,res)=>{
    const {name,wsID,projectID} = req.body
    console.log(req.body.projectID)

    try{
        const workspaceProjects = await Workspace.findOneAndUpdate({_id:wsID,'projects._id':projectID},{$push:{"projects.$.groups":{name}}}) 
    }catch(err){

    }
})

module.exports = router


