var express = require('express');
var app = express();
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var fs = require('fs');

app.get('/', function(req,res){
  res.sendFile(__dirname+'/index.html');
});

app.get('/process_get', function(req, res) {
  
  var artist = req.query.artist; //get from html form
  var re = new RegExp(" ", 'g');
  artist = artist.replace(re, '-');
  var words = ""; //words from each song in string
  var counter = {}; //analyze words and put them into json form
  var songNumber = 0;

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("<h1>"+artist+"</h1>");
  
  var nextUrl = "http://www.metrolyrics.com/"+artist+"-alpage-1.html";  //starting page
  
  async.whilst(function(){ return nextUrl !== "javascript:void(0)" && nextUrl !== undefined;}, //go until there are no more pages (aka you can no longer click on the next button)
    function(next){ 
      request(nextUrl,function(err,resp,html){ //get current page
        if(!err){
          var $ = cheerio.load(html);
          var urls = $(".songs-table.compact a"); //get all the links for the lyrics to every song
          
          async.each(urls,function(url,doneCallback){  //async each loop
            var urll = $(url).attr("href");
            var title = $(url).attr('title').toLowerCase();
            if(title.indexOf(artist.replace(/-/g," ").toLowerCase()) > -1){
                request(urll,function(err, resp, html) {
                if(!err){
                  var $page = cheerio.load(html);
                  words += $page(".js-lyric-text").text() + " ";
                  console.log(title);
                  songNumber += 1;
                  return doneCallback();
                }
              });
            } else {
              return doneCallback();
            }
        },function(){
          nextUrl = $('.button.next').attr("href");
          next();
        });
      }
    });
    
  }, function(err){
    if (!err){
      var cleaned = clean(words, counter); //why u no include last page with words?
      res.write("Songs Analyzed: " + songNumber + "<br><br>");
      for(var i = 0; i < cleaned.length; i++){
        res.write(cleaned[i].word + " : "); 
        res.write(cleaned[i].count+"<br>"); 
      }
      res.end();
    }
  });
});

app.listen(8080, function(){
  console.log("Server listening...");
});

var clean = function(words,counter){
  counter = {};
  words = words.replace(/\s+/g, " ").replace(/[^a-zA-Z ]/g, "").toLowerCase();
  
  var data = fs.readFileSync('common.txt', 'utf8').toString().split("\n");
  for(var i in data){
    var re = new RegExp(" "+data[i]+" ", 'g');
    words = words.replace(re, ' ');
  } 
  
  
  words.split(" ").forEach(function (word) {
    if (word.length > 20){
      return;
    }
    if(counter[word]){
      counter[word]++;
    } else if (word != ""){
      counter[word] = 1;
    }
  });
  var count = [];
  for (var e in counter){
    count.push({
      word: e,
      count: counter[e]
    });
  }
  count.sort(function (a, b){
    return b.count - a.count;
  });

  return count.slice(0, 30);
};