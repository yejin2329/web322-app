const bcrypt=require('bcryptjs');

//import mongoose module
const mongoose=require('mongoose');

//create schema variable
const Schema=mongoose.Schema;

//define loginHistorySchema
const loginHistorySchema=new Schema({
    dateTime: Date,
    userAgent: String
});

//define userSchema
const userSchema=new Schema({
    userName: { type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: { type: String, required: true},
    loginHistory:[loginHistorySchema]
});

let User; //to be defined....


module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection("mongodb+srv://yejinkim0178:wWagyf6dt8Z0ys85@senecaweb.9kwfdnm.mongodb.net/web322_week8?retryWrites=true&w=majority");
    db.on('error', (err)=>{
        console.log('Failed to connect to MongoDB:', err);
    reject(err); // reject the promise with the provided error
    });

    db.once('open', ()=>{
        console.log('Connected to MongoDB successfully');
    User = db.model("users", userSchema);
    resolve();
    });
    });
   };

   //registerUser(userData)
   module.exports.registerUser=function(userData){
    return new Promise(function(resolve, reject){
        if(userData.password != userData.password2){
            reject("Passwords do not match");
        }
        else{
            let newUser=new User(userData);
        //before saving, hash password
        bcrypt.hash(userData.password, 10).then(hash=>{
            //replace plain-text password with hashed password
            newUser.password=hash;
            newUser.save().then(()=>{
                //save user
                resolve();
            }).catch((err)=>{
                    if(err.code===11000){
                        reject("User Name already taken");
                    }
                    else{
                        reject("There was an error creating the user: "+ err);
                    }
                 });
                })    
                
       .catch(err=>{
        //if there was hashing error
        reject("There was an error encrypting the password");
       });
    }
    });   
}

   //checkUser(userData)
module.exports.checkUser = function(userData) {
    return new Promise(function(resolve, reject) {
      User.findOne({userName: userData.userName})
      .exec()
      .then(user=>{
        if(!user){
          reject('Unable to find user: '+userData.userName);
        }
        else{
          bcrypt.compare(userData.password, user.password)
          .then(result=>{
            if(result===true){
              //if password match
  
              //create a new login history record
              let newLogin = {
                dateTime: (new Date()).toString(),
                userAgent: userData.userAgent
              };
  
              user.loginHistory.push(newLogin);
  
              user.save()
              .then((user)=>{
                resolve(user);
              })
              .catch((err)=>{
                reject('There was an error saving the user: '+err);
              });
  
            }
            else{
              //if password don't match
              reject('Incorrect Password for user: '+ userData.userName);
            }
          })
          .catch(err=>{
            //if there was error comparing password
            console.log(err);
            reject('There was an error verifying the password');
          });
        }
      })
      .catch(err=>{
        console.log(err);
        reject('Unable to find user: '+userData.userName);
      });
    });
  }
  