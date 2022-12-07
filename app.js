const express = require("express");
const app = express();
const port = process.env.port || 3000;
/* const date = require(__dirname + "/date.js"); */
const mongoose = require("mongoose");
const _ = require("lodash");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/toDoList");

const itemSchema = new mongoose.Schema({
  name: String,
});

// Adding items into DB
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Buy kwiwi's ",
});

const item2 = new Item({
  name: "Update todo list ",
});

const item3 = new Item({
  name: "Press + to add a new item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

//////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  /* let day = date.getDate(); */

  Item.find(function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved all the items to the database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
        route: "/"
      });
    }
  });
});

///////////////////////////////////////////////////////////////////////////////

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list when you don't find the list that exist
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        //Show an existing list when the list is found
        res.render("List", {
          listTitle: foundList.name,
          newListItems: foundList.items,
          route: "/"
        });
      }
    }
  });
});

///////////////////////////////////////////////////////////////////////////////

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");
});

//////////////////////////////////////////////////////////////////////////////

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName =req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function (err) {
    if (!err) {
      console.log("deleted succesful");
      res.redirect("/");
    }
  });

  }else{
    List.findOneAndUpdate({
      name: listName
    },{
      $pull: {items: {_id: checkedItemId}}
    }, function (err, foundItems){
      if(!err){
        res.redirect("/"+listName);
      }
    } );
  }

  
});

//////////////////////////////////////////////////////////////////////////////

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
