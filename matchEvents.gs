
function updateEventsPromotionCalendarMatchingEvents_TEST_(){ updateEventsPromotionCalendarMatchingEvents_(true); }
function updateEventsPromotionCalendarMatchingEvents_(e) {
  getPRFColumns_();//populate CONFIG_.columns
  
  //typehint//var e = {};e.namedValues = {};e.range = SpreadsheetApp.getActiveRange();e.triggerUid = '';e.values = [];e.authMode = ScriptApp.AuthMode.CUSTOM_FUNCTION;
  var isTestMode = e===true;
  var isRunFromTrigger = e.triggerUid ? true : false;
  //get response sheet
  var responseSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.dataSheetName);
  if ( ! responseSheet) throw 'Unable to find sheet named "'+config.dataSheetName+'".';
  var responseSheetValues = responseSheet.getDataRange().getValues();
  
  //get CCN Events Promotion Calendar spreadsheet - IT'S S A SHEET, NOT A CALENDAR
  //var calendarSS = SpreadsheetApp.openByUrl(config.files.promotionCalendarSpreadsheetURL);//leftover from original code
  var calendarSS = SpreadsheetApp.openById(Config.get('PROMOTION_DEADLINES_CALENDAR_ID'))
  if ( ! calendarSS) throw 'Unable to find CCN Events Promotion Calendar spreadsheet.  Expected to find it at "'+calendarSS+'"';
  var calendarSheet = calendarSS.getSheetByName(config.files.promotionCalendarSheetName);///this could be made a config setting
  if ( ! calendarSheet) throw 'Unable to find sheet named "'+CONFIG_.files.promotionCalendarSheetName+'" on '+(calendarSS.getName())+' spreadsheet';
  var calendarValues = calendarSheet.getDataRange().getValues();
  
  var errors = [];
  var warnings = [];
  var recordsFound = [];
  
  for (var i=1; i<responseSheetValues.length; i++){//i==1 to skip header row
    //check for "errors" first
    var eventDate = responseSheetValues[i][config.columns.startDate-1];
    if ( ! eventDate){
      errors.push('No event date found, line ' + (i+1) + ' of '+config.dataSheetName+' sheet.  Skipping this row.');
      continue;
    }
    if ( ! (eventDate instanceof Date)){
      errors.push('Date ' + eventDate + ' on row ' + (i+1) + ' of '+config.dataSheetName+' sheet is not a valid date.  Skipping this row.');
      continue;
    }
    
    var eventTitle = responseSheetValues[i][config.columns.title-1].trim();
    if ( ! eventTitle){
      warnings.push('No event title found, line ' + (i+1) + ' of '+config.dataSheetName+' sheet.  Skipping this row.');
      continue;
    }
    var eventTitleWords = eventTitle
    .trim()//remove leading and trailing whitespace
    .replace(/[^a-zA-Z\d\s]/g, '')//remove non-alphanumeric characters except whitespace - note: \W allows underscores so don't use it here, not that it's all that likely but still
    .toLowerCase()//for simpler comparison
    .split(/\s+/);//split to array on whitespace (not just space in case there are multiple spaces or tabs or newlines)
    
    //find matching event on calendar sheet
    for (var j=3; j<calendarValues.length; j++){//j=3 skips header rows 0-2 - they aren't frozen and we can't count on them staying set since humans are involved so we just skip three
      //if (calendarValues[j][6] == 'Yes') continue; //ignore if column G has already been labeled YES -- This was here from before. Saving it in case it's needed later. 2018-11-28 --Bob
      
      //check for "errors" first
      var calendarEventDate = calendarValues[j][3];//column 4 is SHORT START DATE
      if ( ! calendarEventDate){
        errors.push('No event date found, line ' + (j+1) + ' of '+config.dataSheetName+' sheet.  Skipping this row.');
        continue;
      }
      if (!(calendarEventDate instanceof Date)){
        errors.push('Date ' + calendarEventDate + ' on row ' + (j+1) + ' of '+config.dataSheetName+' sheet is not a valid date.  Skipping this row.');
        continue;
      }
      
      var calendarEventTitle = calendarValues[j][4].trim();//column 5 is EVENT TITLE
      if ( ! calendarEventTitle){
        warnings.push('No event title found, line ' + (j+1) + ' of '+config.dataSheetName+' sheet.  Skipping this row.');
        continue;
      }
      
      var calendarEventTitleWords = calendarEventTitle
      .trim()//remove leading and trailing whitespace
      .replace(/[^a-zA-Z\d\s]/g, '')//remove non-alphanumeric characters except whitespace - note: \W allows underscores so don't use it here, not that it's all that likely but still
      .toLowerCase()//for simpler comparison
      .split(/\s+/);//split to array on whitespace (not just space in case there are multiple spaces or tabs or newlines)      
      
      //compare eventTitle and calendarEventTitle if dates are within the allowed range
      var dayDiff = DateDiff_.inDays(calendarEventDate, eventDate);
      if (dayDiff <= config.maxEventDateDiff){
        //compare the longer list to the shorter list
        var shorterList = eventTitleWords.length <= calendarEventTitleWords.length ? eventTitleWords : calendarEventTitleWords;
        var longerList  = eventTitleWords.length <= calendarEventTitleWords.length ? calendarEventTitleWords : eventTitleWords;
        var matches = 0;
        for(var k=0; k<shorterList.length; k++)
          if(longerList.indexOf( shorterList[k] ) > -1)
            matches++;
        
        //        just messin with other ideas
        //        if(matches < 2) continue
        //        var wordsNotInShorterList = shorterList.filter(function(x) { return longerList.indexOf(x) < 0 })
        //        var wordsNotInLongerList = longerList.filter(function(x) { return shorterList.indexOf(x) < 0 })
        //        var diff = arrayDiff(shorterList, longerList);
        //        log('shorterList: '+shorterList);
        //        log('longerList: '+longerList);
        //        log('matches: '+matches);
        //        log('wordsNotInShorterList: '+wordsNotInShorterList);
        //        log('wordsNotInLongerList: '+wordsNotInLongerList);
        //        log('diff: '+diff);
        //        return
        
        var matchPercent = matches / shorterList.length;
        if (matchPercent > config.matchThresholdPercent){
          recordsFound.push([
            'Title on this spreadsheet: ' + eventTitle,
            'Title on CCN Events Promotion Calendar: ' + calendarEventTitle,
            'Percent Match: ' + (matchPercent*100) + '% (' + matches + ' out of ' + shorterList.length + ' possible words)',
            'Row on this spreadsheet: ' + (i+1),
            'Row on CCN Events Promotion Calendar: ' + (j+1),
            'Date on this spreadsheet: ' + eventDate,
            'Date on CCN Events Promotion Calendar: ' + calendarEventDate,
            'Date difference (# days): ' + dayDiff
          ]);
          
          if ( ! isTestMode)
            calendarSheet.getRange(j+1,7).setValue('Yes');
          
        }//end matchPercent
      }//end dayDiff
    }//next calendar value
  }//next response sheet value
  
  if( ! isRunFromTrigger){ //build response html only if run manually
    //if 0, No Records; if 1, 1 Record; else n Records - just to be gramatically more preciserer
    var html = '<h1>'+(recordsFound.length==0 ? 'No' : recordsFound.length)+' Matching Record'+(recordsFound.length==1 ? '' : 's')+'</h1>';
    
    if(isTestMode) html += '<h3 style="color:red">TEST MODE - NO CHANGES MADE</h3>'
    
    for (var r in recordsFound){
      for (var rr in recordsFound[i])
        html += recordsFound[r][rr] + '<br>';
      html += '<br>';
    }
    
    if(warnings.length){
      html += '<h2>Warnings</h2><br>';
      for (var w in warnings)
        html += warnings[w] + '<br>';
    }
    
    if(errors.length){
      html += '<h2>Errors</h2><br>';
      for (var err in errors)
        html += errors[err] + '<br>';
    }
  }
  //show response
  var modal = HtmlService.createHtmlOutput(html).setWidth(800).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(modal, 'Results');
}

