const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("users");

// const firebaseUtils = require('../utils/firebaseSignUp');
// const passwordUtils = require('../utils/generatePassword');

module.exports.getAnUserByEmail = async (req, res, next) => {
  const email = req.query.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  res.send(user);
};

// module.exports.getAnUserById = async (req, res, next) => {
//   const { id } = req.params;
//   const query = { _id: new ObjectId(id) };
//   const user = await userCollection.findOne(query);
//   res.send(user);
// };

module.exports.updateUserById = async (req, res, next) => {
  const userId = req.params.id;
  const userData = req.body; // Data to update in the user object

  try {
    const query = { _id: ObjectId(userId) };
    const update = { $set: userData };

    const updatedUser = await userCollection.findOneAndUpdate(query, update, {
      returnOriginal: false, // To get the updated document
    });

    if (updatedUser.value) {
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser.value,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.saveAUser = async (req, res, next) => {
  const user = req.body;

  const email = await userCollection.findOne({ email: user.email });

  if (email) {
    return res.status(400).json({ error: "sorry a user already exists" });
  }

  const result = await userCollection.insertOne(user);
  res.send(result);
};

module.exports.addUserToNewOrganization = async (req, res, next) => {
  const updatedUserData = req.body; // Assuming this object is sent from the frontend

  try {
    // Extract email from the incoming data
    const { email } = updatedUserData;

    // Find the user based on the email
    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Ensure the organizations array exists in the user profile
    if (!user.organizations || !Array.isArray(user.organizations)) {
      user.organizations = []; // Initialize organizations array if it doesn't exist
    }

    // Check for organizationId and role, then update or push to the organizations array
    const { organizationId, role } = updatedUserData;

    const existingOrganization = user.organizations.find(
      (org) => org.organizationId === organizationId
    );

    if (!existingOrganization) {
      // Push a new object to the organizations array if not present
      user.organizations.push({ organizationId, role });
    } else {
      // Update role if organizationId already exists
      existingOrganization.role = role;
    }

    // Save the updated user data back to the database
    await userCollection.updateOne({ email }, { $set: user });

    res.send({ message: "User profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send({ message: "Error updating user profile" });
  }
};

module.exports.getUsersByOrganization = async (req, res, next) => {
  const { organizationId } = req.params;

  try {
    // Find users where the organizations array contains the specified organizationId
    const users = await userCollection
      .find({
        "organizations.organizationId": organizationId,
      })
      .toArray();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userData = await userCollection.findOne({ _id: new ObjectId(id) });
    const { password, ...user } = userData;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error fetching users",
    });
  }
};

module.exports.removeMemberFromOrganization = async (req, res) => {
  const { userId, organizationId } = req.params;

  try {
    // Fetch user data by userId
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    // If user not found, return 404 Not Found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out the organization to remove from the organizations array
    user.organizations = user.organizations.filter(
      (org) => org.organizationId !== organizationId
    );

    // Update user data in the collection
    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { organizations: user.organizations } }
    );

    // Send success response
    res.json({ message: "Organization membership removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};



// module.exports.addBulkUsers = async (req, res) => {
//   const users = req.body;

// //   try {
// //     // Add users to Firebase using the function
// //     for (const user of users) {
// //       const password = passwordUtils.generateCustomPassword(user);
// //       console.log(password);
// //       user.password = password;
// //       const result = await firebaseUtils.createUserWithEmailAndPassword(user.email, password);
// //       if (!result.success) {
// //         console.error(`Failed to create user in Firebase for email: ${user.email}`);
// //         // Handle error case: Maybe remove the user from MongoDB?
// //       }
// //     }

// //     const insertedUsers = await userCollection.insertMany(users);
// //     const count = await userCollection.countDocuments();

//     res.status(200).json({ message: 'Users added to MongoDB and Firebase successfully', insertedUsers, count });
//   } catch (error) {
//     console.error('Error adding users:', error);
//     res.status(500).json({ message: 'Error adding users', error: error.message });
//   }
// }