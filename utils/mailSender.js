
//below package is to send mail 
const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try{
        // to send mail we need to make transporter using nodemailer
            let transporter = nodemailer.createTransport({
                //below 3 should also be in environment file (vip)
                
                host:process.env.MAIL_HOST,
                auth:{
                    //MAIL_USER->jo mail bhrjta hai 
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                }
            })


            let info = await transporter.sendMail({
                from: 'StudyNotion || CodeHelp - by Babbar',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
    }
}


module.exports = mailSender;