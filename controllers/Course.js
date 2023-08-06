const Course = require("../models/Course");
const Tag = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        // ek aur type se data nikal sakta tha yaha pe using payload jaisa ki middlewares->auth.js me jaise nikala using 
        //payload(mega backend class -3 56:00)
        //fetch data 
        // below is using db but we can use payload also 
        const {courseName, courseDescription, whatYoutWillLearn, price, tag} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYoutWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //check for instructor
        // hum log log in karte time hi bata diya hoga ki kon sa instructor hai so why now
        //because course jo ban raha hai usme instructor kon hai wo bhi to store hoga 
        //below is user id 
        const userId = req.user.id;
        //below is objec id of instuctor  
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: " , instructorDetails);
        //TODO: Verify that userId and instructorDetails._id  are same or different ?

        if(!instructorDetails) {
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found',
            });
        }

        //check given tag is valid or not
        // drop down se aayega to sahi hi doga but what if admin postman se kare to uske liye hai ye 
        //Tag.findById(tag)-> because Course.js in models me tag as a id stored hai 
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails) {
            return res.status(404).json({
                success:false,
                message:'Tag Details not found',
            });
        }

        //Upload Image top Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            //above two are string so iss terah hai 
            //below is a id (as in modes/Course.js me hai )
            // her instructor ki object id ki need hai isliye in line no 31 hamne instructer ki object id bhi nikal li 
            // kyuki waha user id hai but not object id 
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYoutWillLearn,
            price,
            // we can get tag by 2 ways 1- by db req.body line 13 and second is below 
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //add the new course to the user schema of Instructor
        //courses wale array ke ander nayi course ki id insert karna chahta hu 
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        //update the TAG ka schema 
        //TODO: HW

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });

    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error: error.message,
        })
    }
};





//getAllCourses handler function

exports.showAllCourses = async (req, res) => {
    try {
            //TODO: change the below statement incrementally
            const allCourses = await Course.find({});

            return res.status(200).json({
                success:true,
                message:'Data for all courses fetched successfully',
                data:allCourses,
            })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}
//getCourseDetails
exports.getCourseDetails = async (req, res) => {
    try {
            //get id
            const {courseId} = req.body;
            //find course details
            const courseDetails = await Course.find(
                                        {_id:courseId})
                                        .populate(
                                            {
                                                // below if you check instructer is User refrence "User.js"
                                                // iske ander addition Details ka refernce hai so isko bhi populate karna 
                                                // backend class -6 9:00
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        .populate("ratingAndreviews")
                                        .populate({
                                            // here also course content is reference to section and section has subsection 
                                            // // backend class -6 9:00
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection",
                                            },
                                        })
                                        .exec();

                //validation
                if(!courseDetails) {
                    return res.status(400).json({
                        success:false,
                        message:`Could not find the course with ${courseId}`,
                    });
                }
                //return response
                return res.status(200).json({
                    success:true,
                    message:"Course Details fetched successfully",
                    data:courseDetails,
                })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
