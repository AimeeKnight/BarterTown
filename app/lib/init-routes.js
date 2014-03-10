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
  app.get('/items/filter', d, items.filter);
  app.get('/items/new', d, items.new);
  app.get('/items/:id', d, items.show);
  app.post('/items', d, items.create);
  app.del('/items/:id', d, items.destroy);
  // first id == original item, second id == winning item
  app.post('/items/trade/:id/:id2', d, items.trade);
  // first id == item offered,  second id == original item
  app.post('/items/offer/:id/:id2', d, items.offer);
  app.post('/items/toggle/:id', d, items.toggle);
  console.log('Routes Loaded');
  fn();
}

