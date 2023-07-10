const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }
});


//a function -> to send emails
async function sendVerificationEmail(email, otp) {
    try{
        ///passed 3 things in mailSender.js
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion", otp);
        console.log("Email sent Successfully: ", mailResponse);
    }
    catch(error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}
//pre middleware 
//document save hone se juste pehle ye run hona chahiye (pre middle ware)
//and this will happen because user data store hone se pehle 

OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    //Once the sendVerificationEmail function has been awaited and completed, the next function is called, indicating that the middleware has finished its task and the save operation can proceed.
    next();
}) 



module.exports = mongoose.model("OTP", OTPSchema);

