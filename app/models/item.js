/* jshint expr:true */
'use strict';

module.exports = Item;
var Mongo = require('mongodb');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var items = global.nss.db.collection('items');

function Item(item){
  this.name = item.name;
  this.description = item.description;
  this.bids = [];
  this.tags = item.tags.split(',').map(function(n){return n.trim();});
  this.tags = _.compact(this.tags);
  this.userId = Mongo.ObjectID(item.userId);
  this.available = item.available || false;
}

Item.prototype.addPhoto = function(oldpath){
  // oldpath = temp folder

  // path to new location
  var abspath = __dirname + '/../static/img/items/' + this.userId.toString();
  fs.mkdirSync(abspath);

  // grabs .png
  var extension = path.extname(oldpath);
  var relpath = '/img/items/' + this.userId.toString() + '/' + this.name + extension;

  // abspath == /../static/img/item/this.userId/this.name.png
  abspath += '/' + this.name + extension;
  // renameSync moves file
  fs.renameSync(oldpath, abspath);
  // sets photo path
  this.photo = relpath;
};

Item.prototype.insert = function(fn){
  var self = this;

  items.insert(self, function(err, records){
    fn(err);
  });
};

Item.findByUserId = function(userId, fn){
  userId = Mongo.ObjectID(userId);

  items.find({userId:userId}).toArray(function(err, records){
    fn(records[0]);
  });
};


Item.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.findOne({_id:_id}, function(err, record){
    fn(_.extend(record, Item.prototype));
  });
};

Item.findAll = function(fn){
  items.find().toArray(function(err, records){
    fn(records);
  });
};

Item.deleteById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.remove({_id:_id}, function(err, count){
    fn(count);
  });
};

Item.findByAvailable = function(fn){
  items.find({available:true}).toArray(function(err, records){
    fn(records);
  });
};

Item.prototype.toggleAvailable = function(fn){
  //var _id = Mongo.ObjectID(this._id);
  this.available = !this.available;
  //this.available ? this.bidStartDate = new Date() : this.bidStartDate = '';
  items.update({_id:this._id}, this, function(err, count){
    fn(err, count);
  });
};

Item.prototype.addBid = function(bidItemId, fn){
  var _bidItemId = Mongo.ObjectID(bidItemId);
  var contain = _.contains(this.bids, _bidItemId);
  if(!contain){
    this.bids.push(_bidItemId);
  }
  items.update({_id:this._id}, this, function(err, count){

    fn(count);
  });
};

Item.removeBid = function(bidItemId, fn){
  var _bidItemId = Mongo.ObjectID(bidItemId);
  items.update({bids: _bidItemId}, { $pull: {bids: _bidItemId} }, {multi:true}, function(err, count){
    fn(count);
  });
};

Item.findByFilter = function(data, fn){
  //SET DEFAULTS FOR PAGING HERE---------
  var limit, page;
  if(!data.limit){
    limit = 5;
  }else{
    limit = parseInt(data.limit);
  }

  if(!data.page){
    page = 0;
  }else{
    page = parseInt((data.page)-1);
  }

  var options = {'limit': limit, 'skip':(limit*page)};
  data.available = !!(data.available) || false;

  delete data.limit;
  delete data.page;
  console.log('data>>>>>', data);
  items.find(data, options).toArray(function(err, records){
    console.log('records>>>>>', records);
    fn(records);
  });
};
