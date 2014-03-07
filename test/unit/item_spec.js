/* jshint expr:true */

'use strict';

process.env.DBNAME = 'item-test';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var fs = require('fs');
var exec = require('child_process').exec;
var Item, User;
var item2Id;
var userId;

describe('Item', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Item = require('../../app/models/item');
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/items/*';
    var cmd = 'rm -rf ' + testdir;
    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/item.png';
      var copy1file = __dirname + '/../fixtures/item-copy1.png';
      var copy2file = __dirname + '/../fixtures/item-copy2.png';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copy1file));
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copy2file));
      global.nss.db.dropDatabase(function(err, result){
        done();
      });
    });
  });

  describe('new', function(){
    it('should create a new Item', function(){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      expect(i1).to.be.instanceof(Item);
      expect(i1.name).to.equal('Broom');
      expect(i1.description).to.equal('Description');
      expect(i1.tags).to.have.length(3);
      expect(i1.userId).to.be.instanceof(Mongo.ObjectID);
    });
  });

  describe('#addPhoto', function(){
    it('should add a photo to the item', function(){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      var oldname = __dirname + '/../fixtures/item-copy1.png';
      i1.addPhoto(oldname);
      expect(i1.photo).to.equal('/img/items/Broom222222222222222222222222/Broom.png');
    });
  });

  describe('#insert', function(){
    it('should insert a new Note object', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      var oldname = __dirname + '/../fixtures/item-copy1.png';
      i1.addPhoto(oldname);
      i1.insert(function(){
        expect(i1._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });
  
  describe('.findById', function(){
    it('should find by item id ', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      var i2 = new Item({name:'Purse',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'333333333333333333333333'});
      i1.insert(function(){
        i2.insert(function(){
          item2Id = i2._id.toString();
          Item.findById(item2Id, function(item){
            expect(item._id.toString()).to.equal(item2Id);
            done();
          });
        });
      });
    });
  });

  describe('.findAll', function(){
    it('should find all items ', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      var i2 = new Item({name:'Purse',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'333333333333333333333333'});
      i1.insert(function(){
        i2.insert(function(){
          //item2Id = i2._id.toString();
          Item.findAll(function(items){
            expect(items).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  describe('.deleteById', function(){
    it('should delete item by id', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      i1.insert(function(){
        var item1Id = i1._id.toString();
        Item.deleteById(item1Id , function(deletedCount){
          expect(deletedCount).to.equal(1);
          done();
        });
      });
    });
  });
  
  describe('.findByUserId', function(){
    it('should find by userId ', function(done){
      var sue = new User({email:'sue@aol.com', password:'abcd'});
      sue.hashPassword(function(){
        sue.insert(function(){
          userId = sue._id.toString();
          var i1 = new Item({name:'Broom',
                             description:'Description',
                             tags:'some, random, tags',
                             userId:userId});
          i1.insert(function(){
            Item.findByUserId(userId, function(item){
              expect(item.userId.toString()).to.deep.equal(userId);
              done();
            });
          });
        });
      });
    });
  });

  describe('.findByAvailable', function(){
    it('should find all available items ', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         available: true,
                         userId:'222222222222222222222222'});
      var i2 = new Item({name:'Purse',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'333333333333333333333333'});
      var i3 = new Item({name:'Shoe',
                         description:'Description',
                         tags:'some, random, tags',
                         available: true,
                         userId:'433333333333333333333333'});
      i1.insert(function(){
        i2.insert(function(){
          i3.insert(function(){
            Item.findByAvailable(function(items){
              expect(items).to.have.length(2);
              done();
            });
          });
        });
      });
    });
  });
  
  describe('#toggleAvailable', function(){
    it('should toggle availability', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      i1.insert(function(){
        i1.toggleAvailable(function(){
          expect(i1.available).to.equal(true);
          expect(i1.bidStartDate).to.be.instanceof(Date);
          done();
        });
      });
    });
  });

  describe('#addBid', function(){
    it('should find all available items ', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      var i2 = new Item({name:'Purse',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'333333333333333333333333'});
      i1.insert(function(){
        var item1Id =  i1._id.toString();
        i2.insert(function(){
          i2.addBid(item1Id, function(count){
            expect(count).to.equal(1);
            expect(i2.bids).to.have.length(1);
            expect(i2.bids[0].toString()).to.equal(item1Id);
            done();
          });
        });
      });
    });
  });

  describe('.removeBid', function(){
    it('should remove a bid from all item bid arrays in the database', function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'222222222222222222222222'});
      var i2 = new Item({name:'Purse',
                         description:'Description',
                         tags:'some, random, tags',
                         userId:'333333333333333333333333'});
      var i3 = new Item({name:'Shoe',
                         description:'Description',
                         tags:'some, random, tags',
                         available: true,
                         userId:'433333333333333333333333'});
      i1.insert(function(){
        var item1Id =  i1._id.toString();
        i2.insert(function(){
          i3.insert(function(){
            i2.addBid(item1Id, function(){
              i3.addBid(item1Id, function(){
                // item 1 is a bid placed on item 2 and item 3
                Item.removeBid(item1Id, function(count){
                  expect(count).to.equal(2);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
  describe('FILTERING', function(){
    var i4, i5, i6;
    beforeEach(function(done){
      var i1 = new Item({name:'Broom',
                         description:'Description',
                         tags:'clean, random, tags',
                         available: true,
                         userId:'222222222222222222222222'});
      var i2 = new Item({name:'Purse',
                         description:'Description',
                         tags:'item, random, tags',
                         available: true,
                         userId:'333333333333333333333333'});
      var i3 = new Item({name:'Shoe',
                         description:'Description',
                         tags:'clothing, random, tags',
                         available: true,
                         userId:'444444444444444444444444'});
      i4 = new Item({name:'Couch',
                         description:'Description',
                         tags:'clothing, random, den',
                         available: false,
                         userId:'222222222222222222222222'});
      i5 = new Item({name:'Table',
                         description:'Description',
                         tags:'clean, random, den',
                         available: false,
                         userId:'333333333333333333333333'});
      i6 = new Item({name:'Pen',
                         description:'Description',
                         tags:'unique, random, tags',
                         available: false,
                         userId:'333333333333333333333333'});
      i1.insert(function(){
        i2.insert(function(){
          i3.insert(function(){
            i4.bidStartDate = 300;
            i4.insert(function(){
              i5.bidStartDate = 200;
              i5.insert(function(){
                i6.bidStartDate = 100;
                i6.insert(function(){
                  done();
                });
              });
            });
          });
        });
      });
    });
    describe('.findByFilter', function(){
      it('should return set limit number of items', function(){
        var obj = {limit: 1};
        Item.findByFilter(obj, function(records){
          expect(records.length).to.equal(1);
        });
      });
      it('should return the desired page', function(){
        var obj = {limit: 2, page: 2};
        Item.findByFilter(obj, function(records){
          expect(records.length).to.equal(1);
        });
      });
      it('should return objects based on availability', function(){
        var obj = {limit: 3, page: 0, available: false};
        Item.findByFilter(obj, function(records){
          expect(records.length).to.equal(3);
          expect(records[0].available).to.equal(false);
        });
      });
      it('should sort by bidStartDate', function(){
        var obj = {limit: 3, page: 0};
        Item.findByFilter(obj, function(records){
          expect(records[0].name).to.equal('Pen');
          expect(records[2].name).to.equal('Couch');
        });
      });

      describe('.filterByTag', function(){
        it('should filter items by tag search', function(done){
          var obj = {tags: 'den'};
          Item.filterByTag(obj, function(records){
            expect(records).to.have.length(2);
            expect(records[0].name).to.equal('Couch' || 'Table');
            done();
          });
        });
      });
    });
  });
});
 ////////
