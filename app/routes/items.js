'use strict';

var Item = require('../models/item');
var User = require('../models/user');
var request = require('request');
//var fs = require('fs');
//var Mongo = require('mongodb');
var _ = require('lodash');

//DEFAULTS FOR PAGE AND LIMIT
var globalPage = 1;
var globalLimit = 10;
var defaultLimit = 10;

exports.index = function(req, res){
  // for filtering to work we need to do a findAll!!!
  if(req.query.move === 'next'){
    globalPage ++;
  }else if(req.query.move === 'prev'){
    globalPage --;
  }else{
    globalPage = 1;
  }
  globalLimit = req.query.limit || defaultLimit;

  req.query.page = req.query.page || globalPage;
  //req.query.limit = req.query.limit || globalLimit;

  Item.findByFilter(req.query, function(items){
    console.log(items);
    res.render('items/index', {title:'Items Available for Bid!', items:items, globalLimit:globalLimit, buttons:true});
  });
};

exports.new = function(req, res){
  res.render('items/new', {title:'New Item'});
};

exports.show = function(req, res){
  var bidItems = [];
  Item.findById(req.params.id, function(item){

    _.forEach(item.bids, function(bidItemId){

      Item.findById(bidItemId.toString(), function(bidItem){
        bidItems.push(bidItem);
      });
    });

    User.findById(item.userId.toString(), function(originalUser){
      //originalUser = originalUser._id.toString();
      Item.findByUserId(req.session.userId, function(userItems){
        res.render('items/show', {item:item, originalUser:originalUser, bidItems:bidItems, userItems:userItems, loggedInUser:req.session.userId});
      });
    });
  });
};

exports.create = function(req, res){
  req.body.userId = req.session.userId;
  var tags = [];
  tags.push(req.body.tag1);
  tags.push(req.body.tag2);
  tags.push(req.body.tag3);
  console.log(tags);
  req.body.tags = tags;
  var item = new Item(req.body);
  item.addPhoto(req.files.photo.path);
  item.insert(function(record){
    res.redirect('users/' + req.session.userId);
  });
};

exports.destroy = function(req, res){
  Item.deleteById(req.params.id, function(){
    res.redirect('users/' + req.session.userId);
  });
};

exports.trade = function(req, res){
  // trade route gets passed the original itemId (which is the item you are on the show page for) followed by
  // the winning item id => item/trade/originalItemId/winningItemId
  var itemId1 = req.params.id.trim();
  var itemId2 = req.params.id2.trim();
  var temp;

  Item.findById(itemId1, function(item1){
    item1.bids = [];
    Item.removeBid(itemId1, function(){
      Item.findById(itemId2, function(item2){
        item2.bids = [];
        Item.removeBid(itemId2, function(){

          User.findById(item1.userId.toString(), function(originalItemUser){
            sendOriginalEmail(originalItemUser, item2);

            User.findById(item2.userId.toString(), function(winningItemUser){
              sendTradeEmail(winningItemUser, item1);

              // flip flop owners
              temp = item1.userId;
              item1.userId = item2.userId;
              item2.userId = temp;

              // set items to unavailable (does an update)
              item1.toggleAvailable(function(){
                item2.toggleAvailable(function(){
                  //res.redirect('/');
                  res.redirect('users/' + req.session.userId);
                });
              });
            });
          });
        });
      });
    });
  });

};

exports.offer = function(req, res){
  // id1 == offered item
  var id1 = req.params.id.trim();
  // id2 == original item
  var id2 = req.params.id2.trim();

  Item.findById(id2, function(originalItem){
    originalItem.addBid(id1, function(){
    });
  });

  res.redirect('users/' + req.session.userId);
};


function sendOriginalEmail(originalUser, item){
  var key = process.env.MAILGUN;
  var url = 'https://api:'+key+'@api.mailgun.net/v2/sandbox45740.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    //res.redirect('/');
  });
  var form = post.form();
  form.append('from', 'steve.a.finley@gmail.com');
  form.append('to', originalUser.email);
  form.append('subject', 'Your recent trade');
  form.append('text', 'Congrats! You are the proud owner of a ' + item.name);
  //form.append('attachment', fs.createReadStream(__dirname + '/../static' + item.photo));
}

function sendTradeEmail(winningUser, item){
  var key = process.env.MAILGUN;
  var url = 'https://api:'+key+'@api.mailgun.net/v2/sandbox45740.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    //res.redirect('/');
  });
  var form = post.form();
  form.append('from', 'steve.a.finley@gmail.com');
  form.append('to', winningUser.email);
  form.append('subject', 'Your recent trade');
  form.append('text', 'Congrats, your item won! You are now the proud owner of a ' + item.name);
  //form.append('attachment', fs.createReadStream(__dirname + '/../static' + item.photo));
}

exports.filter = function(req, res){
  Item.filterByTag(req.query, function(items){
    var tag = req.query.tags;
    res.render('items/index', {tagTitle: tag, items:items, globalLimit:globalLimit, buttons:false});
  });
};

exports.toggle = function(req, res){
  var id = req.params.id.trim();

  Item.findById(id, function(item){
    item.toggleAvailable(function(){
    });
  });

  res.redirect('users/' + req.session.userId);
};

