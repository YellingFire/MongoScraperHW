$("#scraper-BTN").on("click", function() {
  $.get( "/scrape", function(data) {

    function getResults() {
      $.getJSON("/articles", function(data) {
  
        for (var i = 0; i < data.length; i++) {
          let newContainer = "<div class='container articleCard'>";
          let newDiv = "<div class='articleDIV' data-id=" + data[i]._id + ">";
          let newTitle = "<h4 id='artTitle'>" + data[i].title + "</h2>";
          let newArtLink = "<a href='" + data[i].link + "'target='blank'>Click Here for full story</a>";
          let noteButton = "<button id='note-BTN' data-id=" + data[i]._id + " class='btn btn-secondary'>Click For Notes</button>";
    
          $("#main-articles").append(newContainer + newDiv + newTitle + "\n" + newArtLink + "\n" + noteButton);
         
        }
      });
  
    }   
    getResults();
       
    // console.log("Scrape Complete!");
  });
});

  
  $(document).on("click", "#note-BTN", function() {
    
    $("#notes").empty();
    
    var thisId = $(this).attr("data-id");
    // console.log("*****" + thisId +"*****");
  
    
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      
      .then(function(data) {
        // console.log("line 42: " + data);
        
        $("#notes").append("<h2>" + data.title + "</h2>");
        
        $("#notes").append("<input id='titleinput' name='title' >");
        
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        $("#notes").append("<button data-id='" + data.note._id + "' id='deletenote'>Delete Note</button>");
  
        
        if (data.note) {
         
          $("#titleinput").val(data.note.title);
        
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  
  $(document).on("click", "#savenote", function() {
     
    var thisId = $(this).attr("data-id");
  
   
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
       
        title: $("#titleinput").val(),
        
        body: $("#bodyinput").val()
      }
    })
     
      .then(function(data) {
        
        // console.log("this is the notes data: " + data);
        
        $("#notes").empty();
      });
  
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });

$(document).on("click", "#deletenote", function() {
  
  var parentSelect = $(this).parent();
  var selected = $(this).attr("data-id");
  // console.log("this is the selected in deletroute app.js: " + selected)
  
  $.ajax({
    type: "DELETE",
    url: "/delete/" + selected,
    
    success: function(response) {
    
      $("#titleinput").val("");
      $("#bodyinput").val("");
      $("#action-button").html("<button id='make-new'>Submit</button>");
    }
    
  });
});
  