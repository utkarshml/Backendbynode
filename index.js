import  express  from "express";
import mongoose, { now } from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken"
import { render } from "ejs";


const app = express()
// Midleweres ------------------------
app.set("view engine", "ejs")
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended : true}))

// Database connnet
mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName:"Login"
}).then(e=>{
    console.log("db connect")
}).catch(e=>{
    console.log(e)
})
const dbSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const User = mongoose.model("user",dbSchema)

// Login Authentication 
const isAuth = (req , res , next)=>{
    const value= req.cookies
    if((Object.keys(value)).length === 0){
       next() 
    }
    else{
      const auth =  jwt.verify(value.value ,  "alkdjflkdsjflkdsj")
      let data =   User.findOne({_id:auth.id})
      data.then(()=>{
        if(data){
            res.render("admin")
        }
        else{
            res.redirect("login")
        }
      })
      
    }


    
}
// home post request ==============
app.post("/signup" , async (req , res)=>{
    const userExist = await User.findOne({email: req.body.email})
    if(userExist){
        res.redirect("/login")
    }
    else{
    const { name , email , password} = req.body
    const user =  await User.create({
        name , email, password
    })
    let token = jwt.sign({id:user._id} , 'alkdjflkdsjflkdsj')
    res.cookie("value" , token , {
        httpOnly : true
    })
    res.render("admin")
}
})
app.post("/login" , async (req ,res) =>{
    const userExist = await User.findOne({email:req.body.email})
    if(userExist){
    let token = jwt.sign({id:userExist._id} , 'alkdjflkdsjflkdsj')
     res.cookie("value" , token , {
        httpOnly:true
     } )
     res.render("admin")
    }
    else{
        res.redirect("/signup")
    }
})
app.post("/logout" ,(req , res)=>{
    res.cookie("value" , null , {
        expires:new Date(now())
    })
    res.redirect("/")
})
// Home and get request -------------------------
app.get("/",(req ,res)=>{
    res.render("home")
})
app.get("/login" , isAuth,(req , res)=>{
    res.render("login")
})
app.get("/signup", isAuth ,(req , res)=>{
    res.render("signup")
})

// Server ----------------------------
app.listen("3000", (res , req)=>{
    console.log("server is running")
})