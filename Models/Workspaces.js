const mongoose = require('mongoose')
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const workspace = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin:{
        type:ObjectId
    },
    clients: [
        {
            _id:{
                type:ObjectId
            }
        }
    ],
    projects: [
        {
            _id:{
                type:ObjectId
            }
        }
    ],
    members:[
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ]
})

const Workspaces = mongoose.model("Workspaces", workspace);

module.exports = Workspaces;