var SEASON_TO_TERM = { winter: "12", spring: "01", summer: "05", fall: "08" };
var TERM_REGEX = /term\:.*?(winter|spring|summer|fall).*?(\d{4})/i;
var CLASS_REGEX = /(\w{7,8})\s?\<br\>\s*(\w{4})/;
var TERM_CSS_PATH = 'html body table tbody tr td table tbody tr td font center font b';
var COURSES_CSS_PATH = 'html body table tbody tr td table tbody tr td font center center table tbody tr td font';

$(document).ready(function() {
  renderLoginTemplate('font[size] > center > center:has(table)');
  handleLoginLogoutEvents();

  var classCodes = [];
  var sectionNumbers = [];
  var term = null;

  // parses season and year from the schedule page and generates a term code
  (function() {
    var rawTerm = $(TERM_CSS_PATH).first().text();
    var result = TERM_REGEX.exec(rawTerm);
    if (result != null) {
      var season = result[1];
      var year = result[2];
      term = year + SEASON_TO_TERM[season.toLowerCase()];
    }
  })();

  // parses class codes and section numbers from the schedule page
  $(COURSES_CSS_PATH).each(function() {
    var result = CLASS_REGEX.exec($(this).html());
    // enforce uniqueness
    if (result != null && !(classCodes.indexOf(result[1]) > -1)) {
      classCodes.push(result[1]);
      sectionNumbers.push(result[2]);
    }
  });

  // construct a schedule string and post it to the server
  (function() {
    var schedule = "";
    for (var i = 0; i < classCodes.length; i++) {
      schedule += classCodes[i].toUpperCase() + "," + sectionNumbers[i].toUpperCase() + "|";
    }
    schedule = schedule.slice(0, -1);

    $("#" + USER_INFO_DIV_ID).on("session", function() {
      $.post(API_URL + "add_schedule", { term: term, schedule: schedule }, function(response) {
        if (!response.success) {
          alert("Error occurred while sending schedule data.");
        }
      }, "json");
    });
  })();


/*
  function createScheduleHTML(fbid, season, year, scheduleHTML, token) {
    if (season == "Fall")
      var term = year + '08';
    else if (season == "Spring")
      var term = year + '01';
    else if (season == "Winter")
      var term = year + '12';
    else if (season == "Summer")
      var term = year + '05';

    var dataObject = {
      id: fbid,
      term: term,
      html: scheduleHTML,
      token: token
    }

    $.ajax({
      url: "http://www.umdsocialscheduler.com/schedules/_create_html.php",
      crossDomain: true,
      type: 'POST',
      data: dataObject,
      error: function(e) {
              alert('Error occured. Unable to create schedule HTML.');
      }
    });
  }

  // creates schedule html and image on server
  function createSchedulePage(fbid, season, year, token) {
    if (season == "Fall")
      var term = year + '08';
    else if (season == "Spring")
      var term = year + '01';
    else
      return;

    var dataObject = {
      id: fbid,
      term: term,
      token: token
    }

    $.ajax({
      url: "http://www.umdsocialscheduler.com/schedules/_render_image.php",
      crossDomain: true,
      type: 'POST',
      data: dataObject,
      error: function(e) {
              alert('Error occured. Unable to render schedule image.');
      },
      // dispatches event to notify schedule has been rendered
      success: function() {
        var scheduleRenderedEvent = document.createEvent('Event');
        scheduleRenderedEvent.initEvent('scheduleRenderedEvent', true, true);
        document.getElementById('share-button').dispatchEvent(scheduleRenderedEvent);
      }
    });
  }

    // sends schedule to database
  function sendSchedule(fbid, season, year, classCodes, sectionNumbers, token) {  
    var semesterCode = year;
    var classesString = "";
    var sectionsString = "";

    if (season == 'Spring')
      semesterCode += '01';
    else if (season == 'Fall')
      semesterCode += '08';
    else
      return;


    // arrays as strings with * delimiters
    for (var i = 0; i < classCodes.length; i++) {
      classesString += '*' + classCodes[i];     
      sectionsString += '*' + sectionNumbers[i];
    }

    var dataObject = {
      semester: semesterCode,
      id: fbid,
      classes: classesString,
      sections: sectionsString,
      token: token
    }

    $.ajax({
      url: "http://www.umdsocialscheduler.com/_add_schedule.php",
      crossDomain: true,
      type: 'POST',
      data: dataObject,
      error: function(e) {
              alert('Failed to send schedule.');
      }  
    });
    
  }*/
});