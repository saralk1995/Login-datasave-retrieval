const mongoose = require('mongoose')
const validator = require('validator')
const User = mongoose.model('User',
{
    name:
    {
        type:String,
        required:true,
        trim:true
    },
    age:
    {
        type:Number,
        required:true
    },
    email:
    {
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error("Invalid email id")
            }
        }
    },
    password:
    {
        type:String,
        required:true,
        trim:true,
        validate(value)
        {
            if(value.length < 6)
            {
                throw new Error("Min. length of password is 6")
            }
        }

    }

})
module.exports = User