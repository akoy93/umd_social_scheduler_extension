{{! Handlebars template for login logic }}
{{! Posts user info to the div with user_div_id in the form of token|fbid|name }}
{{! Parameters: login_button_id, logout_button_id, user_div_id, loader_id, share_button_id }}
{{! note_id }}
var loginButton = document.getElementById("{{login_button_id}}");
var logoutButton = document.getElementById("{{logout_button_id}}");
{{#if insert_share_button}}
  var shareButton = document.getElementById("{{share_button_id}}");
{{/if}}
var userInfo = document.getElementById("{{user_div_id}}");
var loader = document.getElementById("{{loader_id}}");
var permissionsNote = document.getElementById("{{note_id}}");

window.fbAsyncInit = function() {
  FB.init({ appId: '316801275074193',
    status: true, 
    cookie: true,
    xfbml: true,
    oauth: true
  });

  // handles the response from facebook login status call and sets the corresponding state
  function setLoginState(response, manageLogin, manageLogout) {
    // user is already logged in and connected
    if (response.authResponse && manageLogin) {
      loader.style.display = "block";
      logoutButton.style.display = "block";
      loginButton.style.display = "none";
      permissionsNote.style.display = "none";
      {{#if insert_share_button}}
        shareButton.style.display = "block";
      {{/if}}

      handleLogin(response);

      // clears user info on logout and dispatches an event
      logoutButton.onclick = function() {
        FB.logout(function() {
          userInfo.innerHTML = "";
          handleLogin.called = false;
          var logoutEvent = document.createEvent('Event');
          logoutEvent.initEvent('logout', true, true);
          userInfo.dispatchEvent(logoutEvent);
        });
      };
    // user is not connected to app or logged out
    } else if (!response.authResponse && manageLogout) {
      loader.style.display = "none";
      logoutButton.style.display = "none";
      loginButton.style.display = "block";
      permissionsNote.style.display = "block";
      {{#if insert_share_button}}
        shareButton.style.display = "none";
      {{/if}}

      loginButton.onclick = function() {
        FB.login(function(response) {
          loader.style.display = "block";
          if (!response.authResponse) {
            //user cancelled login or did not grant authorization
            loader.style.display = "none";
            alert('Failed to connect to Facebook.');
          }
        }, {scope: 'publish_actions'});
      };
    }
  }

  // puts user info in a div for read by the content script and dispatches an event
  function handleLogin(response) {
    FB.api('/me', function(info) {
      // set the user info div
      var accessToken = response.authResponse.accessToken;
      var fbid = info.id;
      var name = info.name;
      userInfo.innerHTML = accessToken + "|" + fbid + "|" + name;
      // dispatch a login event
      var loginEvent = document.createEvent('Event');
      loginEvent.initEvent('login', true, true);
      userInfo.dispatchEvent(loginEvent);
      loader.style.display = "none";
    });
  }

  FB.getLoginStatus(function(response) { setLoginState(response, false, true); });
  FB.Event.subscribe('auth.statusChange', function(response) { setLoginState(response, true, true); });
};

// insert the fb-root div and load the Facebook Javascript SDK asynchronously
(function(d) {
  var fb_root = d.createElement("div");
  fb_root.id = "fb-root";
  d.body.appendChild(fb_root);
  var e = d.createElement('script'); e.async = true;
  e.src = d.location.protocol + '//connect.facebook.net/en_US/all.js';
  d.getElementById('fb-root').appendChild(e);
}(document));
