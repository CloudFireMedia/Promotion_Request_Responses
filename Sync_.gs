// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO

(function() {"use strict"})()

// Sync_.gs
// ========
//
// Object for managing the rota sheet

var Sync_ = (function(ns) {

  // Public Functions
  // ----------------
  
  ns.syncRowToMaster = function() {
  
    var spreadsheet = SpreadsheetApp.getActive();
    
    if (spreadsheet === null && !PRODUCTION_VERSION_) {
      spreadsheet = SpreadsheetApp.openById(TEST_SPREADSHEET_ID)
    }
    
    config.columns = Utils.getPRFColumns(spreadsheet);
    
    var activeRange = SpreadsheetApp.getActiveRange();
    
    if (activeRange === null && !PRODUCTION_VERSION_) {
      activeRange = spreadsheet.getSheetByName(config.dataSheetName).getRange('A3')
    }
    
    var sheet = activeRange.getSheet();
    var range = sheet.getRange(activeRange.getRow(), 1, 1, sheet.getLastColumn());
    
    if (sheet.getName() !== config.dataSheetName){
      spreadsheet.getSheetByName(config.dataSheetName).activate();
      SpreadsheetApp.flush();//display the correct sheet first
      throw new Error('This only works from the "' + config.dataSheetName + '" sheet.');
    }
    
    if (range.getRow() <= sheet.getFrozenRows() || range.getValues()[0][0]=='' ){
      throw new Error("Select a cell or row with an event and try again.");
    }
    
    if (activeRange.getHeight() > 1) {
      throw new Error("Can not process multiple rows with this option.\\nSelect a single cell or row and try again.");
    }
     
    // clear the update field 
    sheet.getRange(range.getRow(), config.columns.Update).setValue(null);
    
    syncToMaster(range);
    
  } // Sync_.syncRowToMaster()
  
  ns.syncAllToMaster = function() {
  
    var spreadsheet = SpreadsheetApp.getActive();
    
    if (spreadsheet === null & !PRODUCTION_VERSION_) {
      spreadsheet = SpreadsheetApp.openById(TEST_SPREADSHEET_ID)
    }
        
    config.columns = Utils.getPRFColumns(spreadsheet);
    
    var sheet = SpreadsheetApp.getActiveSheet();
    
    if (sheet.getName() !== config.dataSheetName){
      spreadsheet.getSheetByName(config.dataSheetName).activate();
      SpreadsheetApp.flush(); //display the correct sheet first
      throw new Error('This only works from the "'+config.dataSheetName+'" sheet.')
    }
    
    var values = sheet.getDataRange().getValues();
    
    for (var v in values) {
    
      if (v + 1 <= sheet.getFrozenRows()) {
        continue; //skip headers
      }
      
      var rowRange = sheet.getRange((parseInt(v) + 1), 1, 1, sheet.getLastColumn())
      var action = values[v][config.columns.update - 1];
      
      // provide visual evidence of progress
      rowRange.setBorder(true, true, true, true, false, false, '#ffdd00', SpreadsheetApp.BorderStyle.SOLID_THICK);
      SpreadsheetApp.flush();
      Utilities.sleep(300); //visual pause
      
      switch(action) {
      
        case '➕': 
          syncToMaster(rowRange); 
          break;
          
        case '❎': 
          var text = Utilities.formatString("\\| Row %s \\|", rowRange.getRow());
          removeFromMaster(text);
          break;
          
        default:
          throw new Error('Invalid action');
      }
      
      rowRange.offset(0, config.columns.update - 1, 1, 1).setValue(null); //clear the update field
      rowRange.setBorder(false, false, false, false, false, false);
      SpreadsheetApp.flush();
    }
    
  } // Sync_.syncAllToMaster()
  
  // Private Functions
  // -----------------
  
  /**
   * @param {Range} range Should be one or more full rows
   */
  
  function syncToMaster(range){
  
    var spreadsheet = SpreadsheetApp.getActive();
    
    if (spreadsheet === null & !PRODUCTION_VERSION_) {
      spreadsheet = SpreadsheetApp.openById(TEST_SPREADSHEET_ID)
    }
        
    config.columns = Utils.getPRFColumns(spreadsheet);
    
    var values = range.getValues()[0];
    
    if (values.length === 0) {
      throw new Error ('Missing data');
    }
    
    var eventDate = values[config.columns.StartDate - 1];//EVENT START DATE / TIME
    var shortDate = Utilities.formatDate(eventDate, 0, "MM.dd");
    var formatedStringDate = Utils.getFormatedDateForEvent(eventDate);
    var rowNumberToWork = Utilities.formatString("Row %s", range.getRow());
    
    var makePara = Utilities.formatString(
      //'[ EVENT TITLE | Gold Row 4 | YOUR NAME ] 03.11; WHAT IS THIS EVENT ALL ABOUT?\\n >> Sunday, March 11 at 5:00pm at EVENT LOCATION; Register by EVENT REGISTRATION; Cost is EVENT COST'
      '[ %s | %s | %s ] %s; %s\n >> %s at %s; Register by %s; Cost is %s', 
      values[config.columns.Title -1] || 'x',//Barefoot Republic
      rowNumberToWork,//Row 3
      values[config.columns.name -1] || '?',//Chad Barlow
      shortDate || 'x',//Mon Jun 18 2018 09:00:00 GMT-0400 (EDT); 
      values[config.columns.eventAbout -1] || 'x',//We are excited to announce that...
      formatedStringDate || 'x',//06.18
      values[config.columns.location -1] || 'x',//Christ Church campus
      values[config.columns.RegistrationType -1] || 'None',//Register by x
      values[config.columns.cost -1] || 'Free'//Cost is 250
    );
    
    var makeParaForSunday = Utilities.formatString(
      //'[ EVENT TITLE | Row 4 | YOUR NAME ] 03.11;'
      '[ %s | %s | %s ] %s;',
      values[config.columns.title - 1], rowNumberToWork, values[config.columns.name - 1], shortDate
    );
    
    // get event dates
    // promoStartDate is the latter of the earliest start date and the eventPromoStartDate (calcuated from the config.deadline weeks)
    var eventPromoStartDate = Utils.dateAdd(Utils.getUpcomingSunday(eventDate), 'week', -1 * config.deadline[values[config.columns.tier-1].toUpperCase()])
    var minimumPromoStartDate = Utils.dateAdd(Utils.getUpcomingSunday(new Date()), 'week', 3);//3 weeks from Sunday
    var promoStartDate = (eventPromoStartDate.getTime() < minimumPromoStartDate.getTime()) ? minimumPromoStartDate : eventPromoStartDate;
    var promoEndDate = Utils.dateAdd(Utils.getUpcomingSunday(eventDate), 'week', -1)
  
    var stringFromFind = Utils.fDate(promoStartDate, "'[' MM.dd '] Sunday Announcements'");
    var stringToFind   = Utils.fDate(promoEndDate,   "'[' MM.dd '] Sunday Announcements'");
    var location = values[config.columns.location - 1];
    var rowNumber = range.getRow();
    
    addEventToMaster(stringToFind, stringFromFind, makePara, makeParaForSunday, rowNumber);
    
  } // Sync_.syncToMaster()
  
  function addEventToMaster(stringToFind, stringFromFind, makePara, makeParaForSunday, rowNumber){
    /*
    IMPORTANT: If Master does not have pages for the event date in question, the event is skipped.
    */
    var body = Utils_.getMasterBody();
    var fromOffset, toOffset;
    
    // remove existing paragraph if found
    var searchText = Utilities.formatString("\\| Row %s \\|", rowNumber);//like: "| Row 4 |"
    removeFromMaster(searchText); //removes any paragraph with the matching row identifier (the searchtext)
    
    // Master is in reverse order thus fromOffset > toOffset (when from and to are date-centric)
    var fromOffset = Utils_.searchInMaster(stringFromFind); // last match in document order, last in date sequence
    var toOffset   = Utils_.searchInMaster(stringToFind); // first match in document order, first in date sequence
    
    if (!(fromOffset && toOffset)) {
    
      var missing = !(fromOffset && toOffset) ? 'fromOffset & toOffset' : fromOffset ? 'toOffset' : 'fromOffset';
      
      var message = Utilities.formatString(
        'Unable to add event.  Missing %s.\nfromOffset: %s - toOffset: %s', 
        missing, 
        (fromOffset || 'missing'), 
        (toOffset || 'missing'))
        
      throw new Error(message);
    }
     
    // add event to all pages between fromOffset and toOffset
    
    for (var x=toOffset; x<fromOffset+1; x++) {
    
      var elem = body.getChild(x);
      
      if (elem.asText().getText().match(/^\[ *\d{2}\.\d{2} *]/) ) { //found page start
      
        var firstPara = body.getChild(x+2);//+1 for hrule, +1 for nth Sunday
        var para = x==fromOffset ? makePara : makeParaForSunday;//use long version on last entry (which is the first match)
        
        body
          .insertParagraph((x+3), para)//+1 for hrule, +1 for nth Sunday, +1 more, erm, because (maybe for itself like a 0-based element?)
          .setAttributes(config.format.current);
          
        fromOffset++;
      }    
    }
  
  } // Sync_.addEventToMaster()
  
  function removeFromMaster(text){
    
    var body = Utils_.getMasterBody();
    var searchText = text;
    Log_.fine('searchText: ' + searchText)
    var counter = 0;
    
    var hit = body.findText(searchText);
    
    while (hit != null) {
      counter++;
      hit.getElement().getParent().removeFromParent();
      hit = body.findText(searchText, hit);//next hit
    }
    
  } // Sync_.removeFromMaster()

  return ns

})(Sync_ || {})