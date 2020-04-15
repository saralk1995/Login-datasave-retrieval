const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({   //yaha par alag se schema banakar usey mongoose.model ko 
    name:                                  //isliye pass kiya hy kyunki hame middleware ka use karna hy 
    {                                      //passsword validation k liye.Pehle ham direct json pass kar 
        type:String,                       //the mongoose.model ko ab ham schema banakar wo schema pass kar rhe
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
        unique:true,    //ye isliye kiya hy jis se ye email unique ho aur koi is email se register nai kar paye
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

    },  
    tokens:     //ek token ka arrya decalre kiya jo sare tokens generate honge usko store karke rakh sake
    [
        {
            token:
            {
                type:String,
                required:true
            }
        }
    ]

})
 //ab hame userSchema par 2 method milte hy pre aur post
 //pre wala method jab chalega agar ham koi chj db me save
//karne k pehle chalani aur post agar save k bad chalani 
userSchema.pre('save',async function (next)   
{
  //  this                                     //we can access documnet being saved using this variable
    const user = this
    //yaha par ye isliye use kiya hy kyunki hame ye check karna 
    //padega ki pwd field modify ho rha hy ya nahin agar wo nai ho
    //to encryption ki jarurat hi nahin hy
    if(user.isModified('password'))        
    {
        user.password  = await bcrypt.hash(user.password,8)

    }
    

    next()                                     //next() se hame ye pata chalta hy ki jo code hame chalana 
                                               //hy db me save karne se pehle user par wo khatam ho chuka hy
})

//yaha statics isliye declare kiya hy kyunki ham chah rhe hy ki wo findbycredential pehle 
//model me check kare us function k liye
//statics method are accessible on  model
userSchema.statics.findByCredentials = async (email,password) =>
{
    const user = await User.findOne({email})    //yaha basically bracket me hame {email:email} ye likhna chaiye tha
    if(!user)
    {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password) //yaha ham check kar rhe jo user mila us usernam k sath 
    if(!isMatch)                                                 //uska password match kar rha hy k nahin
    {
        throw new Error('Unable to login')
    }
    return user
}
//ye method login router se call hga jwt token generate karne k liye
//methods are accessible on insatnce of model
userSchema.methods.generateAuthToken = async function()
{
    const user = this
    //yaha par ek string pass karni hti to jwt ko verify kare badme aur ek unique chj jis par ham
    //token banaye
    const token = jwt.sign({ _id : user.id.toString() },'thisissaral')
    //isme hamne bas jo token generate kiya usey us particular user k liye save kar diya
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token

} 
userSchema.methods.toJSON = function()   
{
    //ye isliye kiya hy jis se jab ham user data send kare to pwd aur token send na ho
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}
const User = mongoose.model('User',userSchema)
module.exports = User