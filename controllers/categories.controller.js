const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const categoriesCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("categories");

module.exports.getAllCategories = async (req, res, next) => {
  const result = await categoriesCollection.find({}).toArray();
  res.send(result);
};

module.exports.saveACategory = async (req, res, next) => {
  const categoryData = req.body;

  const category = await categoriesCollection.findOne({
    categoryName: categoryData.categoryName,
  });

  if (category) {
    return res.status(400).json({ error: "sorry a category already exists" });
  }

  const result = await categoriesCollection.insertOne(categoryData);
  res.send(result);
};
