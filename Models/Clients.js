const mongoose = require('mongoose')
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const client = new mongoose.Schema({
    workspaceId:{
        type:ObjectId,
    },
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
        name: {
            type: String,
            required: true
        },
        number: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        }
    }],
    projects: [{
        _id:{
            type:ObjectId
        }
    }]
})


const Clients = mongoose.model("Clients", client);

module.exports = Clients;