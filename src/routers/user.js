const express = require('express')  //because all routes using that server
const User = require('../models/user')   //because routes k andar hamne user model use kiya hy
const auth = require('../middleware/auth')  //ye middleware k liye
const router = new express.Router()     
//ek router create kiya aur usey fir export kar diya aur index.js me load kara liya.
//is se jab bhi ham index.js ko chalanege aur user router ko search karengee to yaha redirect ho jaega
//router ko index.js me load karna hga aur fir use app me add karna hga

//ye wala route signup k liye tha
//isme token generate hga aur us token se ye hga ki agar apne signup kar liya to login nai karna 
//hga
router.post('/users',async (req,res) =>
{
    const user = new User(req.body)
    try
    {
        await user.save()   //a promise is returned.following this code will only run if this line run successfully
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } 
    catch(e)
    {
        res.status(400).send(e)
    }        
    // user.save().then(() =>
    // {
    //     res.status(201).send(user)
    // }).catch((e) =>
    // {
    //     res.status(400).send(e)
    // })
})
//Ye router ban rha user ko log in karwane k liye
router.post('/users/login',async (req,res) =>
{
    //ye ek naya function banaya hy jo check karega ki login wale jo credential diye hy waisa koi
    //user exist bhi karta hy k nahin
    //findbycredential function bhi ham user model me bana rhe hy
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)    
        const token = await user.generateAuthToken()
        //jab bhi ham res.send k sath koi object send karte hy to pich JSON.stringfy call hta hy
        //aur wo fir toJSON call ho jata hy jisme hamne pwd aur token hatane ka code likha hua
        res.send({user,token}) 
    }catch(e)                                           
    {                                                   
        res.status(400).send()
    }
})
//Yaha par wahi token delete karna hy jo unhone login karte waqt authenticate kiya tha
router.post('/users/logout',auth,async (req,res) =>
{
    //yaha par hamne bas wo token jo aya hy auth se hokar usey delete kiya hy original array 
    //of tokens se
    try{
        req.user.tokens = req.user.tokens.filter((token) =>
        {
            return token.token != req.token 
        })
        await req.user.save()
        res.send()
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})
router.post('/users/logoutAll',auth,async (req,res) =>
{
    try
    {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})
router.get('/users/me',auth,async (req,res) =>      //ye route ab sirf apki profile laega agar ap authenticated ho to
{   
    res.send(req.user)      //ye user ab sidha auth se validate hokar aa rha hy
    // try
    // {
    //     const users = await User.find({})
    //     res.send(users) 
    // }
    // catch(e)
    // {   
    //     res.status(500).send(e)
    // }
    // User.find({}).then((users) =>       //sends back all users in db and if this is successfull we get in users variable
    // {
    //     res.send(users)                 
    // }).catch((e) =>
    // {   
    //     res.status(500).send(e)
    // })                               
})
// router.get('/users/:id',async (req,res) =>   //here you get the id using :id passed in url and use it to search operation in DB
// {
//     const _id = req.params.id
//     try{
//         const user = await User.findById(_id)
//         if(!user)
//             return res.status(500).send(user)

//         res.send(user)
//     }
//     catch(e)
//     {
//         res.status(500).send("User not found")
//     }
//     // User.findById(_id).then((user) =>
//     // {
//     //     if(!user)
//     //         return res.status(500).send(user)
    
//     //     res.send(user)
//     // }).catch((e) =>
//     // {
//     //     res.status(500).send("User not found")
//     // }) 
// })
router.patch('/users/me',auth,async (req,res) =>
{
    const updates = Object.keys(req.body) //Object.keys se jo bhi input data aa rha hy req.body k through
    //uski jo keys wala part hota hy wo updates me chala jaega
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update) =>  //updates.every har input key k liye chalega aur wo key update me hgi
    {   //agar 9 tru hy aur ek false hy to every false return karega
        //agar 10 true hy tabhi every true return karega
        return allowedUpdates.includes(update)  //ye dekhega ki update allowed updates me hy k nahin
    })
    if(!isValidOperation)
    {
        return res.status(400).send({error:"Invalid Update"})
    }
    try
    {
        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{ new:true,runValidators:true })
        //1Here by using findbyidandupdate we pass the id in the url and the req body that is the data to 
        //be updated.after that new:true returns new updated user and runvalidators true runs validator 
        //for new update done
        //2 isey isliye comment kiya kyunki ye haare mongoose middlleware ko bypass kar ja rha tha
        //to jo encryption hna chaiye password ka update k case me wo nai ho par rha tha

        // const user = await User.findById(req.params.id)

        updates.forEach((update) =>
        {
            req.user[update] = req.body[update]
        })
        //ye bracket notation isliye use kiya hy jis se kyunki update ki value dynamic hy
        //update ek traike se name password email kuch bhi ho sakta
        await req.user.save() //ab middleware chal jaega
        // if(!user)
        // {
        //     return res.status(404).send()
        // }
        res.send(req.user) 
    }
    catch(e)
    {
            res.status(400).send(e)
    }
})
router.delete('/users/me',auth,async (req,res) =>
{
    try
    {
        //ye req.user._id auth se aa rha hy ab ham usey use karke delete karenge
        // const user = await User.findByIdAndDelete(req.user._id)
        //is user me jo bhi user delete hga wo aa jaega
        // if(!user)
        //     return res.status(404).send()
        await req.user.remove()
        res.send(req.user)    
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})


module.exports = router