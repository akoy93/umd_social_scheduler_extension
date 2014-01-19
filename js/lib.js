// store general session information
var API_URL = "http://www.texts4terps.com/"; // domain name for api
var LOGIN_DIV_ID = "login-template"; // id of div containing the login template
var LOGIN_BUTTON_ID = "login-button";
var LOGIN_BUTTON_PATH = chrome.extension.getURL('images/fb-connect-button.png');
var LOGOUT_BUTTON_ID = "logout-button";
var LOGOUT_BUTTON_PATH = chrome.extension.getURL('images/fb-logout-button.png');
var LOADER_ID = "login-loader";
var LOADER_PATH = chrome.extension.getURL('images/loading.gif');
var SHARE_BUTTON_ID = "share-button";
var SHARE_BUTTON_PATH = chrome.extension.getURL('images/facebook-share-icon.gif');
var SCHEDULE_ICON_PATH = chrome.extension.getURL('images/schedule-icon.png');
var USER_INFO_DIV_ID = "user-info"; // id of hidden div containing user information
var LOGIN_INFO_DIV_ID = "login-info"; // id of div displaying user login info
var CHECKBOX_ID = "share-permission";
var NOTE_ID = "permissions-note"; // id of element containing permissions note
var TEMPLATES_DIR = chrome.extension.getURL('templates/');
var FBID = null;
var NAME = null;
var ACCESS_TOKEN = null;

// template names
var LOGIN_TEMPLATE = "login.html";
var LOGIN_SCRIPT = "login.js";
var SESSION_SCRIPT = "session.js";
var USER_INFO_TEMPLATE = "login_info.html";
var FRIENDS_TABS_TEMPLATE = "friends_tabs.html";
var FRIENDS_TABS_ID = "friends-tabs";
var SCHEDULE_FRIENDS_TEMPLATE = "schedule_tabs.html";
var SKELETON_ID = "schedule-friends-skeleton";
var SCHEDULE_FRIENDS_ID = "schedule-friends-tabs";
var FRIENDS_LIST_TEMPLATE = "friends_list.html";
var FRIENDS_OF_FRIENDS_LIST_TEMPLATE = "friends_of_friends_list.html";

// Handlebars helper for generating section string to append to output
Handlebars.registerHelper('appendSec', function(showSection, section) {
  return showSection ? ", Sec. " + section : "";
});

// register friends partial
(function() { 
  $.ajax({
      url: TEMPLATES_DIR + FRIENDS_TABS_TEMPLATE,
      method: 'GET',
      async: false,
      success: function(data) {
        Handlebars.registerPartial('friends_tabs', data);
      }
  });
})();

// this function pings the server to determine if it is running
function ping() {
  try {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", API_URL + "alive", false);
    xmlHttp.send();
    return JSON.parse(xmlHttp.responseText).success
  } catch(err) {
    return false;
  }
}

// this function renders a template with handlebars js
function renderHandlebars(templateName, templateData) {
  if (!renderHandlebars.cache) { 
    renderHandlebars.cache = {};
  }

  if (!renderHandlebars.cache[templateName]) {
    var templateUrl = TEMPLATES_DIR + templateName;

    var templateString;
    $.ajax({
        url: templateUrl,
        method: 'GET',
        async: false,
        success: function(data) {
            templateString = data;
        }
    });

    renderHandlebars.cache[templateName] = Handlebars.compile(templateString);
  }

  return renderHandlebars.cache[templateName](templateData);
}

// this function appends a javascript file to the end of a node in the dom
function injectScript(scriptName, node) {
  var toInject = document.createElement("script");
  toInject.type = "text/javascript";
  toInject.src = chrome.extension.getURL('js/') + scriptName + ".js";
  document[node].appendChild(toInject);
}

// accepts a jQuery selector to specify where to insert the login template
// inserts the script with login logic at the end of the body
function renderLoginTemplate(selector, position, insertShareButton) {
  var loginParams = { login_button_id: LOGIN_BUTTON_ID, logout_button_id: LOGOUT_BUTTON_ID, 
    user_div_id: USER_INFO_DIV_ID, loader_id: LOADER_ID, login_button_path: LOGIN_BUTTON_PATH,
    logout_button_path: LOGOUT_BUTTON_PATH, loader_path: LOADER_PATH, 
    login_info_div_id: LOGIN_INFO_DIV_ID, insert_share_button: insertShareButton,
    share_button_id: SHARE_BUTTON_ID, share_button_path: SHARE_BUTTON_PATH, note_id: NOTE_ID,
    checkbox_id: CHECKBOX_ID };

  // insert login template
  $(selector)[position]('<div id="' + LOGIN_DIV_ID + '"></div>');
  $("#" + LOGIN_DIV_ID).html(renderHandlebars(LOGIN_TEMPLATE, loginParams));

  // insert login script
  var loginScript = document.createElement("script");
  loginScript.type = "text/javascript";
  loginScript.innerHTML = renderHandlebars(LOGIN_SCRIPT, loginParams);
  document.head.appendChild(loginScript);
}

// injects a script into the current page that either creates or ends a session on
// the api server. this is necessary if we want to allow users to make api requests
// from within the page (e.g. opening a friend's schedule image)
function manageSessionInPage(newSession) {
  var params = { access_token: ACCESS_TOKEN, api_url: API_URL, new_session: newSession };
  var sessionScript = document.createElement("script");
  sessionScript.type = "text/javascript";
  sessionScript.innerHTML = renderHandlebars(SESSION_SCRIPT, params);
  document.head.appendChild(sessionScript);
}

// adds event listeners for login and logout events
function handleLoginLogoutEvents() {
  // activates when user has logged out
  $("#" + USER_INFO_DIV_ID).on("logout", function() {
    manageSessionInPage(false);
    FBID = null; NAME = null; ACCESS_TOKEN = null;
    $("#" + LOGIN_INFO_DIV_IDTEMPLATE);
    $("#" + SKELETON_ID).remove();
    // clear user's session on server
    $.getJSON(API_URL + "logout");
  });

  // activates when user has logged in
  $("#" + USER_INFO_DIV_ID).on("login", function() {
    // parse user info
    var data = $("#" + USER_INFO_DIV_ID).html().split("|");
    ACCESS_TOKEN = data[0]; FBID = data[1]; NAME = data[2];
    manageSessionInPage(true);
    // render login info
    var params = { name: NAME, fbid: FBID };
    $("#" + LOGIN_INFO_DIV_ID).html(renderHandlebars(USER_INFO_TEMPLATE, params));
    // create session on server for user
    $.getJSON(API_URL + "access", { access_token: ACCESS_TOKEN }, function(response) {
      if (response.success) {
        var sessionEvent = $.Event("session");
        $("#" + USER_INFO_DIV_ID).trigger(sessionEvent);
      } else {
        alert("Failed Facebook authentication. Try logging out and logging in again.");
      }
    });
  });
}

// invokes the get friends request and sends the response to the given callback
function getFriends(callback, term, course, section) {
  $.getJSON(API_URL + "friends", { term: term, course: course, section: section }, callback);
}

// invokes the get friends of friends request and sends the respone to the given callback
function getFriendsOfFriends(callback, term, course, section) {
  $.getJSON(API_URL + "friendsoffriends", { term: term, course: course, section: section }, 
    callback);
}

// creates a countdown latch that's used for waiting for asynchronous calls
function countdownLatch(target, callback) {
  this.count = 0;
  return function() {
    this.count += 1;
    if (this.count >= target) {
      callback();
    }
  };
}