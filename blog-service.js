var posts=[];
var categories=[];

const fs=require('fs');
var path=require('path');
//to get all posts
function getAllPosts(){
    return new Promise((resolve, reject)=>{
       if(posts.length===0){
        reject('No results returned');
       }else{
        resolve(posts);
       }
    });
}


//to get all categories
function getCategories(){
    return new Promise((resolve, reject)=>{
        if(categories.length===0){
            reject("no results returned");
        }else{
            resolve(categories);
        }
    });
}


function initialize(){
    return new Promise((resolve, reject)=>{
        fs.readFile(path.join(__dirname, 'data', "posts.json"), 'utf8', (err, postData)=>{
            if(err){
                reject('Unable to read posts file');
                return;
            }
           
                posts=JSON.parse(postData);
              
        
            fs.readFile(path.join(__dirname,'data', "categories.json"), 'utf8',(err, categoriesData)=>{
                if(err){
                    reject('Unable to read categories file');
                    return;
                }
               
                const parsedCategories = JSON.parse(categoriesData);
                categories = parsedCategories.map((category) => ({ id: category.id, category: category.category }));
        
                    resolve();
                
            } );
        });
    });
}

function getPublishedPosts(){
    return new Promise((resolve, reject)=>{
        const publishedPosts=posts.filter((post)=>post.published===true);
        if(publishedPosts.length>0){
            resolve(publishedPosts)
        }else{
            reject("no results returned");
        }
    });
}

//add new function getPublishedPostsByCategory
function getPublishedPostsByCategory(category){
    return posts.filter(post=>post.published===true&&post.category===category);
}

//add addPost
function addPost(postData){
    return new Promise((resolve, reject)=>{
        if(postData.published===undefined){
            postData.published=false;
        }else{
            postData.published=true;
        }

        postData.id=posts.length+1;

        //set the postDate to the current date
        postData.postDate=getCurrentDate();

        posts.push(postData);
        resolve(postData);
    });
}

//add getPostsByCategory(category)
function getPostsByCategory(category){
    return new Promise((resolve, reject)=>{
        const filteredPosts=posts.filter((post)=> String(post.category)===category);
        
        if(filteredPosts.length>0){
            resolve(filteredPosts);
        }else{
            reject("No results returned");
        }
    });
}

//add getPostsByMinDate(minDateStr)
function getPostsByMinDate(minDateStr){
    return new Promise((resolve, reject)=>{
        const minDate=new Date(minDateStr);
        const filteredPosts=posts.filter((post)=>{
            const postDate=new Date(post.postDate);
            return postDate>=minDate;
        });
        if(filteredPosts.length>0){
            resolve(filteredPosts);
        }else{
            reject("No results returned");
        }
    });
}

//add getPostById(id)
function getPostById(id){
    return new Promise((resolve, reject)=>{
        const post=posts.find((post)=>post.id===id);

        if(post){
            resolve(post);
        }else{
            reject("No result returned");
        }
    });
}

module.exports={initialize, getAllPosts, getPublishedPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById, getPublishedPostsByCategory};
