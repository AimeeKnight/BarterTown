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
  var items = require('../routes/items');

  app.get('/', d, home.index);
  app.get('/auth', d, users.auth);
  app.post('/register', d, users.register);
  app.post('/login', d, users.login);
  app.post('/logout', d, users.logout);
  app.get('/users/:id', d, users.show);
  app.get('/items', d, items.index);
  app.get('/items/new', d, items.new);
  app.get('/items/:id', d, items.show);
  app.post('/items', d, items.create);
  app.del('/items/:id', d, items.destroy);
  app.post('/items/trade/:id/:id2', d, items.trade);
  console.log('Routes Loaded');
  fn();
}

