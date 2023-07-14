const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")


const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))


let tasks = ["Example"]

app.get("/", function(req, res){
    let day = date.getDate()
    res.render("list", {newTask: tasks, tDay: day})
})

app.post("/", function(req, res){
    let item = req.body.newValue
    tasks.push(item)
    res.redirect("/")
    console.log(item)
})

app.listen(3000, function(){
    console.log("server is running on port 3000")
})