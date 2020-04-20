const mongoose = require('mongoose')
const validator = require('validator')
//2 approach ho sakti hy ya to user table me sare task id store kare jaye ya
//Task table me us se related user store kiya jaye
const Task = mongoose.model('Task',
{
    description:
    {
        type:String,
        required:true,
        trim:true
    },
    completed:
    {
        type:Boolean,
        default:false
    },
    owner:
    {
        type:mongoose.Schema.Types.ObjectId,    //ye ye keh rha ki type me object id store hga   
        required:true,
        ref:'User'                              //isse ham taskmodel k owner ko User model se connect kar pa rhe
        
    }
})

module.exports = Task