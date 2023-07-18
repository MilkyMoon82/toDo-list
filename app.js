const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
  // .then(() => {
  //   console.log("Connected to Mongo!");
  // })
  // .catch((err) => {
  //   console.error("Error connecting to Mongo", err);
  // });

const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your toDo list",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit to delete an item",
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems)
//  .then(function(){
//     console.log("Successfully saved into our DB.");
//   })
//   .catch(function(err){
//     console.log(err);
//   })
//////////////////////////////////
app.get("/", function (req, res) {
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved into our DB.");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { newTask: foundItems, tDay: "Today" });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/:paramName", function (req, res) {
  const customList = _.capitalize(req.params.paramName);

  List.findOne({ name: customList })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customList,
          items: defaultItems,
        });

        list.save();
        // console.log("saved");
        res.redirect("/" + customList);
      } else {
        // console.log("saved_no");
        res.render("list", {
          tDay: foundList.name,
          newTask: foundList.items,
        });
      }
    })
    .catch(function (err) {});
});

app.post("/", function (req, res) {
  let itemName = req.body.newValue;
  let listName = req.body.list;
  const ItemN = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    ItemN.save().then(function (err) {
      res.redirect("/");
    });
  } else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(ItemN);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", async function (req, res) {
  const checkedId = req.body.checkbox;
  let listName = req.body.listName;

  if (listName === "Today") {
    try {
      const item = await Item.findByIdAndDelete(checkedId);
    } catch (err) {
      console.log(err);
    }
    return res.redirect("/");
  }
  let foundList = await List.findOne({ name: listName }).exec();
  foundList.items.pull({ _id: checkedId });
  foundList.save();
  return res.redirect("/" + listName);
});

app.listen(3000, function () {
  console.log("server is running on port 3000");
});
