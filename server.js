/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Jenny Kim, Student ID: 139787220, Date: June 2, 2023
*
* Cyclic Web App URL: https://tricky-apron-fawn.cyclic.app
*
* GitHub Repository URL: https://github.com/yejin2329/web322-app.git
*
********************************************************************************/

//require function for blog-service.js
const blogService = require("./blog-service");


var express=require("express");
var app=express();

var path=require('path');

//add static
app.use(express.static('public'));
var HTTP_PORT=process.env.PORT||8080;

blogService.initialize().then(()=>{
    app.listen(8080, ()=>{
        console.log("Server is running on port 8080");
    });
})
.catch((error)=>{
    console.error("Failed to initialize blog service:", error);
});

//app.listen(HTTP_PORT, onHttpStart);
//call this function after http server starts listening for requests
//function onHttpStart(){
//    console.log("Express http server listening on: " + HTTP_PORT);
//}


//res.redirect() Homepage
app.get("/", (req, res)=>{
    res.redirect("/about");
});
//"/about" to return about.html file from views folder
app.get("/about", (req,res)=>{
    res.sendFile(path.join(__dirname,"./views/about.html"));
});


//add another route
app.get("/blog", (req, res)=>{
   blogService.getPublishedPosts()
   .then((data)=>{
    res.send(data);
   })
    .catch((err)=>{
        res.status(500).send({message:err});
    });
});

//add /posts
app.get("/posts", (req, res)=>{
    blogService.getAllPosts()
    .then((data)=>{
        res.send(data);
    })
    .catch((error)=>{
        res.status(500).send({message:error});
    });
});

//add /categories
app.get("/categories", (req, res)=>{
    blogService.getCategories()
    .then((data)=>{
        res.send(data);
    })
    .catch((error)=>{
        res.status(500).send({message:error});
    });
});

//No matching route
app.use((req, res)=>{
    res.status(404).send("Page Not Found");
});