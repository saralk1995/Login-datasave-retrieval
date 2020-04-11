const path = require('path')    
const express = require('express');     //for express server 
require('./db/mongoose')                //for database connection
const app = express()                   //creates app in express
const port = 3000                       //set up port number
//without middleware 
//new request ----> run route handler

//with middleware 
//new request ----> do something ---->run route handler

//yaha agar middleware declare kiya to sare route handlers k liye chalega 
//isliye usey hatakar ek file me dala aur ab usey specific route k liye use karenge
                                           
app.use(express.json())                 //parse incoming data in json
const userRouter = require('./routers/user')
app.use(userRouter)
const taskRouter = require('./routers/task')
app.use(taskRouter)
app.listen(port,() =>
{
    console.log("Server is up and running on port " + port)
})
