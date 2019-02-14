function onOpen(e) {
  DocumentApp.getUi().createAddonMenu().addItem('Go!', 'showSidebar').addToUi();
}

function onInstall(e) {
  var today = new Date();
  //saveText(today.getTime());
  onOpen(e);
}

function showLoadupDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Loadup');
  DocumentApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, 'Suggest a date');
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle(' ');
  DocumentApp.getUi().showSidebar(ui);
}

function loadData() {
  var docProperties = PropertiesService.getDocumentProperties();
  return {
    time: docProperties.getProperty("time"),
    
    notificationTime: docProperties.getProperty("notification-time"),
    notificationType: docProperties.getProperty("notification-type"),
    notificationTimeType: docProperties.getProperty("notification-time-type"),
    
    calendarOn: docProperties.getProperty("calendar-on"),
    bookmarks: getBookmarks(),
    
    darkModeOn: getDarkMode()
  };
}

function getDarkMode() {
  return PropertiesService.getUserProperties().getProperty("dark-mode-on");
}

function loadSettings() {
  var userProp = PropertiesService.getUserProperties();
  return {
    dayType: userProp.getProperty("def-day-type"),
    darkModeOn: getDarkMode(),
    time: userProp.getProperty("def-time"),
    day: userProp.getProperty("def-day")
  }
}

function saveDarkModeOn(on) {
  var userProp = PropertiesService.getUserProperties();
  userProp.setProperty("dark-mode-on", on);
}

function saveDefDay(dayType, time, day) {
  saveDefDayType(dayType);
  saveDefTime(time);
  setDefDay(day);
}

function saveDefDayType(dayType) {
  var userProp = PropertiesService.getUserProperties();
  userProp.setProperty("def-day-type", dayType);
}

function saveDefTime(time) {
  var userProp = PropertiesService.getUserProperties();
  userProp.setProperty("def-time", time);
}

function setDefDay(day) {
  var userProp = PropertiesService.getUserProperties();
  userProp.setProperty("def-day", day);
}

function setNotification(time, type, timeType) {
  var docProperties = PropertiesService.getDocumentProperties();
  docProperties.setProperty("notification-time", time);
  docProperties.setProperty("notification-type", type);
  docProperties.setProperty("notification-time-type", timeType);
}

function getDefaultDate() {
  var userProperties = PropertiesService.getDocumentProperties();
  var date = userProperties.getProperty('default-date');
  var time = userProperties.getProperty('default-time');
  //Super default (before defaults are set:) same day, no time
  return {
    date: date,
    time: time
  };
}

function saveCalendar(on) {
  var docProperties = PropertiesService.getDocumentProperties();
  docProperties.setProperty("calendar-on", on);
}

function suggestDate(date, time) {
  var hour = parseInt(time.substring(0, time.indexOf(":")));
  var min = parseInt(time.substring(time.indexOf(":")+1));
  var dateObj = new Date();
  if(date == "Today") {
    //dateObj = new Date();
  } else if(date == "Tomorrow") {
    dateObj.setDate(dateObj.getDate()+1);
  } else {
    dateObj = new Date(date);
  }
  
  try {
    dateObj.setHours(hour);
    dateObj.setMinutes(min);
  } catch (e) {Logger.log(e);}
  saveDate(dateObj.getTime());
}

function saveDate(time) {
  var docProperties = PropertiesService.getDocumentProperties();
  docProperties.setProperty("time", time);
}

function getFirstTime() {
  var docProperties = PropertiesService.getDocumentProperties();
  var firstTime = docProperties.getProperty("first-time");
  return firstTime == "true" || firstTime == undefined;
}

function setFirstTime(bool) {
  var docProperties = PropertiesService.getDocumentProperties();
  docProperties.setProperty("first-time", bool);
}

//Date regex functions
function logDates() {
  var body = DocumentApp.getActiveDocument().getBody().getText();
  var startIndex = body.search(/((\d{2}|\d{1})+(\/|-)+(\d{2}|\d{1})+(\/|-)+(\d{4}))|((\d{1}|\d{2})+ +(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4}))/);
  var dates = [];
  while(startIndex != -1) {
    body = body.substring(startIndex);
    var endIndex = body.search(/\d{4}/);
    var date = body.substring(0, endIndex+4);
    body = body.substring(endIndex+4);
    var dateFormat = checkDate(date);
    if(dateFormat.isDate && dates.indexOf(date) == -1) {
      dates.push(dateFormat.dateText);
    }
    var startIndex = body.search(/((\d{2}|\d{1})+(\/|-)+(\d{2}|\d{1})+(\/|-)+(\d{4}))|((\d{1}|\d{2})+ +(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4}))/);
  }
  return dates;
}

function getCurrentEvent() {
  return 
}

function getEvent(id) {
  return CalendarApp.getDefaultCalendar().getEventById(id);
}

function saveEventId(id) {
  var docProperties = PropertiesService.getDocumentProperties();
  Logger.log("saving: " + id);
  docProperties.setProperty("event-id", id);
}

