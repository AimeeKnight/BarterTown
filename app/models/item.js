'use strict';

module.exports = Note;
var Mongo = require('mongodb');
var _ = require('lodash');
var notes = global.nss.db.collection('notes');

function Note(note){
  this.title = note.title;
  this.body = note.body;
  this.dateCreated = note.dateCreated ? new Date(note.dateCreated) : new Date();
  this.tags = note.tags.split(',').map(function(n){return n.trim();});
  this.tags = _.compact(this.tags);
  this.userId = Mongo.ObjectID(note.userId);
}

Note.prototype.insert = function(fn){
  var self = this;

  notes.insert(self, function(err, records){
    fn(err);
  });
};

Note.findByUserId = function(userId, fn){
  userId = Mongo.ObjectID(userId);

  notes.find({userId:userId}).toArray(function(err, records){
    fn(records);
  });
};

Note.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  notes.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};

Note.findByIdAndDelete = function(id, fn){
  var _id = Mongo.ObjectID(id);

  notes.remove({_id:_id}, function(err, count){
    fn(count);
  });
};

