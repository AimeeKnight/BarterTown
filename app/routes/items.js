'use strict';

var Item = require('../models/item');
var User = require('../models/user');
//var request = require('request');
//var fs = require('fs');
//var Mongo = require('mongodb');
var _ = require('lodash');

exports.index = function(req, res){
  Item.findByAvailable(function(items){
    console.log(items);
    res.render('items/index', {title:'Items Available for Bid!', items:items});
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


      res.render('items/show', {item:item, originalUser:originalUser, bidItems:bidItems, loggedInUser:req.session.userId});
    });
  });
};

exports.create = function(req, res){
  req.body.userId = req.session.userId;
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
  // trade route gets passed the initiating User's Id followed by 
  // the winning User's id => item/trade/initatingUserId/winningUserId
  var userId1 = req.params.id.trim();
  var userId2 = req.params.id2.trim();
  var temp;

  Item.findById(userId1, function(item1){
    Item.findById(userId2, function(item2){
      temp = item1.userId;
      item1.userId = item2.userId;
      item2.userId = temp;
      item1.toggleAvailable(function(){
        item2.toggleAvailable(function(){
        });
      });
    });
  });

  res.redirect('users/' + req.session.userId);
};

exports.offer = function(req, res){
  var id = req.params.id.trim();

  Item.findById(id, function(item){
    item.toggleAvailable(function(){
    });
  });

  res.redirect('users/' + req.session.userId);
};

/*
function sendTradeEmail(userId){
  User.findById(userId, function(user, item){

    var key = process.env.MAILGUN;
    var url = 'https://api:'+key+'@api.mailgun.net/v2/sandbox36742.mailgun.org/messages';
    var post = request.post(url, function(err, response, body){
      //res.redirect('/');
    });
    var form = post.form();
    form.append('from', 'aimeemarieknight@gmail.com');
    form.append('to', user.email);
    form.append('subject', 'Your recent trade');
    form.append('text', 'Below is a picture of your new item!');
    //form.append('attachment', fs.createReadStream(__dirname + item.photo));

  });
}
*/

