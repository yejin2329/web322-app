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
                resolve();
        
        
            fs.readFile(path.join(__dirname,'data', "categories.json"), 'utf8',(err, categoriesData)=>{
                if(err){
                    reject('Unable to read categories file');
                    return;
                }
               
                    categories=JSON.parse(categoriesData);
                    resolve();
                
            } );
        });
    });
}

function getPublishedPosts(){
    return new Promise((resolve, reject)=>{
        const publishedPosts=posts.filter(post=>post.published===true);
        if(publishedPosts.length>0){
            resolve(publishedPosts)
        }else{
            reject("no results returned");
        }
    });
}

module.exports={initialize, getAllPosts, getPublishedPosts, getCategories};
