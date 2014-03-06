'use strict';

var Note = require('../models/note');

exports.index = function(req, res){
  Note.findByUserId(req.session.userId, function(notes){
    res.render('notes/index', {title:'Notes', notes:notes});
  });
};

exports.fresh = function(req, res){
  res.render('notes/new', {title:'New Note'});
};

exports.show = function(req, res){
  Note.findById(req.params.id, function(note){
    res.render('notes/show', {title:note.title, note:note});
  });
};

exports.create = function(req, res){
  req.body.userId = req.session.userId;
  var note = new Note(req.body);
  note.insert(function(){
    res.redirect('/notes');
  });
};

exports.destroy = function(req, res){
  Note.findByIdAndDelete(req.params.id, function(){
    res.redirect('/notes');
  });
};

