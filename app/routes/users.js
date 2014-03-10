'use strict';

var User = require('../models/user');
var Item = require('../models/item');
var gravatar = require('gravatar');
var request = require('request');

exports.auth = function(req, res){
  res.render('users/auth', {title: 'User Authentication'});
};

exports.register = function(req, res){
  var user = new User(req.body);
  user.hashPassword(function(){
    user.addPhoto(req.files.userPhoto.path);
    user.insert(function(){
      if(user._id){
        var key = process.env.MAILGUN;
        var url = 'https://api:'+key+'@api.mailgun.net/v2/sandbox36742.mailgun.org/messages';
        var post = request.post(url, function(err, response, body){
          res.redirect('/');
        });
        var form = post.form();
        form.append('from', 'aimeemarieknight@gmail.com');
        form.append('to', user.email);
        form.append('subject', 'Thank you for registering with NashBA!');
        form.append('text', 'Thank you for registering with the Nashville Barter Association. Happy Bartering.');
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
          res.redirect('users/' + req.session.userId);
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
      res.render('users/show', {user:user, items:items, gravatar: url});
    });
  });
};


