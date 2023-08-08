const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


//auth
// all the middle ware are defined in routes 
exports.auth = async (req, res, next) => {
    try{
       
         //extract token
        //It tries to extract the token from different sources in the following order:
//a. req.cookies.token: It checks if the token is present in the cookies of the request.
//b. req.body.token: It checks if the token is present in the body of the request.
//c. req.header("Authorization").replace("Bearer ", ""): It checks if the token is present in the Authorization header of //
//the request. The code assumes that the token is provided in the format "Bearer {token}", so it removes the "Bearer " prefix to extract the actual token.
//This code snippet allows flexibility in where the token can be provided in the request. 
//It checks multiple sources to ensure that the token can be extracted from at least one of them.
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorisation").replace("Bearer ", "");

        //if token missing, then return response
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'TOken is missing',
            });
        }

         //verify the token
        // uses verify mehtod for verification 
        //decode it by using secret key 
        // we verify token using JWT_SECRET
        try{
            const decode =  jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
             //Finally, the decoded payload is assigned to the req.user property, 
            //making it available for further processing or authentication within the request object.
        }
        catch(err) {
            //verification - issue
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
         //now we will go to next() middleware ??
        next();
    }
    catch(error) {  
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}

//isStudent
exports.isStudent = async (req, res, next) => {
    //  use payload that you made in Auth.js 
 try{
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
 }
 catch(error) {
    return res.status(500).json({
        success:false,
        message:'User role cannot be verified, please try again'
    })
 }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Instructor") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Instructor only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }


//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{    
           console.log("Printing AccountType ", req.user.accountType);
           if(req.user.accountType !== "Admin") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Admin only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }