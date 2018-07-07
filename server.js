//Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const Article = require("./models/article");
const Note = require("./models/note");


const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("/"));
}

// morgan creates a log of requests
app.use(logger("dev"));
//body-parser handles form submissions
app.use(bodyParser.urlencoded({ extended: true }));
//express.static serves the public folder as a static directory
app.use(express.static("public"));

// This connects to the Mongo DB
// mongoose.connect("mongodb://localhost/scraper");
mongoose.connect(process.env.MONGODB_URI || "mongodb://yellingfire:303scraper@ds153700.mlab.com:53700/heroku_lvbq4gz6");
var db = mongoose.connection
// Routes

app.get("/scrape", function(req, res) {
  
  axios.get("http://www.breitbart.com/")

  .then(function(response) {

    var $ = cheerio.load(response.data);

    $("ul#BBTrendUL li").each(function(i, element) {
      // Empty result object
      var result = {};
      // console.log("this is the result" + result);

      // this creates the object with links and titles
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // this creates a new Article from the scrape
      Article.create(result)
        .then(function(dbArticle) {
    
          console.log(dbArticle);
        })
        .catch(function(err) {
          
          return res.json(err);
        });
    });

    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
      // console.log("*****articles route hit*****" + dbArticle)
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Delete One from the DB
app.delete("/delete/:id", function(req, res) {

  // console.log("+++++++ Delete route hit in server.js req.params: " + req.params.id + "+++++++")
 
  // Remove a note using the objectID
    Note.deleteOne({ _id: req.params.id }, function(error, removed) {     
        
      if (error) {
        // console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        Article.findOne({}, (error, found => {
          // console.log("found" + found);
        })); 
        // console.log("This is the removed 'else': " + removed);
        res.send(removed);
      }
    })    
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
