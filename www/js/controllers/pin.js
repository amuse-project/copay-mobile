'use strict'


angular.module('copay.controllers')

.controller('AbstractPinCtrl', function($window, $scope, $state, $stateParams, $ionicLoading, $ionicPopup, Identity, Session, Notifications) {

  $scope.digits = [];

  $scope.clear = function() {
    $scope.digits = [];
  };

  $scope.press = function(digit) {
    $scope.digits.push(digit);
    if ($scope.digits.length == 4) {
      return $scope.onPIN();
    }
  };

  $scope.onPIN = function() {
    throw 'This should be overridden by a child controller';
  };

  $scope.onInvalidPin = function() {
    $ionicLoading.hide();
    Notifications.toast('Invalid PIN');
    return $scope.clear();
  };

  $scope.goHome = function() {
    var wallet = Session.identity.getLastFocusedWallet();
    $state.go('profile.wallet.home', {walletId: wallet.id});
  };

})

.controller('PinCtrl', function($controller, $scope, $state, $stateParams, $ionicLoading, $ionicPopup, Identity, Session) {
  angular.extend(this, $controller('AbstractPinCtrl', {$scope: $scope}));

  $scope.logout = function() {
    $ionicPopup.confirm({
      title: 'Log out',
      template: 'Are you sure you want to logout?'
    }).then(function(res) {
      if (!res) return;
      Session.clearCredentials();
      Session.signout();
      $state.go('start.welcome');
    });
  };

  $scope.onPIN = function() {
    $ionicLoading.show({
      template: '<i class="icon ion-loading-c"></i> Opening profile...'
    });

    var credentials = Session.getCredentials($scope.digits);
    if (!credentials) return $scope.onInvalidPin();

    Identity.openProfile(credentials, function(err, identity, wallet) {
      $ionicLoading.hide();
      if (err) return $scope.onInvalidPin();

      Session.signin(identity);

      // TODO: This may be replaced by the Decoder
      if ($stateParams.data) {
        $state.go('profile.payment', $stateParams);
      } else {
        $scope.goHome();
      }
    });
  };

})

.controller('SetPinCtrl', function($controller, $scope, $state, $stateParams, Session, Notifications) {
  angular.extend(this, $controller('AbstractPinCtrl', {$scope: $scope}));

  var PIN = null;
  $scope.create = true;
  $scope.confirm = false;

  $scope.onPIN = function() {
    return $scope.confirm ? $scope.onConfirm() : $scope.setPIN($scope.digits);
  };

  $scope.onConfirm = function() {
    if (angular.equals(PIN, $scope.digits)) {
      Session.setCredentials(PIN, $stateParams);
      return $scope.goHome();
    } else {
      Notifications.toast('PINs don\'t match, please try again');
    }

    $scope.setPIN(null);
  };

  $scope.setPIN = function(pin) {
    PIN = pin;
    $scope.clear();
    $scope.confirm = !$scope.confirm;
  };

});
