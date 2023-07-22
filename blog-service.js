const Sequelize = require('sequelize');
var sequelize = new Sequelize('vzvdrfij', 'vzvdrfij', 'Uc9QxkQK-tZnkLNL-JPDPjUchxSbBEv4', {
 host: 'mahmud.db.elephantsql.com',
 dialect: 'postgres',
 port: 5432,
 dialectOptions: {
 ssl: { rejectUnauthorized: false }
 },
 query: { raw: true }
});


//"Post" model
const Post=sequelize.define('Post',{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

//"Category" model
const Category=sequelize.define('Category', {
    category: Sequelize.STRING
});

//define relationship
Post.belongsTo(Category, {foreignKey: 'category', onDelete: 'SET NULL'});


const fs=require('fs');
var path=require('path');

const {Op}=Sequelize;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            console.log('Database synchronized');
            resolve();
        })
        .catch((error)=>{
            console.log('Error synchronizing database:', error);
            reject('Unable to sync the database');
        });
       });
}

module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll().then((posts)=>{
            if(posts.length===0){
                reject('No results returned');
            }
            else{
                resolve(posts);
            }
        })
        .catch((error)=>{
            reject('Error retrieving posts: '+ error);
        });
       });
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{category:category}
        })
        .then((posts)=>{
            if(posts.length===0){
                reject('No results returned');
            }
            else{
                resolve(posts);
            }
        })
        .catch((error)=>{
            reject('Error retrieving posts by category: '+error);
        });
        });
       }


module.exports.getPostsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                postDate:{
                    [Op.gte]:new Date(minDateStr)
                }
            }
        })
        .then((posts)=>{
            if(posts.length===0){
                reject('No results returned');
            }
            else{
                resolve(posts);
            }
        })
        .catch((error)=>{
            reject('Error retrieving posts by minimum date: '+error);
        });
       });
}

module.exports.getPostById = function(id){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{id:id}
        })
        .then((posts)=>{
            if(posts.length===0){
                reject('No results returned');
            }
            else{
                resolve(posts[0]);
            }
        })
        .catch((error)=>{
            reject('Error retrieving post by ID: '+error);
        });
       });
}

module.exports.addPost = function(postData){
    return new Promise((resolve, reject) => {
        postData.published=(postData.published)? true: false;

        for(let prop in postData){
            if(postData[prop]===""){
                postData[prop]=null;
            }
        }
        postData.postDate=new Date();

        Post.create(postData).then((post)=>{
            resolve(post);
        })
        .catch((error)=>{
            reject('Unable to create post: '+ error);
        });
});
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{published:true}
        })
        .then((posts)=>{
            if(posts.length===0){
                reject('No results returned');
            }
            else{
                resolve(posts);
            }
        })
        .catch((error)=>{
            reject('Error retrieving published posts: '+error);
        });
       });
}

module.exports.getPublishedPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{published:true, category:category}
        })
        .then((posts)=>{
            if(posts.length===0){
                reject('No results returned');
            }
            else{
                resolve(posts);
            }
        })
        .catch((error)=>{
            reject('Error retrieving published posts by category: '+error);
        });
       });
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll().then((categories)=>{
            if(categories.length===0){
                reject('No results returned');
            }
            else{
                resolve(categories);
            }
        })
        .catch((error)=>{
            reject('Error retrieving categories: '+ error);
        });
       });
    }

//new add categories function
module.exports.addCategory=function(categoryData){
    return new Promise((resolve, reject)=>{
        for(let prop in categoryData){
            if(categoryData[prop]===""){
                categoryData[prop]=null;
            }
        }
    Category.create(categoryData).then((category)=>{
        resolve(category);
    }).catch((error)=>{
        reject('Unable to create category: '+error);
    });
    });
    };


//new delete category by Id
module.exports.deleteCategoryById=function(id){
    return new Promise((resolve, reject)=>{
        Category.destroy({
            where:{
                id:id
            }
        }).then((rowsDeleted)=>{
            if(rowsDeleted>0){
                resolve();
            }
            else{
                reject("Category not found");
            }
        }).catch((error)=>{
            reject("Unable to delete category: "+error);
        });
    });
};

//new delete posts by id
module.exports.deletePostById=function(id){
    return new Promise((resolve, reject)=>{
        Post.destroy({
            where:{
                id:id
            }
        }).then((rowsDeleted)=>{
            if(rowsDeleted>0){
                resolve(rowsDeleted);
            }
            else{
                reject("Post not found");
            }
        }).catch((error)=>{
            reject("Unable to delete post: "+error);
        });
    });
};

module.experts={
    Post,
    Category
};