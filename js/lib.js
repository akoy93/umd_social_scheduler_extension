// store general session information
var API_URL = "http://www.texts4terps.com/";
var LOGIN_DIV_ID = "login-template";
var LOGIN_BUTTON_ID = "login-button";
var LOGIN_BUTTON_PATH = chrome.extension.getURL('images/fb-connect-button.png');
var LOGOUT_BUTTON_ID = "logout-button";
var LOGOUT_BUTTON_PATH = chrome.extension.getURL('images/fb-logout-button.png');
var LOADER_ID = "login-loader";
var LOADER_PATH = chrome.extension.getURL('images/loader.gif');
var USER_INFO_DIV_ID = "user-info";
var FBID = null;
var NAME = null;
var ACCESS_TOKEN = null;
var IS_LOGGED_IN = false;

// this function renders a template with handlebars js
function renderHandlebars(templateName, templateData) {
  if (!renderHandlebars.cache) { 
    renderHandlebars.cache = {};
  }

  if (!renderHandlebars.cache[templateName]) {
    var templateDir = chrome.extension.getURL('templates/');
    var templateUrl = templateDir + templateName + '.html';

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
function renderLoginTemplate(selector) {
  var loginParams = { login_button_id: LOGIN_BUTTON_ID, logout_button_id: LOGOUT_BUTTON_ID, 
    user_div_id: USER_INFO_DIV_ID, loader_id: LOADER_ID, login_button_path: LOGIN_BUTTON_PATH,
    logout_button_path: LOGOUT_BUTTON_PATH, loader_path: LOADER_PATH };

  $(selector).append('<div id="' + LOGIN_DIV_ID + '"></div>');
  $("#" + LOGIN_DIV_ID).html(renderHandlebars("login", loginParams));
  $("body").append(renderHandlebars("login_js", loginParams));
}
