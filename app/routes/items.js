'use strict';

var Item = require('../models/item');
// var Mongo = require('mongodb');

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
  Item.findById(req.params.id, function(item){
    res.render('items/show', {item:item});
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
  var id1 = req.params.id.trim();
  var id2 = req.params.id2.trim();
  var temp;

  Item.findById(id1, function(item1){
    Item.findById(id2, function(item2){
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

