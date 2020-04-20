const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks',auth,async (req,res) =>
{    
    //const task = new Task(req.body)
    const task = new Task(
        {
            ...req.body,                 //... is se jo bhi kuch request.body me hta hy wo yaha aa jaega
            owner:req.user._id          //is se task aur user k nich me relation create ho jata 
        }
    )
    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e)
    {
        res.status(500).send(e)
    }
    // task.save().then(() =>
    // {
    //     res.status(201).send(task)
    // }).catch((e) =>
    // {
    //     res.status(500).send(e)
    // })
})
router.get('/tasks',auth,async (req,res) =>
{
    try
    {
        //Ye same chj karne ka ek aur tarika hyu
        // const tasks = await Task.find({owner:req.user._id})
        await req.user.populate('tasks').execPopulate()
        res.status(200).send(req.user.tasks)
    }
    catch(e)
    {
        res.staus(500).send("User not found")
    }
    // Task.find({}).then((users) =>
    // {
    //     res.status(200).send(users)
    // }).catch((e) =>
    // {
    //     res.staus(500).send("User not found")
    // })
})
//pehle check karenge ki user authenticated hy k nahin aur fir sirf usi k task print karenge
router.get('/task/:id',auth,async (req,res) =>
{
    const _id = req.params.id
    try
    {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task)
            return res.status(404).send("task not found")
        res.status(200).send(task)        
    }
    catch(e)
    {
        res.status(500).send("task not found")
    }
    // Task.findById(_id).then((task) =>
    // {
    //     if(!task)
    //         return res.status(500).send("task not found")
    //     res.status(200).send(task)
    // }).catch((e) =>
    // {
    //     res.status(500).send("task not found")
    // })
})
router.patch('/tasks/:id',auth,async (req,res) =>
{
    const allowedUpdates = ['description','completed']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) =>
    {
        return allowedUpdates.includes(update)
    })
    if(!isValidOperation)
    {
        return res.status(400).send({error:"Invalid Update"})
    }
    try
    {
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        //const task = await Task.findById(req.params.id)
        //ye isliye kiya jis se jo user hy wpo apne task hi edit kar paye
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})

        if(!task)
        {
            return res.status(404).send()
        
        }
    updates.forEach((update) =>
    {
        task[update] = req.body[update]
    })
    await task.save()
    res.status(200).send(task)
}   
    catch(e)
    {
        res.status(400).send(e)
    }
})
router.delete('/tasks/:id',auth,async (req,res) =>
{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(e)
    {
        res.satus(500).send(e)
    }
})
module.exports = router