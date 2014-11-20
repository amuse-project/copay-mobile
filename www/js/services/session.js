'use strict'

angular.module('copay.services')

.factory('Session', function($window, crypto) {

  var Session = function() {
    this.identity = null;
    this.pin = null;
    this.currentWallet = null; // TODO: Try to replace this with $stateParams.walletId
  };

  Session.prototype.signin = function(identity) {
    this.identity = identity;
  };

  Session.prototype.signout = function(identity) {
    this.identity = null;
  };

  Session.prototype.isLogged = function() {
    return !!this.identity;
  };

  // ======= Temporal Hack ========
  // TODO: Encript credentials with PIN
  Session.prototype.hasCredentials = function() {
    return !!$window.localStorage.getItem('session:data');
  };

  Session.prototype.clearCredentials = function() {
    $window.localStorage.removeItem('session:data');
  }

  Session.prototype.setCredentials = function(pin, credentials, callback) {
    setTimeout(function() {
      var data = JSON.stringify(credentials);
      var key = crypto.kdf(pin);
      $window.localStorage.setItem('session:data', crypto.encrypt(key, data));
      callback();
    }, 500);
  };

  Session.prototype.getCredentials = function(pin, callback) {
    setTimeout(function() {
      var data = $window.localStorage.getItem('session:data');
      if (!data) callback('No data');

      var key = crypto.kdf(pin);
      data = crypto.decrypt(key, data);

      var result = data ? JSON.parse(data) : null;
      callback(!data, result);
    }, 500);
  };

  return new Session();
});
