/* jshint expr:true */

'use strict';

process.env.DBNAME = 'note2-test';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var Note, User;
var sue, bob;

describe('Note', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Note = require('../../app/models/note');
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      bob = new User({email:'bob@aol.com', password:'1234'});
      sue = new User({email:'sue@aol.com', password:'abcd'});
      sue.hashPassword(function(){
        sue.insert(function(){
          bob.hashPassword(function(){
            bob.insert(function(){
              done();
            });
          });
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new Note object', function(){
      var n1 = new Note({title:'Node', body:'node info', dateCreated:'2014-03-24', tags:'hw, prog, code', userId:sue._id.toString()});
      expect(n1).to.be.instanceof(Note);
      expect(n1.title).to.equal('Node');
      expect(n1.body).to.equal('node info');
      expect(n1.dateCreated).to.be.instanceof(Date);
      expect(n1.tags).to.have.length(3);
      expect(n1.userId).to.be.instanceof(Mongo.ObjectID);
    });
    it('should create a new Note with empty data object', function(){
      var n1 = new Note({title:'JS', body:'js info', dateCreated:'', tags:'', userId:sue._id.toString()});
      var d1 = new Date();
      expect(n1).to.be.instanceof(Note);
      expect(n1.title).to.equal('JS');
      expect(n1.body).to.equal('js info');
      expect(n1.dateCreated).to.be.instanceof(Date);
      expect(n1.dateCreated.toDateString()).to.equal(d1.toDateString());
      expect(n1.tags).to.have.length(0);
      expect(n1.userId).to.be.instanceof(Mongo.ObjectID);
    });
  });

  describe('#insert', function(){
    it('should insert a new Note object', function(done){
      var n1 = new Note({title:'Node', body:'node info', dateCreated:'2014-03-24', tags:'hw, prog, code', userId:sue._id.toString()});
      n1.insert(function(){
        expect(n1._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

  describe('findByUserId', function(){
    beforeEach(function(done){
      var n1 = new Note({title:'Node', body:'node info', dateCreated:'2014-03-24', tags:'hw, prog, code', userId:bob._id.toString()});
      var n2 = new Note({title:'JS', body:'js info', dateCreated:'2012-07-18', tags:'code, js, hacking', userId:sue._id.toString()});
      n1.insert(function(){
        n2.insert(function(){
          done();
        });
      });
    });

    it('should find a user by her id', function(done){
      Note.findByUserId(sue._id.toString(), function(notes){
        expect(notes).to.have.length(1);
        expect(notes[0].title).to.equal('JS');
        done();
      });
    });
  });
});

