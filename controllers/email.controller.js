const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client.db("ExperimentLabsInternshipPortal").collection("users");
const orgCollection = client.db("ExperimentLabsInternshipPortal").collection("organizations");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.smtp_server,
    port: process.env.smtp_port,
    auth: {
        user: process.env.smtp_login,
        pass: process.env.smtp_key,
    },
});

module.exports.sendBulkEmails = async (req, res) => {
    try {
        const { subject, text } = req.body;
        const usersWithoutOrganization = await userCollection.find({ organizations: { $exists: false } }).toArray();
        const emails = await Promise.all(
            usersWithoutOrganization.map(async (user) => {
                const { counsellorId, email } = user;
                let counsellorEmail = "naman.j@experimentlabs.in"; // Default counselor email

                if (counsellorId) {
                    const counselor = await orgCollection.findOne({ _id: new ObjectId(counsellorId) });
                    if (counselor && counselor.officialEmail) {
                        counsellorEmail = counselor.officialEmail;
                    }
                }

                const mailOptions = {
                    from: counsellorEmail,
                    to: email,
                    subject: subject,
                    text: text
                };
                return transporter.sendMail(mailOptions);
            })
        );

        res.send({ success: true, message: "Email Sent Successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch counselor emails for users without organization' });
    }
};


module.exports.sendAnEmail = async (req, res) => {
    try {
        const { fromEmail, toEmail, subject, text } = req.body;
        const mailOptions = {
            from: fromEmail,
            to: toEmail,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions);
        res.send({ success: true, message: "Email Sent Successfully" });


    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch counselor emails for users without organization' });
    }
};