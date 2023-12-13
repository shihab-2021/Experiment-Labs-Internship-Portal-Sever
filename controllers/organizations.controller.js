const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const orgCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("organizations");
const userCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("users");

// module.exports.createAnOrganization = async (req, res, next) => {
//   const user = req.body;
//   const result = await orgCollection.insertOne(user);
//   const organizationId = result.insertedId;
//   const email = user.email;
//   const filter = { email: email };
//   const options = { upsert: true };

//   const updatedDoc = {
//     $set: {
//       organizationId: "" + organizationId,
//       organizationName: "" + user?.organizationName,
//       role: "Admin",
//     },
//   };

//   const newResult = await userCollection.updateOne(filter, updatedDoc, options);
//   res.send({ result, newResult });
// };

module.exports.createAnOrganization = async (req, res, next) => {
  const org = req.body;
  const result = await orgCollection.insertOne(org);
  const organizationId = result.insertedId;
  const email = org.officialEmail;
  const filter = { email: email };
  const userDoc = await userCollection.findOne(filter);

  const organizationObj = {
    organizationId: "" + organizationId,
    role: "Admin",
  };

  // If user has organizations array, push the new organization, else create a new array
  if (
    userDoc &&
    userDoc.organizations &&
    Array.isArray(userDoc.organizations)
  ) {
    userDoc.organizations.push(organizationObj);
  } else {
    userDoc.organizations = [organizationObj];
  }

  const updatedDoc = {
    $set: {
      organizations: userDoc.organizations,
    },
  };

  const newResult = await userCollection.updateOne(filter, updatedDoc);
  res.send({ result, newResult });
};

module.exports.updateAnOrganization = async (req, res, next) => {
  const orgId = req.params.id;
  const updatedOrg = req.body;

  try {
    const existingOrg = await orgCollection.findOne({
      _id: new ObjectId(orgId),
    });

    if (!existingOrg) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Update the organization in the collection
    const result = await orgCollection.updateOne(
      { _id: new ObjectId(orgId) },
      { $set: updatedOrg }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getAnOrganization = async (req, res, next) => {
  const orgId = req.params.id;
  const result = await orgCollection.findOne({ _id: new ObjectId(orgId) });
  res.send(result);
};