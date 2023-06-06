/*
Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/

/* eslint-disable prefer-template, no-console */


var jwt = __webpack_require__(/*! jsonwebtoken */ "../../../node_modules/jsonwebtoken/index.js");

var loopKey = "login_util_loop_count";
var maxLoopCount = 5;

function getLoopCount(config) {
  var loopCount = localStorage.getItem("".concat(config.appUserPoolClientId).concat(loopKey));

  if (loopCount === undefined || loopCount === null) {
    console.warn("setting loopcount to string 0");
    loopCount = "0";
  }

  loopCount = Number.parseInt(loopCount);
  return loopCount;
}

function incrementLoopCount(config) {
  var loopCount = getLoopCount(config);
  localStorage.setItem("".concat(config.appUserPoolClientId).concat(loopKey), (loopCount + 1).toString());
  console.warn("loopCount is now ".concat(loopCount + 1));
}

function getAuth(config) {
  var rd1 = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?loggedin=yes';
  var rd2 = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?loggedout=yes';
  var authData = {
    ClientId: config.appUserPoolClientId,
    // Your client id here
    AppWebDomain: config.appDomainName,
    TokenScopesArray: ['email', 'openid', 'profile'],
    RedirectUriSignIn: rd1,
    RedirectUriSignOut: rd2
  };

  if (config.appUserPoolIdentityProvider && config.appUserPoolIdentityProvider.length > 0) {
    authData.IdentityProvider = config.appUserPoolIdentityProvider;
  }

  var auth = new amazon_cognito_auth_js__WEBPACK_IMPORTED_MODULE_7__["CognitoAuth"](authData);
  auth.useCodeGrantFlow();
  auth.userhandler = {
    onSuccess: function onSuccess(session) {
      console.debug('Sign in success');
      localStorage.setItem("".concat(config.appUserPoolClientId, "idtokenjwt"), session.getIdToken().getJwtToken());
      localStorage.setItem("".concat(config.appUserPoolClientId, "accesstokenjwt"), session.getAccessToken().getJwtToken());
      localStorage.setItem("".concat(config.appUserPoolClientId, "refreshtoken"), session.getRefreshToken().getToken());
      var myEvent = new CustomEvent('tokensavailable', {
        detail: 'initialLogin'
      });
      document.dispatchEvent(myEvent);
      localStorage.setItem("".concat(config.appUserPoolClientId).concat(loopKey), "0");
    },
    onFailure: function onFailure(err) {
      console.debug('Sign in failure: ' + JSON.stringify(err, null, 2));
      incrementLoopCount(config);
    }
  };
  return auth;
}

function completeLogin(config) {
  var auth = getAuth(config);
  var curUrl = window.location.href;
  var values = curUrl.split('?');
  var minurl = '/' + values[1];

  try {
    auth.parseCognitoWebResponse(curUrl);
    return true;
  } catch (reason) {
    console.debug('failed to parse response: ' + reason);
    console.debug('url was: ' + minurl);
    return false;
  }
}

function completeLogout(config) {
  localStorage.removeItem("".concat(config.appUserPoolClientId, "idtokenjwt"));
  localStorage.removeItem("".concat(config.appUserPoolClientId, "accesstokenjwt"));
  localStorage.removeItem("".concat(config.appUserPoolClientId, "refreshtoken"));
  localStorage.removeItem('cognitoid');
  console.debug('logout complete');
  return true;
}

function logout(config) {
  /* eslint-disable prefer-template, object-shorthand, prefer-arrow-callback */
  var auth = getAuth(config);
  auth.signOut();
  localStorage.setItem("".concat(config.appUserPoolClientId).concat(loopKey), "0");
}

var forceLogin = function forceLogin(config) {
  login(config);
};

function login(config) {
  /* eslint-disable prefer-template, object-shorthand, prefer-arrow-callback */
  if (getLoopCount(config) < maxLoopCount) {
    var auth = getAuth(config);
    var session = auth.getSignInUserSession();

    if (!session.isValid()) {
      auth.getSession();
    }
  } else {
    alert("max login tries exceeded");
    localStorage.setItem("".concat(config.appUserPoolClientId).concat(loopKey), "0");
  }
}

function refreshLogin(config, token, callback) {
  /* eslint-disable prefer-template, object-shorthand, prefer-arrow-callback */
  if (getLoopCount(config) < maxLoopCount) {
    var auth = getAuth(config);
    auth.userhandler = {
      onSuccess: function onSuccess(session) {
        console.debug('Sign in success');
        localStorage.setItem("".concat(config.appUserPoolClientId, "idtokenjwt"), session.getIdToken().getJwtToken());
        localStorage.setItem("".concat(config.appUserPoolClientId, "accesstokenjwt"), session.getAccessToken().getJwtToken());
        localStorage.setItem("".concat(config.appUserPoolClientId, "refreshtoken"), session.getRefreshToken().getToken());
        var myEvent = new CustomEvent('tokensavailable', {
          detail: 'refreshLogin'
        });
        document.dispatchEvent(myEvent);
        callback(session);
      },
      onFailure: function onFailure(err) {
        console.debug('Sign in failure: ' + JSON.stringify(err, null, 2));
        callback(err);
      }
    };
    auth.refreshSession(token);
  } else {
    alert("max login tries exceeded");
    localStorage.setItem(loopKey, "0");
  }
} // return true if a valid token and has expired. return false in all other cases


function isTokenExpired(token) {
  var decoded = jwt.decode(token, {
    complete: true
  });

  if (decoded) {
    var now = Date.now();
    var expiration = decoded.payload.exp * 1000;

    if (now > expiration) {
      return true;
    }
  }

  return false;
}