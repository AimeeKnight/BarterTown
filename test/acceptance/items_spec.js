'use strict';

process.env.DBNAME = 'note2-test';
var app = require('../../app/app');
var request = require('supertest');
//var expect = require('chai').expect;
var User, Note;
var sue;
var cookie;

describe('users', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Note = require('../../app/models/note');
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

  describe('GET /notes', function(){
    it('should not display notes page because user not logged in', function(done){
      request(app)
      .get('/notes')
      .expect(302, done);
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

    describe('GET /notes', function(){
      it('should display notes page because user is logged in', function(done){
        request(app)
        .get('/notes')
        .set('cookie', cookie)
        .expect(200, done);
      });
    });
  });
});

