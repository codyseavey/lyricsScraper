var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var fs = require('fs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.post('/api/count', function(req, res) {
  console.log(req.body)
  var artist = req.body.text; 
  var re = new RegExp(" ", 'g');
  artist = artist.replace(re, '-');
  var words = ""; //words from each song in string
  var counter = {}; //analyze words and put them into json form
  var songNumber = 0;

  var nextUrl = "http://www.metrolyrics.com/"+artist+"-alpage-1.html";  //starting page

  request(nextUrl, function (error, response, body) {
    if (error) {
      res.send(error)
    }
  })

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
      var lyrics = {};
      for(var i = 0; i < cleaned.length; i++){
        lyrics[cleaned[i].word] = cleaned[i].count
      }
      res.json(lyrics)
    }
  });
});

var clean = function(words,counter){
  counter = {};
  words = words.replace(/[^0-9a-zA-Z\s]/g,"").toLowerCase();
  console.log(words)


  var data = fs.readFileSync('./public/common.txt', 'utf8').toString().split("\n");
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

app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.listen(8080, function(){
  console.log("Server listening...");
});