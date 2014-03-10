'use strict';

process.env.DBNAME = 'item-test';
var app = require('../../app/app');
var request = require('supertest');
var fs = require('fs');
var exec = require('child_process').exec;
//var expect = require('chai').expect;
var User, Item;
var sue, bob, i1, i2;
var cookie;
var userId, userId2, itemId, itemId2;

describe('items', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Item = require('../../app/models/item');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      sue = new User({email:'sue@aol.com', password:'abcd'});
      bob = new User({email:'bob@aol.com', password:'efgh'});
      sue.hashPassword(function(){
        bob.hashPassword(function(){
          sue.insert(function(){
            bob.insert(function(){
              userId = sue._id.toString();
              userId2 = bob._id.toString();

              i1 = new Item({name:'Broom',
                             description:'Description',
                             tags:'some, random, tags',
                             available: true,
                             userId:userId});
              i2 = new Item({name:'Sock',
                             description:'Description',
                             tags:'some, random, tags',
                             available: true,
                             userId:userId2});

              i1.insert(function(){
                itemId = i1._id.toString();
                i2.insert(function(){
                  itemId2 = i2._id.toString();
                  i1.addBid(itemId2, function(){
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('GET /items', function(){
    //route covers paging, and filtering by tag
    it('should display available items page', function(done){
      request(app)
      .get('/items')
      .expect(200, done);
    });
  });

  describe('AUTHORIZED', function(){
    beforeEach(function(done){
      request(app)
      .post('/login')
      .field('email', 'sue@aol.com')
      .field('password', 'abcd')
      .end(function(err, res){
        cookie = res.headers['set-cookie'];
        done();
      });
    });

    describe('GET /items/new', function(){
      it('should display new items page if user is logged in', function(done){
        request(app)
        .get('/items/new')
        .set('cookie', cookie)
        .expect(200, done);
      });
    });

    describe('GET /items/:id', function(){
      it('should display an individual item page if user is logged in', function(done){
        request(app)
        .get('/items/' + itemId)
        .set('cookie', cookie)
        .expect(200, done);
      });
    });

    describe('POST /items', function(){
      before(function(done){
        var testdir = __dirname + '/../../app/static/img/items/test*';
        var cmd = 'rm -rf ' + testdir;

        exec(cmd, function(){
          var origfile = __dirname + '/../fixtures/item.png';
          var copyfile = __dirname + '/../fixtures/item-copy.png';
          fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
          global.nss.db.dropDatabase(function(err, result){
            done();
          });
        });
      });

      describe('POST /items', function(){
        it('should create a new item', function(done){
          var oldname = __dirname + '/../fixtures/item-copy.png';
          request(app)
          .post('/items')
          .set('cookie', cookie)
          .field('name', 'test Broom')
          .field('description', 'It\'s a broom!')
          .field('userId', userId)
          .field('tags', 'Test, Note, Title')
          .attach('photo', oldname)
          .expect(302, done);
        });
      });
    });
  /////////
    describe('DELETE /items/:id', function(){
      it('should delete a specific item from the database', function(done){
        request(app)
        .del('/items/' + itemId)
        .set('cookie', cookie)
        .expect(302, done);
      });
    });
  });

  describe('POST /trade/:originalItemId/:acceptedBidItemId', function(){
    it('should make items unavailable and flop userIds', function(done){
      request(app)
      .post('/items/trade/' + itemId + '/' + itemId2)
      .set('cookie', cookie)
      .expect(302, done);
    });
  });

  describe('POST /offer/:id/:id2', function(){
    it('should push the offered item into the original items bid array', function(done){
      request(app)
      .post('/items/offer/' + itemId2 + '/' + itemId)
      .set('cookie', cookie)
      .expect(302, done);
    });
  });


//////////
});

