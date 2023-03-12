const mongoose = require('mongoose')

const workspace = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    client: [
        {
            name: {
                type: String,
                required: true
            },
            location: {
                type: String
            },
            email: {
                type: String
            },
            number: {
                type: String
            },
            website: {
                type: String
            },
            contacts: [{
                contactname: {
                    type: String,
                    required: true
                },
                contactemail: {
                    type: String,
                    required: true
                },
                contactnumber: {
                    type: String,
                    required: true
                },
                contactdesignation: {
                    type: String,
                    required: true
                }
            }],
            projects: [
                {
                    name: {
                        Type: String,
                    },
                    due: {
                        type: Date
                    },
                    manager: {
                        type: mongoose.Schema.Types.Mixed,
                        ref: "Users"
                    },
                    contacts: [{
                        type: mongoose.Schema.Types.Mixed,
                        ref: "Workspaces"
                    }],
                    requirements: [{
                        name: { type: String },
                        desc: { type: String }
                    }],
                    doc: {
                        type: String
                    },
                    members: [{
                        type: mongoose.Schema.Types.Mixed,
                        ref: "Users"
                    }],
                    groups: [
                        {
                            name: { type: String },
                        }
                    ]
                }
            ]
        }
    ],
    projects: [
        {
            name: {
                type: String,
            },
            due: {
                type: Date
            },
            manager: {
                type: mongoose.Schema.Types.Mixed,
                ref: "Users"
            },
            requirements: [{
                name: { type: String },
                desc: { type: String }
            }],
            doc: {
                type: String
            },
            members: [{
                type: mongoose.Schema.Types.Mixed,
                ref: "Users"
            }],
            groups: [
                {
                    name: { type: String },
                    tasks: [{
                        name: { type: String },
                        owner:{
                            type: mongoose.Schema.Types.Mixed,
                        },
                        status:{type:String},
                        due:{type:Date},
                        linkedTo:{
                            type: mongoose.Schema.Types.Mixed
                        }
                    }]
                }
            ]
        }
    ]
})

const Workspaces = mongoose.model("Workspaces", workspace);

module.exports = Workspaces;