// store general session information
var API_URL = "http://www.texts4terps.com/";
var LOGIN_DIV_ID = "login-template";
var LOGIN_BUTTON_ID = "login-button";
var LOGIN_BUTTON_PATH = chrome.extension.getURL('images/fb-connect-button.png');
var LOGOUT_BUTTON_ID = "logout-button";
var LOGOUT_BUTTON_PATH = chrome.extension.getURL('images/fb-logout-button.png');
var LOADER_ID = "login-loader";
var LOADER_PATH = chrome.extension.getURL('images/loader.gif');
var SHARE_BUTTON_ID = "share-button";
var SHARE_BUTTON_PATH = chrome.extension.getURL('images/facebook-share-icon.gif');
var USER_INFO_DIV_ID = "user-info";
var LOGIN_INFO_DIV_ID = "login-info";
var NOTE_ID = "permissions-note";
var FBID = null;
var NAME = null;
var ACCESS_TOKEN = null;

// template names
var LOGIN_TEMPLATE = "login.html";
var LOGIN_SCRIPT = "login.js";
var USER_INFO_TEMPLATE = "login_info.html";

// this function renders a template with handlebars js
function renderHandlebars(templateName, templateData) {
  if (!renderHandlebars.cache) { 
    renderHandlebars.cache = {};
  }

  if (!renderHandlebars.cache[templateName]) {
    var templateDir = chrome.extension.getURL('templates/');
    var templateUrl = templateDir + templateName;

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
    share_button_id: SHARE_BUTTON_ID, share_button_path: SHARE_BUTTON_PATH, note_id: NOTE_ID };

  // insert login template
  $(selector)[position]('<div id="' + LOGIN_DIV_ID + '"></div>');
  $("#" + LOGIN_DIV_ID).html(renderHandlebars(LOGIN_TEMPLATE, loginParams));

  // insert login script
  var loginScript = document.createElement("script");
  loginScript.type = "text/javascript";
  loginScript.innerHTML = renderHandlebars(LOGIN_SCRIPT, loginParams);
  document.head.appendChild(loginScript);
}

// adds event listeners for login and logout events
function handleLoginLogoutEvents() {
  // activates when user has logged out
  $("#" + USER_INFO_DIV_ID).on("logout", function() {
    FBID = null; NAME = null; ACCESS_TOKEN = null;
    $("#" + LOGIN_INFO_DIV_ID).empty();
    // clear user's session on server
    $.getJSON(API_URL + "logout");
  });

  // activates when user has logged in
  $("#" + USER_INFO_DIV_ID).on("login", function() {
    // parse user info
    var data = $("#" + USER_INFO_DIV_ID).html().split("|");
    ACCESS_TOKEN = data[0]; FBID = data[1]; NAME = data[2];
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