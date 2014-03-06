'use strict';

var d = require('../lib/request-debug');
var initialized = false;

module.exports = function(req, res, next){
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = require('../routes/home');
  var users = require('../routes/users');
  var notes = require('../routes/notes');

  app.get('/', d, home.index);
  app.get('/auth', d, users.auth);
  app.post('/register', d, users.register);
  app.post('/login', d, users.login);
  app.post('/logout', d, users.logout);
  app.get('/notes', d, notes.index);
  app.post('/notes', d, notes.create);
  app.get('/notes/new', d, notes.fresh);
  app.get('/notes/:id', d, notes.show);
  app.del('/notes/:id', d, notes.destroy);
  console.log('Routes Loaded');
  fn();
}

