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
const stripJs=require('strip-js');

var express=require("express");
const exphbs=require('express-handlebars');
//W4 

var app=express();

var path=require('path');
const categories = require("./data/categories.json");
//const Category=require('./categories'); 



//Custome "navLink" helper 
const navLinkHelper= function(url,options){
    return '<li' +     ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
    '><a href="' + url + '">' + options.fn(this) + '</a></li>';
};

//Custom "equal" helper
const equalHelper = function (lvalue, rvalue, options) {
    if (arguments.length < 3) {
      throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    if (lvalue != rvalue) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  };

//update handlebars engine 
app.engine('.hbs', exphbs.engine({
    extname:'.hbs',
    defaultLayout: "main",
    helpers: {
        navLink: navLinkHelper,
        equal: equalHelper,
        safeHTML: function(context){
            return stripJs(context);
        }
    }
}));




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


  //W4
//new "express-handl
//adding middleware function to show correct "active" form
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
   });


//res.redirect() Homepage
app.get("/", (req, res)=>{
    res.redirect("/blog");
});
//"/about" to return about.html file from views folder
app.get("/about", (req,res)=>{
    res.render('about');
});

//add another route
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
    

});


//add another route
app.get('/blog/:id', async (req, res) => {
    let viewData = {};
  
    try {
      const postId = parseInt(req.params.id);
      viewData.post = await blogService.getPostById(postId);
  
      viewData.categories = await blogService.getCategories();
    } catch (err) {
      viewData.message = "No results";
      viewData.categoriesMessage = "No results";
    }
  
    if (req.query.category) {
      try {
        const category = req.query.category;
        viewData.posts = await blogService.getPublishedPostsByCategory(category);
      } catch (err) {
        viewData.postsMessage = "No results";
      }
    } else {
      try {
        viewData.posts = await blogService.getPublishedPosts();
      } catch (err) {
        viewData.postsMessage = "No results";
      }
    }
  
    res.render("blog", { data: viewData });
  });
  
  
  
//add new route GET/posts/add
app.get('/posts/add',(req,res)=>{
   res.render('addPost');
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
        res.render("posts", {posts: data});
    })
    .catch((error)=>{
        res.render("posts", {message:"An error occured"});
    });
   }else if(minDate){
    blogService
    .getPostsByMinDate(minDate)
    .then((data)=>{
        res.render("posts", {posts:data});
    })
    .catch((error)=>{
        res.render("posts", {message:"An error occured"});
    });
   }
   else{
    blogService
    .getAllPosts()
    .then((data)=>{
        res.render("posts", {posts:data});
    })
    .catch((error)=>{
        res.render("posts",{message:"An error occured"});
    });
   }
});

//add /categories

app.get("/categories", (req, res) => {
    blogService
      .getCategories()
      .then((data) => {
        if (data.length > 0) {
          res.render("categories", { categories:data });
        } else {
          res.render("categories", { message: "No categories available" });
        }
      })
      .catch((err) => {
        res.render("categories", { message: "Error retrieving categories" });
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




app.set('view engine', '.hbs');

