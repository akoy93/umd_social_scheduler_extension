var BOOK_TEMPLATE = "amazon_book.html";
var AMAZON_BUTTON = chrome.extension.getURL('images/amazon_button.gif');
var BOOK_DIV = "div.book_sec";
var BOOK_LISTING = "div.book_details";
var PRICE_DIV = "div.book_formate1.relativePos";
var ISBN_LOCATION = "li.book_c2:last";
var ISBN_REGEX = /(\d{13})/;

$(document).ready(function() {
  $(BOOK_DIV).each(function() { // each class
    $(this).find(BOOK_LISTING).each(function() { // each book
      var listing = $(this);
      var isbnContainer = $(this).find(ISBN_LOCATION);
      if (isbnContainer.length != 0) {
        var raw = isbnContainer.html();
        var isbn = ISBN_REGEX.exec(raw)[0];
        // use api to get ASIN from ISBN-13
        $.getJSON(API_URL + "get_asin", { isbns: isbn }, function(response) {
          if (response.success) {
            var isbnsToAsins = response.data;
            var asin = isbnsToAsins[0].asin;
            // add affiliate link for each book
            if (asin != null) {
              var amazonLink = renderHandlebars(BOOK_TEMPLATE, { asin: asin, button: AMAZON_BUTTON });
              listing.find(PRICE_DIV).before(amazonLink);
            }
          }
        });
      }
    });
  });
});
