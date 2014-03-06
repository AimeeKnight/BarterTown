/* jshint expr:true */

'use strict';

process.env.DBNAME = 'note2-test';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var User;
var sue;

describe('User', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      sue = new User({email:'sue@aol.com', password:'abcd'});
      sue.hashPassword(function(){
        sue.insert(function(){
          done();
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new User object', function(){
      var u1 = new User({email:'bob@aol.com', password:'1234'});
      expect(u1).to.be.instanceof(User);
      expect(u1.email).to.equal('bob@aol.com');
      expect(u1.password).to.equal('1234');
    });
  });

  describe('#hashPassword', function(){
    it('should hash a password with salt', function(done){
      var u1 = new User({email:'bob@aol.com', password:'1234'});
      u1.hashPassword(function(){
        expect(u1.password).to.not.equal('1234');
        done();
      });
    });
  });

  describe('#insert', function(){
    it('should insert user into mongo', function(done){
      var u1 = new User({email:'bob@aol.com', password:'1234'});
      u1.hashPassword(function(){
        u1.insert(function(){
          expect(u1._id).to.be.instanceof(Mongo.ObjectID);
          done();
        });
      });
    });
    it('should not insert duplicate user into mongo', function(done){
      var u1 = new User({email:'sue@aol.com', password:'wxyz'});
      u1.hashPassword(function(){
        u1.insert(function(){
          expect(u1._id).to.be.undefined;
          done();
        });
      });
    });
  });

  describe('findById', function(){
    it('should find user by her id', function(done){
      var id = sue._id.toString();

      User.findById(id, function(user){
        expect(user.id).to.deep.equal(sue.id);
        done();
      });
    });
  });

  describe('findByEmailAndPassword', function(){
    it('should find user by email and password', function(done){
      User.findByEmailAndPassword('sue@aol.com', 'abcd', function(user){
        expect(user.email).to.equal('sue@aol.com');
        done();
      });
    });
    it('should not find user - bad email', function(done){
      User.findByEmailAndPassword('bad@aol.com', 'abcd', function(user){
        expect(user).to.be.null;
        done();
      });
    });
    it('should not find user - bad password', function(done){
      User.findByEmailAndPassword('sue@aol.com', 'wrong', function(user){
        expect(user).to.be.null;
        done();
      });
    });
  });
});

