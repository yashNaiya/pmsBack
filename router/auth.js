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
var jwt = require('jsonwebtoken');

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
const Clients = require('../Models/Clients');
const Projects = require('../Models/Projects');
const Teams = require('../Models/Teams');
const Chats = require('../Models/Chats');
const Users = require('../Models/Users');

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

router.post("/register", async (req, res) => {
    // console.log(req.body)
    const { name, email, password, number, role, location } = req.body.inputs

    const users = await User.find()
    console.log(users)
    if (!users.length) {
        const type = 0
        const user = new User({
            image: "",
            name: name,
            number: number,
            email: email,
            type: type,
            role: role,
            location: location,
            password: password,
        })
        user.save(async (err) => {
            if (err) {
                console.log(err)
                console.log("Hello")
                res.send(err)
            }
            else {
                if (req.body._id) {
                    const tempuser = await User.findOne({ email: email }, { _id: 1 })
                    const adduser = await Workspace.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $push: { members: tempuser } })
                    const addworkspace = await User.findOneAndUpdate({ email: email }, { $push: { workspaces: mongoose.Types.ObjectId(req.body._id) } })
                }

                res.status(200).send({ message: "Successfully Registration" })
                // token = await user.generateAuthToken();
                // res.cookie("jwtoken", token, {
                //     expires: new Date(Date.now() + 864000000),
                //     httpOnly: true,
                //     secure: true,
                //     sameSite: 'none'
                // }).send()
            }
        })



    } else {
        User.findOne({ email: email }, async (err, user) => {
            if (user) {

                res.send({ message: "User Already Registered" })
            }
            else {

                User.findOne({ number: number }, (err, user) => {
                    if (user) {
                        res.send({ message: "User Already Registered" })
                    }
                    else {
                        const user = new User({
                            image: "",
                            name: name,
                            number: number,
                            email: email,
                            role: role,
                            location: location,
                            password: password,
                        })
                        user.save(async (err) => {
                            if (err) {
                                console.log(err)
                                console.log("Hello")
                                res.send(err)
                            }
                            else {
                                if (req.body._id) {
                                    const tempuser = await User.findOne({ email: email }, { _id: 1 })
                                    console.log(tempuser)
                                    const adduser = await Workspace.findOneAndUpdate({ _id: req.body._id }, { $push: { members: tempuser } })
                                    const addworkspace = await User.findOneAndUpdate({ email: email }, { $push: { workspaces: { _id: mongoose.Types.ObjectId(req.body._id) } } })
                                }

                                res.status(200).send({ message: "Successfully Registration" })
                                // token = await user.generateAuthToken();
                                // res.cookie("jwtoken", token, {
                                //     expires: new Date(Date.now() + 864000000),
                                //     httpOnly: true,
                                //     secure: true,
                                //     sameSite: 'none'
                                // }).send()
                            }
                        })
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

router.post('/sendotp', async (req, res) => {
    const mailOptions = {
        from: 'pmsdummy16',
        to: req.body.to,
        secure: true,
        subject: "Otp For Registration",
        text: `Your One Time Password for registration is ${req.body.otp}`
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
router.post('/sendinvite', async (req, res) => {

    console.log(req.body)
    const mailOptions = {
        from: 'pmsdummy16',
        to: req.body.to,
        secure: true,
        subject: "Sending Email For password Reset",
        text: `You have been invited to join project management team  http://localhost:3000/register/${req.body._id}/${req.body.to} `
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
    let usersData = []
    const Workspacemembers = await Workspace.findOne({ _id: req.body.wsId }, { members: 1 })
    console.log(Workspacemembers)
    if (Workspacemembers) {
        for (member of Workspacemembers.members) {
            const tempuser = await User.findOne({ _id: member._id })
            usersData.push(tempuser)
        }
    }

    res.send(usersData)


})


router.post('/projectmembers', async (req, res) => {
    let usersData = []
    let TeamsData = []
    const Project = await Projects.findOne({ _id: req.body._id }, { members: 1 })
    // console.log(Workspacemembers)
    if (Project) {
        for (member of Project.members) {
            const tempuser = await User.findOne({ _id: member })
            if (tempuser) {
                usersData.push(tempuser)
            } else {
                const tempteam = await Teams.findOne({ _id: member })
                TeamsData.push(tempteam)
            }
        }
    }

    res.send({ users: usersData, teams: TeamsData })


})
// get user profile

router.post('/readuser', async (req, res) => {
    // console.log(req.body)
    const user = await User.findOne({ _id: req.body._id })
    // console.log(user)
    res.send(user)
})
router.post('/createteam', async (req, res) => {
    const teamExists = await Team.findOne({ name: req.body.teamName })
    if (teamExists) {
        console.log(teamExists)
        res.send({ message: "Team of same name already exists" })
    }
    else {
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
                    // console.log(temp._id)
                    // console.log(admin._id)
                    if (temp._id.toString() === req.body.rootUser._id.toString()) {

                    } else {
                        members.push(temp)
                    }
                    //adding team name to user object

                    // const addedTeam = await User.findOneAndUpdate({ _id: temp._id }, { $push: { teams: req.body.teamName } })
                }
            }
            // const addedTeam = await User.findOneAndUpdate({ _id: admin._id }, { $push: { teams: req.body.teamName } })

            console.log(members)

            const isAdmin = req.body.rootUser._id === req.body.workspace.admin
            let team = {}
            if (isAdmin) {
                team = new Team({
                    name: req.body.teamName,
                    admin: admin,
                    workspace: mongoose.Types.ObjectId(req.body.workspace._id),
                    state: true,
                    members: members
                })
                team.save(async (err) => {
                    if (err) {
                        console.log(err)
                        res.send(err)
                    }
                    else {
                        const thisteam = await Team.findOne({ name: req.body.teamName })
                        for (member of thisteam.members) {
                            const user = await User.findOneAndUpdate({ _id: member._id }, { $push: { teams: { _id: thisteam._id } } })
                        }
                        res.status(200).send({ message: "Successfull Team Registration" })
                    }
                })
            } else {
                team = new Team({
                    name: req.body.teamName,
                    admin: admin,
                    workspace: mongoose.Types.ObjectId(req.body.workspace._id),
                    members: members
                })
                team.save(async (err) => {
                    if (err) {
                        console.log(err)
                        res.send(err)
                    }
                    else {
                        const thisteam = await Team.findOne({ name: req.body.teamName })
                        for (member of thisteam.members) {
                            const user = await User.findOneAndUpdate({ _id: member._id }, { $push: { teams: { _id: thisteam._id } } })
                        }
                        res.status(200).send({ message: "Request for new team has been sent" })
                    }
                })
            }

        } catch (e) {
            console.log(e.message)
        }
    }
})

//not approved teams

router.post('/notapprovedteams', async (req, res) => {
    console.log(req.body)
    try {
        const data = await Team.find({ workspace: mongoose.Types.ObjectId(req.body.wsId), state: false })
        console.log(`not approved Teams:${data}`)
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

router.post('/rejectteam', async (req, res) => {

    const rejectteam = await Team.findOneAndDelete({ name: req.body.name })

    res.send({ message: 'Request Has Been Rejected' })
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
            res.status(200).send({ message: "Your Request For Team Deletion Has Been Sent" })
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

router.post('/readteambyid', async (req, res) => {
    const team = await Team.findOne({ _id: mongoose.Types.ObjectId(req.body._id) })

    console.log(req.body._id)
    res.send(team)
})
//my teams api

router.post('/myteams', async (req, res) => {

    const array = req.body.rootUser.teams
    let teams = []
    // console.log(`WS:${req.body.wsId}`)
    for (obj of array) {
        const tempteam = await Team.findOne({ workspace: mongoose.Types.ObjectId(req.body.wsId), _id: obj._id, state: true })
        if (tempteam) {
            teams.push(tempteam)
        }
    }
    // console.log(teams)
    res.send(teams)

})
//all teams api

router.post('/allteams', async (req, res) => {

    const teams = await Team.find({ workspace: mongoose.Types.ObjectId(req.body.wsId), state: true })
    console.log(teams)
    res.send(teams)
})

//team name change api

router.post('/actionnotapproved', async (req, res) => {
    const teams = await Team.find({ workspace: mongoose.Types.ObjectId(req.body.wsId), 'action.0': { $exists: true } })
    let array = []
    for (val of teams) {
        // console.log(val.action)
        // array.push(val.action[0])
        for (act of val.action) {
            array.push(act)
        }
    }
    console.log(array)
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
            res.send({ message: "Request For Team Name Update Has Been Sent" })
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
        if (req.body.rootUser.name === req.body.user[0]) {
            res.send({ message: "Admin can not be removed from the team" })
        } else {
            const action = {
                name: req.body.team,
                action: 'remove from team',
                by: req.body.rootUser,
                metadata: `${req.body.user[0]}`
            }
            const remove = await Team.findOneAndUpdate({ name: req.body.team.name }, { $push: { action: action } })
            res.send({ message: "Your Request Has Been Sent" })
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
    for (val of name) {
        for (member of team.members) {
            if (val.trim() === member.name) {
                flag = 1
            }
        }
    }
    if (flag) {
        res.send({ message: "user already exists in a team" })
    } else {

        if (req.body.team.admin._id === req.body.rootUser._id) {
            // for (val of data) {
            //     // console.log(val)
            //     const update = await Team.updateOne({ _id: team._id }, { $push: { members: { _id: val._id, name: val.name, number: val.number, role: val.role } } })
            //     if (update) {
            //         const userupdate = await User.updateOne({ _id: val._id }, { $push: { teams: team.name } })
            //     }
            // }
            const action = {
                name: req.body.team,
                action: 'add user',
                by: req.body.rootUser,
                metadata: name
            }

            const remove = await Team.findOneAndUpdate({ name: req.body.team.name }, { $push: { action: action } })
            res.send({ message: "your request has been sent" })
        }
        else {
            res.send({ message: "you are not authorized to make change in the team" })
        }
        // console.log(data)

    }
})

router.post('/rejectaction', async (req, res) => {
    const { data } = req.body
    const update = await Team.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
    res.send({ message: "Request rejected" })
})

router.post('/approveaction', async (req, res) => {
    const { data } = req.body
    if (data[1] === 'add user') {

        for (val of data[3]) {
            const user = await User.findOne({ name: val.trim() })
            if (user) {
                console.log(user)
                const update = await Team.updateOne({ _id: data[0]._id }, { $push: { members: { _id: user._id, name: user.name, number: user.number, role: user.role } } })
                if (update) {
                    console.log(update)
                    const userupdate = await User.updateOne({ _id: user._id }, { $push: { teams: data[0].name } })
                }
            }
        }
        const update = await Team.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
        res.send("Team members are updated")
    } else if (data[1] === 'remove from team') {
        // console.log('2')
        const findTeam = await Team.updateOne({ _id: data[0]._id }, { $pull: { members: { name: data[3] } } })
        const removedfromuser = await User.updateOne({ name: data[3] }, { $pull: { teams: data[0] } })

        if (findTeam && removedfromuser) {
            const update = await Team.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
            res.send("User removed from the team")
        } else {
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

router.post('/createworkspace', async (req, res) => {
    console.log(req.body.name)
    const isWorkspace = await Workspace.find({ name: req.body.name })
    console.log(isWorkspace)
    if (!(isWorkspace.length === 0)) {
        res.send({ message: "workspace of same name already exists" })
    } else {
        const workspace = new Workspace({
            name: req.body.name,
            admin: req.body.admin._id,
            members: [{ _id: mongoose.Types.ObjectId(req.body.admin._id) }]
        })
        workspace.save(async (err) => {
            if (err) {
                res.send(err)
            } else {
                const tempws = await Workspace.findOne({ name: req.body.name })
                const addworkspace = await User.findOneAndUpdate({ _id: req.body.admin._id }, { $push: { workspaces: { _id: tempws._id } } })
                res.send({ message: "New Workspace Added" })
            }
        })
    }
})


//read workspaces

router.get('/readworkspaces', async (req, res) => {
    const workspaces = await Workspace.find()
    // console.log(workspaces)
    res.send(workspaces)
})

router.post('/currentworkspace', async (req, res) => {
    const data = await Workspace.findOne({ _id: req.body._id })
    if (data) {
        res.send(data)
    } else {
        res.send()
    }
})

//add customer to workspace

router.post('/addcustomer', async (req, res) => {
    try {

        const { name, location, number, website, email } = req.body.customerData
        console.log(req.body.contactList)

        const exists = await Clients.find({ name: name })

        if (!(exists.length === 0)) {
            res.send({ message: "client with same name already exists" })
        } else {
            const client = new Clients({
                workspaceId: req.body._id,
                name: name.toString(),
                number: number.toString(),
                email: email.toString(),
                location: location.toString(),
                website: website.toString(),

            })
            client.save(async (err) => {
                if (err) {
                    res.send(err)
                } else {
                    const cl = await Clients.findOne({ name: name }, { _id: 1 })
                    const addContacts = await Clients.findOneAndUpdate({ name: name }, { $push: { contacts: req.body.contactList } })
                    // console.log(cl)
                    const workspace = await Workspace.findOneAndUpdate({ _id: req.body._id }, { $push: { 'clients': { _id: cl._id } } })
                    res.send({ message: "new client added" })
                }
            })

        }
    } catch (err) {
        console.log(err)
        res.send(err)
    }
})

//add project without client

router.post('/addproject', async (req, res) => {
    try {

        // const workspace = await Workspace.findOne({ _id: req.body._id })
        const { info, manager, requirements } = req.body.projectData

        const exists = await Projects.find({ name: info.name })
        if (!(exists.length === 0)) {
            res.send({ message: "project with same name already exists" })
        } else {
            const project = new Projects({
                workspaceId: req.body._id,
                name: info.name,
                due: info.due,
                manager: manager,
                requirements: requirements,
                members: [{ _id: mongoose.Types.ObjectId(manager._id) }]
            })
            project.save(async (err) => {
                if (err) {
                    res.send(err)
                } else {
                    const pr = await Projects.findOne({ name: info.name })
                    // console.log(pr)
                    const userupdate = await User.updateOne({ _id: mongoose.Types.ObjectId(manager._id) }, { $push: { projects: { name: pr.name, _id: pr._id } } })
                    const workspace = await Workspace.findOneAndUpdate({ _id: req.body._id }, { $push: { 'projects': { _id: pr._id } } })
                    res.send({ message: "new project added" })
                }
            })

        }
    } catch (err) {
        console.log(err)
        res.send(err)
    }

})

router.post('/readclients', async (req, res) => {
    const workspaceClients = await Clients.find({ workspaceId: req.body._id })

    // console.log(workspaceClients)
    res.send(workspaceClients)
})

router.post('/readprojects', async (req, res) => {
    const workspaceProjects = await Projects.find({ workspaceId: req.body._id })

    // console.log(workspaceProjects)
    res.send(workspaceProjects)
})

router.post('/readproject', async (req, res) => {
    const project = await Projects.findOne({ _id: req.body._id })
    res.send(project)
})

//add group

router.post('/addgroup', async (req, res) => {
    const { name, projectID } = req.body
    console.log(req.body.projectID)

    try {
        const addgroup = await Projects.findOneAndUpdate({ _id: projectID }, { $push: { "groups": { name: name } } })
        res.send({ message: "new group added" })
    } catch (err) {
        res.send(err)
    }
})


// add task

router.post('/addtask', async (req, res) => {
    console.log(req.body)
    const { name, requirement, status, due, ownerType, owner, manager } = req.body

    if (ownerType === 'team') {
        let membersTemp = [{ _id: mongoose.Types.ObjectId(manager._id) }]
        for (member of owner.members) {
            // console.log(member)
            if (member._id.toString() === manager._id.toString()) {

            } else {

                membersTemp.push({ _id: mongoose.Types.ObjectId(member._id) })
            }
        }
        const chat = new Chats({
            members: membersTemp
        })
        chat.save(async (err) => {
            if (err) {
                res.send(err)
            } else {
                // console.log(chat)
                const addtask = await Projects.findOneAndUpdate({ _id: req.body.projectId, 'groups._id': req.body.groupId },
                    {
                        $push: {
                            "groups.$.tasks": {
                                name: name,
                                status: status,
                                due: due,
                                chatId: chat._id,
                                ownerType: ownerType,
                                owner: owner,
                                linkedTo: requirement
                            }
                        }
                    })
                res.send()
            }
        })
    }
    else {
        let chat = {}
        if (manager._id.toString() === owner._id.toString()) {
            chat = new Chats({
                members: [{ _id: mongoose.Types.ObjectId(manager._id) }]
            })

        } else {

            chat = new Chats({
                members: [{ _id: mongoose.Types.ObjectId(manager._id) }, { _id: mongoose.Types.ObjectId(owner._id) }]
            })
        }
        chat.save(async (err) => {
            if (err) {
                res.send(err)
            } else {
                // console.log(chat)
                const addtask = await Projects.findOneAndUpdate({ _id: req.body.projectId, 'groups._id': req.body.groupId },
                    {
                        $push: {
                            "groups.$.tasks": {
                                name: name,
                                status: status,
                                due: due,
                                chatId: chat._id,
                                ownerType: ownerType,
                                owner: owner,
                                linkedTo: requirement
                            }
                        }
                    })
                res.send()
            }
        })
    }



})

router.post('/isregistered', async (req, res) => {
    // console.log(req.body)
    let registered = false
    const { wsId, userMail } = req.body

    const isRegistered = await User.findOne({ email: userMail })

    if (isRegistered) {
        registered = true
        // const tempuser = await User.findOne({ email: email }, { _id: 1 })
        const adduser = await Workspace.findOneAndUpdate({ _id: mongoose.Types.ObjectId(wsId) }, { $push: { members: isRegistered._id } })
        const addworkspace = await User.findOneAndUpdate({ _id: isRegistered._id }, { $push: { workspaces: { _id: mongoose.Types.ObjectId(wsId) } } })

    } else {

    }
    res.send({ registered: registered })
})


router.post('/updateclientdetail', async (req, res) => {
    const { name, location, email, number, website } = req.body

    const update = await Clients.findOneAndUpdate({ _id: req.body._id }, { $set: { name: name, location: location, email: email, website: website, number: number, contacts: contacts } })

    res.send({ message: "Client Details Are Updated" })
})

router.post('/readclient', async (req, res) => {
    const client = await Clients.findOne({ _id: req.body._id })

    res.send(client)
})


router.post('/updatecontactsofclient', async (req, res) => {

    const update = await Clients.findOneAndUpdate({ _id: req.body._id }, { $set: { contacts: req.body.contacts } })

    res.send({ message: "Contacts Are Updated" })
})

router.post('/deletecontact', async (req, res) => {
    const update = await Clients.findOneAndUpdate({ _id: req.body._id }, {})
})

router.post('/addprojectforclient', async (req, res) => {
    try {

        // const workspace = await Workspace.findOne({ _id: req.body._id })
        const { info, manager, requirements } = req.body.projectData

        const exists = await Projects.find({ name: info.name })
        if (!(exists.length === 0)) {
            res.send({ message: "project with same name already exists" })
        } else {
            const project = new Projects({
                workspaceId: req.body._id,
                clientId: req.body.clientId,
                name: info.name,
                due: info.due,
                manager: manager,
                requirements: requirements,
                members: [{ _id: mongoose.Types.ObjectId(manager._id) }]
            })
            project.save(async (err) => {
                if (err) {
                    res.send(err)
                } else {
                    const pr = await Projects.findOne({ name: info.name }, { _id: 1 })
                    // console.log(pr)
                    const workspace = await Workspace.findOneAndUpdate({ _id: req.body._id }, { $push: { 'projects': { _id: pr._id } } })
                    const userupdate = await User.updateOne({ _id: mongoose.Types.ObjectId(manager._id) }, { $push: { projects: { name: pr.name, _id: pr._id } } })
                    const client = await Clients.findOneAndUpdate({ _id: req.body.clientId }, { $push: { 'projects': { _id: pr._id } } })
                    res.send({ message: "new project added for this client" })
                }
            })

        }
    } catch (err) {
        console.log(err)
        res.send(err)
    }

})

router.post('/getclientprojects', async (req, res) => {
    const { projects } = req.body
    let projectArray = []

    for (obj of projects) {
        const project = await Projects.findOne({ _id: obj._id })

        projectArray.push(project)
    }
    console.log(projectArray)
    res.send(projectArray)
})

router.post('/taskstatechange', async (req, res) => {
    const { task, project, gid, tid } = req.body
    // console.log(gid)
    // console.log(tid)
    const statechanged = await Projects.findOneAndUpdate(
        {
            _id: project._id,
            "groups": {
                "$elemMatch": {
                    "_id": gid, "tasks._id": tid
                }
            }
        },
        {
            $set: {
                "groups.$[outer].tasks.$[inner]": task
            }
        },
        {
            "arrayFilters": [
                { "outer._id": gid },
                { "inner._id": tid }
            ]
        }
    )
    res.send()
})

router.post('/deleteworkspace', async (req, res) => {
    //delete workspace teams
    // const teams =  await Teams.find({workspace:mongoose.Types.ObjectId(req.body._id)})
    // console.log(teams)
    // for(team in teams){
    //     console.log(team)
    //     // const teamdelete = await Teams.findByIdAndDelete({_id:team._id})
    // }

    // //delete workspace clients

    // const clients = await Clients.find({workspaceId:mongoose.Types.ObjectId(req.body._id)})
    // for(client in clients){
    //     const clientdelete = await Clients.findByIdAndDelete({_id:client._id})
    // }

    // //delete workspace project

    // const projects = await Projects.find({workspaceId:mongoose.Types.ObjectId(req.body._id)})
    // for(project in projects){
    //     const projectdelete = await Projects.findByIdAndDelete({_id:project._id})
    // }

    const deletews = await Workspace.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.body._id) })
    // const projectsDelete = await Projects.findByIdAndDelete({workspaceId:req.body._id})

    res.send({ message: "Workpace is Deleted" })
})

router.post('/renameworkspace', async (req, res) => {
    const update = await Workspace.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: { name: req.body.name } })

    res.send({ message: "Name is Changed For This Workspace" })
})

router.post('/readchat', async (req, res) => {

    const chat = await Chats.findOne({ _id: req.body._id })

    res.send(chat)
})

router.post('/addmessage', async (req, res) => {
    const { rootUser, message, _id } = req.body

    const obj = {
        sender: {
            _id: rootUser._id,
            name: rootUser.name,
            image: rootUser.image
        },
        text: message
    }

    const update = await Chats.findOneAndUpdate({ _id: _id }, { $push: { conversations: obj } })

    res.send(obj)
})

router.post('/addtoproject', async (req, res) => {
    // console.log(req.body)
    const { users, project, rootUser, adminId } = req.body

    if (rootUser._id.toString() === adminId.toString()) {
        let flag = 0
        for (user of users) {
            let flag = 0
            for (member of project.members) {
                if (member === user._id) {
                    flag = 0
                    break
                } else {
                    flag = 1
                }
            }
            if (flag) {
                const add = await Projects.findOneAndUpdate({ _id: project._id }, { $push: { members: mongoose.Types.ObjectId(user._id) } })
                const userupdate = await User.updateOne({ _id: user._id }, { $push: { projects: { name: project.name, _id: project._id } } })

            }
        }
        res.send({ message: "Users Are Updated For This Project" })

    } else {
        let names = []
        for (user of users) {
            for (member of project.members) {
                if (!(member.toString() === user._id.toString())) {
                    names.push(' ' + user.name)
                }
            }
        }
        const action = {
            name: req.body.project,
            action: 'Add User Request',
            by: req.body.rootUser,
            metadata: names
        }
        if (!(names.length === 0)) {
            const remove = await Projects.findOneAndUpdate({ name: req.body.project.name }, { $push: { action: action } })
            res.send({ message: "your request has been sent" })
        }
    }


})


router.post('/addteamstoproject', async (req, res) => {
    // console.log(req.body)
    const { teams, project, rootUser, adminId } = req.body

    if (rootUser._id.toString() === adminId.toString()) {
        for (team of teams) {
            let flag = 0
            for (member of project.members) {
                if (member === team._id) {
                    flag = 0
                    break
                } else {
                    flag = 1
                }
            }
            if (flag) {
                const add = await Projects.findOneAndUpdate({ _id: project._id }, { $push: { members: mongoose.Types.ObjectId(team._id) } })
                const teamupdate = await Teams.updateOne({ _id: team._id }, { $push: { projects: { name: project.name, _id: project._id } } })
                for (member of team.members) {
                    let flag2 = 0
                    const memberTemp = await Users.findOne({_id:member._id})
                    for (userteam of memberTemp.teams) {
                        if (userteam === team._id) {
                            flag2 = 0
                            break
                        } else {
                            flag2 = 1
                        }
                    }
                    if(flag2){
                        const userupdate = await User.updateOne({ _id: member._id }, { $push: { projects: { name: project.name, _id: project._id } } })
                    }

                }

            }
        }
        res.send({ message: "Users Are Updated For This Project" })

    } else {
        let names = []
        for (team of teams) {
            for (member of project.members) {
                if (!(member.toString() === team._id.toString())) {
                    names.push(' ' + team.name)
                }
            }
        }
        const action = {
            name: req.body.project,
            action: 'Add Team Request',
            by: req.body.rootUser,
            metadata: names
        }
        if (!(names.length === 0)) {
            const remove = await Projects.findOneAndUpdate({ name: req.body.project.name }, { $push: { action: action } })
            res.send({ message: "your request has been sent" })
        }
    }

})

router.post('/projectrequests', async (req, res) => {
    const projects = await Projects.find({ workspaceId: mongoose.Types.ObjectId(req.body.wsId), 'action.0': { $exists: true } })
    let array = []
    for (val of projects) {
        // console.log(val.action)
        // array.push(val.action[0])
        for (act of val.action) {
            array.push(act)
        }
    }
    // console.log(array)
    res.send(array)
    // res.send(array)
})

router.post('/approveprojectaction', async (req, res) => {
    // console.log(req.body)
    const { data } = req.body

    if (data[1] === 'Add User Request') {
        // console.log("add user request")
        for (val of data[3]) {
            const user = await User.findOne({ name: val.trim() })
            if (user) {
                // console.log(user)
                const update = await Projects.updateOne({ _id: data[0]._id }, { $push: { members: user._id } })
                if (update) {
                    // console.log(update)
                    const userupdate = await User.updateOne({ _id: user._id }, { $push: { projects: { name: data[0].name, _id: data[0]._id } } })
                }
            }
        }
        const update = await Projects.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
        res.send({ message: "Team members are updated" })
    } else if (data[1] === 'Remove User Request') {
        const user = await User.findOne({ name: data[3] })
        const findProject = await Projects.updateOne({ _id: data[0]._id }, { $pull: { members: user._id } })
        const removedfromuser = await User.updateOne({ name: data[3] }, { $pull: { projects: { name: data[0] } } })

        if (findTeam && removedfromuser) {
            const update = await Projects.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
            res.send("User removed from the Project")
        } else {
            res.send()
        }
    }
})

router.post('/rejectprojectaction', async (req, res) => {
    const { data } = req.body
    const update = await Projects.updateOne({ _id: data[0]._id }, { $pull: { 'action': { $and: [{ 'metadata': data[3] }, { 'name': data[0] }, { 'by': data[2] }] } } })
    res.send()
})
module.exports = router


router.post('/myprojects', async (req, res) => {

    console.log("My Projects Called")
    let projectsData = []
    const { wsId, _id } = req.body

    const user = await User.findOne({ _id: mongoose.Types.ObjectId(_id) })
    // console.log(`User Data :${user}`)

    for (project of user.projects) {
        if(project){
            const projectTemp = await Projects.findOne({ _id: mongoose.Types.ObjectId(project._id) })
    
            if (projectTemp.workspaceId.toString() === wsId.toString()) {
                projectsData.push(projectTemp)
            }
        }
    }

    res.send(projectsData)

})