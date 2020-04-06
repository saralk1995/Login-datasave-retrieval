const express = require('express')
const router = new express.Router()
const Task = require('../models/task')


router.post('/tasks',async (req,res) =>
{
    const task = new Task(req.body)
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
router.get('/tasks',async (req,res) =>
{
    try
    {
        const users = await Task.find({})
        res.status(200).send(users)
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
router.get('/task/:id',async (req,res) =>
{
    const _id = req.params.id
    try
    {
        const task = await Task.findById(_id)
        if(!task)
            return res.status(500).send("task not found")
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
router.patch('/tasks/:id',async (req,res) =>
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
        const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        if(!task)
            return res.status(404).send()
        res.status(200).send(task)
    }
    catch(e)
    {
        res.status(400).send(e)
    }
})
router.delete('/tasks/:id',async (req,res) =>
{
    try{
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task)
        {
            res.status(404).send()
        }
        res.send(task)
    }
    catch(e)
    {
        res.satus(500).send(e)
    }
})
module.exports = router