function getEventId() {
  var docProperties = PropertiesService.getDocumentProperties();
  return docProperties.getProperty("event-id");
}

function resetEvent(startMilis, endMilis, reminderMins, method) {
  Logger.log("reset event");
  if(getEventId() != null) {
    var dateBeg = new Date(startMilis);
    var dateEnd = new Date(endMilis);
    try {
      var event = getEvent(getEventId()).setTime(dateBeg, dateEnd).removeAllReminders();
      addReminder(event, reminderMins, method);
      saveEventId(event.getId());
      return;
    } catch (e) {
      
    }
  }
  var eventObj = createEvent(startMilis, endMilis, reminderMins, method);
  Logger.log("saving");
  saveEventId(eventObj.event.getId());
}

function getBookmarks() {
  var docProperties = PropertiesService.getDocumentProperties();
  return docProperties.getProperty("bookmarks");
}

function saveBookmarks(bookmarks) {
  var docProperties = PropertiesService.getDocumentProperties();
  docProperties.setProperty("bookmarks", bookmarks);
}

function addReminder(event, reminderMins, method) {
  var reminderInt = parseInt(reminderMins);
  
  if(reminderInt != undefined && reminderInt >= 5 && method != "None"){
    switch (method) {
      case "Email":
        event.addEmailReminder(reminderInt);
        break;
      case "Popup":
        event.addPopupReminder(reminderInt);
        break;
      default:
        event.addEmailReminder(reminderInt);
        break;
    }
  } else {
    event.removeAllReminders();
  }
  return event;
}

function createEvent(startMilis, endMilis, reminderMins, method) {
  var currentDoc = DocumentApp.getActiveDocument();
  var currentTitle = currentDoc.getName();
  currentTitle = currentTitle + " due today";
  var calendar = CalendarApp.getDefaultCalendar();
  var startDate = new Date(startMilis);
  var endDate = new Date(endMilis);
  var event = CalendarApp.getDefaultCalendar().createEvent(currentTitle, startDate, endDate).setDescription("Created with the Due Plugin");
  
  addReminder(event, reminderMins, method);
  
  var splitEventId = event.getId().split('@');
  var eventURL = "https://www.google.com/calendar/event?eid=" + Utilities.base64Encode(splitEventId[0] + " " + calendar.getId());
  saveEventId(event.getId());
  return {
    link: eventURL,
    event: event
  };
}

function getUrl() {
  var event = getEvent(getEventId());
  var splitEventId = event.getId().split('@');
  var calendar = CalendarApp.getDefaultCalendar();
  var url = "https://www.google.com/calendar/event?eid=" + Utilities.base64Encode(splitEventId[0] + " " + calendar.getId());
  return url;
}

function checkDate(date) {
  var includesHyphens = (date.indexOf("-") != -1);
  var includesSlashes = (date.indexOf("/") != -1);
  var includesSpaces = (date.indexOf(" ") !=-1);
  var delimeter = "/"
  if((includesHyphens && includesSlashes && includesSpaces) || (includesHyphens && includesSpaces) || (includesHyphens&&includesSlashes) || (includesSlashes&&includesSpaces)) {
    return {isDate: false};
  } else if (includesHyphens) {
    delimeter = "-";
  } else if (includesSpaces) {
    delimeter = " ";
  }
  var copy = date.substring(0);
  var first = parseInt(copy.substring(0, copy.indexOf(delimeter)));
  copy = copy.substring(copy.indexOf(delimeter)+1);
  var second = copy.substring(0, copy.indexOf(delimeter));
  copy = copy.substring(copy.indexOf(delimeter)+1);
  var year = parseInt(copy);
  
  
  var day = -1;
  var month = -1;
  
  if(includesSpaces) {
    month = getMonth(second);
    day = first;
  } else {
    second = parseInt(second);
    if(first > 12 && second > 12) {
      return {isDate:false};
    } else if (first > 12) {
      day = first;
      month = second;
    } else if (second > 12) {
      month = first;
      day = second;
    } else {
      day = second;
      month = first;
    }
  }
  
  if(day > 31) return {isDate:false};
  
  switch(month) {
    case 2:
      if(day > 29) return {isDate:false};
      if(day == 29 && year%4 != 0) return {isDate:false};
      break;
    case 4:
    case 6:
    case 9:
    case 11:
      if(day > 30) return {isDate:false};
      break;
    default: break;
  }
  
  return {
    isDate:true,
    dateText:month+"/"+day+"/"+year
  };
}

function getMonth(second) {
  switch(second) {
    case "January":
      return 1;
    case "February":
      return 2;
    case "March":
      return 3;
    case "April":
      second = 4;
      break;
    case "May":
      return 5;
    case "June":
      return 6;
    case "July":
      return 7;
    case "August":
      return 8;
    case "September":
      return 9;
    case "October":
      return 10;
    case "November":
      return 11;
    case "December":
      return 12;
    default:
      return -1;
    }
}
