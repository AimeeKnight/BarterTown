'use strict';

var User = require('../models/user');
var Item = require('../models/item');
var gravatar = require('gravatar');

exports.auth = function(req, res){
  res.render('users/auth', {title: 'User Authentication'});
};

exports.register = function(req, res){
  var user = new User(req.body);
  user.hashPassword(function(){
    user.addPhoto(req.files.userPhoto.path);
    user.insert(function(){
      console.log('>>>>>>>>', user);
      if(user._id){
        res.redirect('/');
      }else{
        res.render('users/auth', {title: 'User Authentication'});
      }
    });
  });
};

exports.login = function(req, res){
  User.findByEmailAndPassword(req.body.email, req.body.password, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id.toString();
        req.session.save(function(){
          res.redirect('/');
        });
      });
    }else{
      req.session.destroy(function(){
        res.render('users/auth', {title: 'User Authentication'});
      });
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.show = function(req, res){
  User.findById(req.session.userId, function(user){
    var url = gravatar.url(user.email, {s: '200', r: 'pg', d: '404'});
    Item.findByUserId(req.session.userId, function(items){
      console.log('ITEMS!!!!!!',items);
      res.render('users/show', {user:user, items:items, gravatar: url});
    });
  });
};


