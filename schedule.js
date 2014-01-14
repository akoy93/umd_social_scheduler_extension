// load scripts
injectScript("login", "body");
injectScript("jquery-2.0.3.min", "head");
injectScript("handlebars-v1.3.0", "head");

// waits for page to load
$(document).ready(function() {
  // inject login template
  $('font[size] > center > center:has(table)').append('<div id="login"></div>');
  $('#login').html(renderHandlebars("login", {}));
});