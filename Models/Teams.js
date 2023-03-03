const mongoose = require("mongoose")

const team = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin:
    {
        type: mongoose.Schema.Types.Mixed,
        ref:"Users"
    },
    state:{
        type:Boolean,
        default : false
    },
    members: [
        {
            type: mongoose.Schema.Types.Mixed,
        }
    ]
})


const Teams = mongoose.model("Teams", team);

module.exports = Teams;