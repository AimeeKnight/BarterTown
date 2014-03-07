'use strict';

var Item = require('../models/item');

exports.index = function(req, res){
  Item.findByAvailable(function(items){
    res.render('items/index', {title:'Items', items:items});
  });
};

exports.new = function(req, res){
  res.render('items/new', {title:'New Item'});
};

exports.show = function(req, res){
  Item.findById(req.params.id, function(item){
    res.render('items/show', {title:item.name, item:item});
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


