const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("users");

module.exports.getAnUserByEmail = async (req, res, next) => {
  const email = req.query.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  res.send(user);
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
