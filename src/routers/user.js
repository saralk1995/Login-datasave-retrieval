const express = require('express')  //because all routes using that server
const User = require('../models/user')   //because routes k andar hamne user model use kiya hy
const router = new express.Router()     
//ek router create kiya aur usey fir export kar diya aur index.js me load kara liya.
//is se jab bhi ham index.js ko chalanege aur user router ko search karengee to yaha redirect ho jaega
//router ko index.js me load karna hga aur fir use app me add karna hga

router.post('/users',async (req,res) =>
{
    const user = new User(req.body)
    try
    {
        await user.save()   //a promise is returned.following this code will only run if this line run successfully
        res.status(201).send(user)
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
router.get('/users',async (req,res) =>
{   
    try
    {
        const users = await User.find({})
        res.send(users) 
    }
    catch(e)
    {   
        res.status(500).send(e)
    }
    // User.find({}).then((users) =>       //sends back all users in db and if this is successfull we get in users variable
    // {
    //     res.send(users)                 
    // }).catch((e) =>
    // {   
    //     res.status(500).send(e)
    // })                               
})
router.get('/users/:id',async (req,res) =>   //here you get the id using :id passed in url and use it to search operation in DB
{
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user)
            return res.status(500).send(user)

        res.send(user)
    }
    catch(e)
    {
        res.status(500).send("User not found")
    }
    // User.findById(_id).then((user) =>
    // {
    //     if(!user)
    //         return res.status(500).send(user)
    
    //     res.send(user)
    // }).catch((e) =>
    // {
    //     res.status(500).send("User not found")
    // })
})
router.patch('/users/:id',async (req,res) =>
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
        const user = await User.findByIdAndUpdate(req.params.id,req.body,{ new:true,runValidators:true })
        //Here by using findbyidandupdate we pass the id in the url and the req body that is the data to 
        //be updated.after that new:true returns new updated user and runvalidators true runs validator 
        //for new update done

        if(!user)
        {
            return res.status(404).send()
        }
        res.send(user) 
    }
    catch(e)
    {
            res.status(400).send(e)
    }
})
router.delete('/users/:id',async (req,res) =>
{
    try
    {
        const user = await User.findByIdAndDelete(req.params.id)
        //is user me jo bhi user delete hga wo aa jaega
        if(!user)
            return res.status(404).send()
        res.send(user)    
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

module.exports = router