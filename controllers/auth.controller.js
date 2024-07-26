const client = require("../utils/dbConnect");
const userCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("users");
const firebaseUtils = require("../utils/firebaseSignUp");
const jwt = require("jsonwebtoken");
const { firebaseGetUser } = require("../utils/firebaseGetUser");
const { generateCustomPassword } = require("../utils/generatePassword");
const {
  getCounsellorDataFormat,
  getSchoolAdminDataFormat,
  getStudentDataFormat,
} = require("../utils/userCreateDataFormat");
const { createToken } = require("../utils/createToken");
const schoolCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("schools");

module.exports.createUser = async (req, res, next) => {
  try {
    const { token, requestedBy } = req.body;
    let secret = "",
      schoolId = "",
      userData = {};

    switch (requestedBy) {
      case "strideahead":
        secret = process.env.stride_token_secret;
        break;
      case "mergedDashboard":
        secret = process.env.merged_dashboard_token_secret;
        break;
      default:
        break;
    }

    const decoded = jwt.verify(token, secret);

    const { school, user } = decoded;

    const isSchoolExists = await schoolCollection.findOne({
      officialEmail: school.officialEmail,
    });

    

    if (isSchoolExists) {
      schoolId = isSchoolExists._id.toString();
    } else {
      const schoolData = {
        ...school,
        phone: "",
        schoolAddress: "",
        schoolLogo: "",
        counsellorId: user.counsellorId,
        creator: requestedBy,
        representative: "",
      };
      const schoolInsertData = await schoolCollection.insertOne(schoolData);
      schoolId = schoolInsertData.insertedId.toString();
    }

    
    if (!user?.email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email!",
      });
    }
    
    const isUserExists = await userCollection.findOne({ email: user?.email });
    
    if (isUserExists) {
      const newUser = await firebaseGetUser(user?.email);
      if (newUser?.uid) {
        return res.status(200).json({
          user: newUser,
          credentials: isUserExists,
          success: true,
          message: "Login Credentials Retrieved!",
        });
      }
    }

    if (!user.firstName || !user.phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and phone!",
      });
    }

    user.password = generateCustomPassword(user);

    if (user.role === "Counsellor") {
      userData = getCounsellorDataFormat(user);
    } else if (user.role === "SchoolAdmin") {
      userData = getSchoolAdminDataFormat(user, schoolId);
    } else {
      userData = getStudentDataFormat(user, schoolId);
    }

    const firebaseResponse = await firebaseUtils.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    if (!firebaseResponse.success) {
      return res.status(403).json({
        success: false,
        message: "User can not be registered!",
      });
    } else {
      const insertResponse = await userCollection.insertOne(userData);

      return res.status(201).json({
        credentials: user,
        success: true,
        message: "User Registered successfully!",
        data: insertResponse,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

// module.exports.createTestToken = async (req, res, next) => {
//   const result = createToken(req.body);
//   res.send({
//     token: result,
//   });
// };

// module.exports.decodeToken = async (req, res, next) => {
//   const decoded = jwt.verify(req.body.token, process.env.stride_token_secret);
//   res.send({
//     decoded,
//   });
// };
