/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Jenny Kim, Student ID: 139787220, Date: June 17, 2023
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

//adding multer, cloudinary and streamifier
const multer=require("multer");
const cloudinary=require('cloudinary').v2;
const streamifier=require('streamifier');

//set cloudinary config 
cloudinary.config({
    cloud_name: 'deszzoiq8',
    api_key: '452493672813397',
    api_secret: '_m31FeuAQhJQO9nxAZn4KXbX27k',
    secure: true
});

//create 'upload' without storage
const upload=multer(); 

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

//add new route GET/posts/add
app.get('/posts/add',(req,res)=>{
    const filePath=path.join(__dirname, 'views', 'addPost.html');
    res.sendFile(filePath);
});

//add new route POST
app.post('/posts/add', upload.single('featureImage'), (req,res)=>{
    if(req.file){
        let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
        (error, result) => {
        if (result) {
        resolve(result);
        } else {
        reject(error);
        }
        }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        };
        async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
        }
        upload(req).then((uploaded)=>{
        processPost(uploaded.url, req.body, res);
        });
       }else{
        processPost("", req.body, res);
       }
       function processPost(imageUrl, postData, res){
        postData.featureImage = imageUrl;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blogService
        .addPost(postData)
        .then((newPost)=>{
            console.log('New post added:', newPost);
            res.redirect('/posts');
        })
        .catch((error)=>{
            console.error('Error adding post:', error);
            res.redirect('/posts/add');
        });
        
       }
    });
//update /posts
app.get("/posts", (req, res)=>{
    const category=req.query.category;
    const minDate=req.query.minDate;

   if(category){
    blogService
    .getPostsByCategory(category)
    .then((data)=>{
        res.send(data);
    })
    .catch((error)=>{
        res.status(500).send({message:error});
    });
   }else if(minDate){
    blogService
    .getPostsByMinDate(minDate)
    .then((data)=>{
        res.send(data);
    })
    .catch((error)=>{
        res.status(500).send({message:error});
    });
   }
   else{
    blogService
    .getAllPosts()
    .then((data)=>{
        res.send(data);
    })
    .catch((error)=>{
        res.status(500).send({message:error});
    });
   }
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

//add /post/value
app.get("/post/:value", (req, res)=>{
    const postId=parseInt(req.params.value);

    blogService
    .getPostById(postId)
    .then((post)=>{
        res.send(post);
    })
    .catch((error)=>{
        res.status(500).send({message:error});
    });
});

//No matching route
app.use((req, res)=>{
    res.status(404).send("Page Not Found");
});