function showInstructions_MatchEvent_(sheet){//options = {} with template var names
  //sheetName = 
  //  Gold : "Gold Raw Data 10_27 copy"
  //  Silver : "Silver Raw Data 10_27 copy"
  //  Bronze : "Bronze Raw Data 10_27 copy"
  Logger.log(sheet)
  var sheetName = sheet ? sheet.getName() : null;
  
  /// ok, soi this was outdated even befire I got the project.  Will need to e reviewed after all coding is complete
  var template = "<h1>Instructions</h1> \
<h2>Update Events Promotion Calendar scripts</h2> \
<h3>Assumptions:</h3> \
<ul> \
  <li>This script must have a sheet named \"%s\"</li> \
  <li>The CCN Events Promotion Calendar spreadsheet must be located at <a target='_blank' href='%s'>%s</a></li> \
  <li>The CCN Events Promotion Calendar spreadsheet must have a sheet named \"Communications Director Master\"</li> \
  <li>Data on the \"%s\" sheet begins in row 2</li> \
  <li>Data on the \"Communications Director Master\" sheet begins in row 4</li> \
  <li>On the \"%s\" sheet, the event title is located in column E, and the short start date is located in column F.  The short start date can be in the format M.DD or MM.DD</li> \
  <li>On the \"Communications Director Master\" sheet, the event title is located in column E, the short start date is located in column D, and the promo req. is located in column G.  The short start date can be in the format M.DD or MM.DD</li> \
</ul> \
<h3>Notes:</h3> \
<ul> \
  <li>If matching events are found on the two sheets, column G of \"Communications Director Master\" will be updated to \"Yes\"</li> \
  <ul> \
    <li>Matching events are defined as two events with 75% matching words in the event title, located within +- 10 days of each other</li> \
    <li>Capitalization and non-alphanumeric characters are ignored in order to make the search a little more liberal</li> \
    <li>To change the date or percent match thresholds, update the first two lines of the code accordingly in the \"updateEventsPromotionCalendarMatchingEvents_\" script.</li> \
  </ul> \
  <li>In Test mode, you'll only see a log of matching events, but no changes will be made to the spreadsheet.</li> \
</ul> \
<h3>Running the script each time the spreadsheet is edited or a form is submitted:</h3> \
<ul> \
  <li>To set up the script to run each time the spreadsheet is edited, in Script Editor, go to Edit -> Current Project's Triggers.  Click \"Add a new trigger\" and select \"updateEventsPromotionCalendarMatchingEvents_onEdit\" from the drop-down menu.  Then, select \"From Spreadsheet\" and \"On Edit\".</li> \
  <li>To set up the script to run each time a Google Form response is submitted, in Script Editor, go to Edit -> Current Project's Triggers.  Click \"Add a new trigger\" and select \"updateEventsPromotionCalendarMatchingEvents_onFormSubmit\" from the drop-down menu.  Then, select \"From Spreadsheet\" and \"On Form Submit\".</li> \
  <li>If an \"On Edit\" trigger is installed, script will be run each time the \"%s\" sheet is edited in columns E or F only.</li> \
  <li>The script will run from your account regardless of who edits the spreadsheet or submits a form response.</li> \
</ul> \
";
  if(sheetName){
    var promoResposes = SpreadSheetApp.OpenById(Config.get('PROMOTION_FORM_RESPONSES_GSHEET_ID'))
    var promotionCalendarSpreadsheetURL = getUrl(promoResposes)
    https://docs.google.com/spreadsheets/d/1eE_EFLa8DYyJzJ7_zbgjVK8K1W2qAPoRZqcS4d9Urec
    //var html = Utilities.formatString(template, sheetName, config.files.promotionCalendarSpreadsheetURL, config.files.promotionCalendarSpreadsheetURL, sheetName, sheetName, sheetName);
    var html = Utilities.formatString(template, sheetName, promotionCalendarSpreadsheetURL, promotionCalendarSpreadsheetURL, sheetName, sheetName, sheetName);
  }else{
    var html = 'Sorry!  I seem to have misplaced the instructions...';
    throw new Error('Invalid sheet supplied for showInstructions_MatchEvent')
  }

  var modal = HtmlService.createHtmlOutput(html).setWidth(800).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(modal, "Instructions");
}

