var BOOK_TEMPLATE = "amazon_book.html";
var PRICE_DIV = "div.bookformate1.relativePos";
var BOOK_DIV = "div.book_sec";
var ISBN_LOCATION = "li.book_c2";
var ISBN_REGEX = /(\d{13})/;

$(document).ready(function() {
  $(BOOK_DIV).each(function() {
    $(this).find(ISBN_LOCATION)
  });
});
