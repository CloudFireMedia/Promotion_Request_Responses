// JSHint - 11th Dec 2019
/* jshint asi: true */

function syncRowToMaster_(){
  
  Log_.functionEntryPoint()
  mapPRFColumns_();//populate CONFIG_.columns
  var activeRange = SpreadsheetApp.getActiveRange()
  var sheet = activeRange.getSheet()
  var range = sheet.getRange(activeRange.getRow(), 1, 1, sheet.getLastColumn())  
  
  // Check the correct sheet is activated, if not switch to the correct sheet and inform the user 
  if(sheet.getName() !== CONFIG_.dataSheetName){
    SpreadsheetApp.getActive().getSheetByName(CONFIG_.dataSheetName).activate()
    SpreadsheetApp.flush();//display the correct sheet first
    Browser.msgBox('Sync to Master', 'This only works from the "'+CONFIG_.dataSheetName+'" sheet.', Browser.Buttons.OK)
    return
  }
  
  // Check if a row has been selected
  if( range.getRow() <= sheet.getFrozenRows() || range.getValues()[0][0]=='' ){
    Browser.msgBox('Sync to Master', "Select a cell or row with an event and try again.", Browser.Buttons.OK)
    return
  }
  
  // Check if multiple rows have been selected
  if(activeRange.getHeight()>1) {
    Browser.msgBox('Sync to Master', "Can not process multiple rows with this option.\\nSelect a single cell or row and try again.", Browser.Buttons.OK)
    return
  }
     
  var action = range.offset(0, CONFIG_.columns.update-1, 1, 1).getValue()
              
  switch(action){
    case '➕': 
      syncToMaster_(range); 
      break
    case '❎': 
      var text = Utilities.formatString("\\| Row %s \\|", range.getRow())            
      removeFromMaster_(text)
      break
    default :
      syncToMaster_(range); 
      break
  }
  
  //clear the update field
  range.offset(0, CONFIG_.columns.update-1, 1, 1).setValue(null)

}

function syncAllToMaster_(){
  
  Log_.functionEntryPoint()
  mapPRFColumns_() //populate CONFIG_.columns
  var sheet = SpreadsheetApp.getActiveSheet()
  if(sheet.getName() !== CONFIG_.dataSheetName){
    SpreadsheetApp.getActive().getSheetByName(CONFIG_.dataSheetName).activate()
    SpreadsheetApp.flush() //display the correct sheet first
    Browser.msgBox('Sync to Master', 'This only works from the "'+CONFIG_.dataSheetName+'" sheet.', Browser.Buttons.OK)
    return
  }
  
  var values = sheet.getDataRange().getValues()
  
  for(var v in values){
    if(v+1 <= sheet.getFrozenRows()) continue;//skip headers
    var rowRange = sheet.getRange((parseInt(v)+1), 1, 1, sheet.getLastColumn())
    var action = values[v][CONFIG_.columns.update-1]
    
    //provide visual evidence of progress
    rowRange.setBorder(true, true, true, true, false, false, '#ffdd00', SpreadsheetApp.BorderStyle.SOLID_THICK)
    SpreadsheetApp.flush()
    Utilities.sleep(300) //visual pause
    
    switch(action){
      case '➕': syncToMaster_(rowRange); break
      case '❎': 
        var text = Utilities.formatString("\\| Row %s \\|", rowRange.getRow())
        removeFromMaster_(text)
        break
    }
    
    rowRange.offset(0, CONFIG_.columns.update-1, 1, 1).setValue(null) //clear the update field
    rowRange.setBorder(false, false, false, false, false, false)
    SpreadsheetApp.flush()
  }
}

function mapPRFColumns_(){
  
  Log_.functionEntryPoint()
  
  var ss = SpreadsheetApp.getActive()
  var responseSheet = ss.getSheetByName(CONFIG_.dataSheetName)
  if ( ! responseSheet) throw 'Unable to find sheet named "'+CONFIG_.dataSheetName+'".'
  
  var cols = {}
  
  cols = Utils.getPRFColumns(ss)
  
  //now assign them to existing config vars
  CONFIG_.columns.cost                  = cols.EventCost
  CONFIG_.columns.email                 = cols.Email
  CONFIG_.columns.endDate               = cols.EventEnd
  CONFIG_.columns.eventAbout            = cols.WhatIsThisEventAbout
  CONFIG_.columns.eventFor              = cols.EventFor
  CONFIG_.columns.location              = cols.EventLocation
  CONFIG_.columns.name                  = cols.Name
  CONFIG_.columns.registrationType      = cols.RegistrationType
  CONFIG_.columns.registrationLocation  = cols.RegistrationLocation 
  CONFIG_.columns.registrationDeadline  = cols.RegistrationDeadline 
  CONFIG_.columns.startDate             = cols.EventStart
  CONFIG_.columns.timestamp             = cols.Timestamp
  CONFIG_.columns.title                 = cols.EventTitle
  CONFIG_.columns.update                = cols.Update
  CONFIG_.columns.tier                  = cols.SelectedTier
  
  //now assign them to existing config vars
  CONFIG_.lookup.tierName                 = cols.tierName
  CONFIG_.lookup.dueDate                  = cols.dueDate
  CONFIG_.lookup.liveAnnouncementDate     = cols.liveAnnouncementDate

  Log_.fine(CONFIG_.columns)
  Log_.fine(CONFIG_.lookup)
}

function getTierDueDate_(tierValue){
  
  Log_.functionEntryPoint()
  
  var dueDateWeek = null
  var liveAnnouncementDate = null
  var ss = SpreadsheetApp.getActive()
  var tierDueDateSheet = ss.getSheetByName(CONFIG_.tierDueDateSheetName)
  var foundTier = false
  if ( ! tierDueDateSheet) throw 'Unable to find sheet named "'+CONFIG_.tierDueDateSheetName+'".'
  
  var tierData = tierDueDateSheet.getDataRange().getValues();

  for (var n in tierData) {
    if (tierData[n][CONFIG_.lookup.tierName-1].toUpperCase() === tierValue) {
      dueDateWeek = tierData[n][CONFIG_.lookup.dueDate-1]
      liveAnnouncementDate = tierData[n][CONFIG_.lookup.liveAnnouncementDate-1]
      Log_.fine('Tier: ' + tierValue)
      Log_.fine('Due Date: ' + dueDateWeek)
      Log_.fine('Live Announcement Date: ' + liveAnnouncementDate)
      foundTier = true
    }    
  }
  
  if (!foundTier) {
    throw new Error('Bad Tier Name')
  }
    
  return [dueDateWeek, liveAnnouncementDate]
} //getTierDueDate_

function syncToMaster_(range){//range should be one or more full rows
  
  Log_.functionEntryPoint()
  
  //populate CONFIG_.columns
  mapPRFColumns_()

  var values = range.getValues()[0]
  if(! values.length) throw 'Missing data'
  
  var eventDate = values[CONFIG_.columns.startDate -1] //EVENT START DATE / TIME
  var timeZone = Session.getScriptTimeZone()
  var shortDate = Utilities.formatDate(eventDate, timeZone, "MM.dd")
  var formatedStringDate = Utils.getFormatedDateForEvent(eventDate)
  var rowNumberToWork = Utilities.formatString("Row %s", range.getRow())
  
  var makePara = Utilities.formatString(
    //'[ EVENT TITLE | Gold Row 4 | YOUR NAME ] 03.11; WHAT IS THIS EVENT ALL ABOUT?\\n >> Sunday, March 11 at 5:00pm at EVENT LOCATION; Register by EVENT REGISTRATION; Cost is EVENT COST'
    '[ %s | %s | %s ] %s; %s\n >> %s at %s; Register by %s; Cost is %s', 
    values[CONFIG_.columns.title -1] || 'x',//Barefoot Republic
    rowNumberToWork,//Row 3
    values[CONFIG_.columns.name -1] || '?',//Chad Barlow
    shortDate || 'x',//Mon Jun 18 2018 09:00:00 GMT-0400 (EDT); 
    values[CONFIG_.columns.eventAbout -1] || 'x',//We are excited to announce that...
    formatedStringDate || 'x',//06.18
    values[CONFIG_.columns.location -1] || 'x',//Christ Church campus
    values[CONFIG_.columns.RegistrationType -1] || 'None',//Register by x
    values[CONFIG_.columns.cost -1] || 'Free'//Cost is 250
  )
  //[ Barefoot Republic  | Row 3 | Chad Barlow ] 06.18; We are excited to announce that our church is participating in Barefoot Republic kids camp this June! This is a multicultural kids summer camp that facilitates Christ-centered relationships among kids of different racial, cultural, and economic backgrounds. >> Monday, June 18 at 1:00pm at Christ Church campus; Register by None; Cost is 250
  
  var makeParaForSunday = Utilities.formatString(
    //'[ EVENT TITLE | Row 4 | YOUR NAME ] 03.11;'
    '[ %s | %s | %s ] %s;',
    values[CONFIG_.columns.title-1], rowNumberToWork, values[CONFIG_.columns.name-1], shortDate
  )
  
  //get event dates
  //promoStartDate is the earliest of the minimum start date and the eventPromoStartDate (calcuated from the Lookup: Tier Due Dates sheet)
  var [dueDateWeek, liveAnnouncementDate] = getTierDueDate_(values[CONFIG_.columns.tier-1])
  
  //get upcoming sunday to event date
  var upcomingSunday = Utils.getUpcomingSunday(eventDate)
    
  //if the closest sunday is the date of the event, take 1 of the liveAnnouncementDate
  if (upcomingSunday.getTime() === eventDate.getTime()) {
    Log_.fine('minus liveAnnouncement')
    liveAnnouncementDate -= 1
  }
  var eventPromoStartDate = Utils.dateAdd(upcomingSunday, 'week', -1 * liveAnnouncementDate)
  var minimumPromoStartDate = Utils.dateAdd(upcomingSunday, 'week', -1);//2 weeks from Sunday (3 due -1 Back up)
  var promoStartDate = eventPromoStartDate.getTime() > minimumPromoStartDate.getTime() ? minimumPromoStartDate : eventPromoStartDate
  
  //if the event start date is a sunday, use this as the end date, otherwise use the sunday previous to the event start
  var promoEndDate = upcomingSunday.getTime() === eventDate.getTime() ? eventDate : Utils.dateAdd(upcomingSunday, 'week', -1)

  var stringFromFind = Utils.fDate(promoStartDate, "'[' MM.dd '] Sunday Announcements'")
  var stringToFind   = Utils.fDate(promoEndDate,   "'[' MM.dd '] Sunday Announcements'")
  var rowNumber = range.getRow()
  
  Log_.fine('upcomingSunday: '+upcomingSunday)
  Log_.fine('liveAnnouncementDate: '+liveAnnouncementDate)
  Log_.fine('dueDateWeek: '+dueDateWeek)
  Log_.fine('eventPromoStartDate: '+eventPromoStartDate)
  Log_.fine('promoEndDate: '+promoEndDate)
  Log_.fine('stringFromFind: '+stringFromFind)
  Log_.fine('stringToFind: '+stringToFind)
    
  addEventToMaster_(stringToFind, stringFromFind, makePara, makeParaForSunday, rowNumber)
}

function removeFromMaster_TEST_(){
  var row = 2
  removeFromMaster_('\\| Row '+row+' \\|')
}
function removeFromMaster_(text){
  
  Log_.functionEntryPoint()
  
  var masterId = Config.get('ANNOUNCEMENTS_MASTER_SUNDAY_ID')
  var body = Utils.getMasterBody(masterId)
  var searchText = text
  Log_.fine('searchText: '+searchText)
  var counter = 0
  
  var hit = body.findText(searchText)
  while (hit != null) {
    counter++
    Log_.info('removed text:' + hit.getElement().getText())
    hit.getElement().removeFromParent()

    hit = body.findText(searchText, hit) //next hit
  }
}

function addEventToMaster_TEST_(){
  addEventToMaster(
    "[ 06.16 ] Sunday Announcements","[ 06.09 ] Sunday Announcements",
    "[ Barefoot Republic  | Row 3 | Chad Barlow ] 06.18; We are excited to announce that our church is participating in Barefoot Republic kids camp this June! This is a multicultural kids summer camp that facilitates Christ-centered relationships among kids of different racial, cultural, and economic backgrounds. \
>> Monday, June 18 at 1:00pm at Christ Church campus; Register by None; Cost is 250",
    "[ Barefoot Republic  | Row 3 | Chad Barlow ] 06.18;", 3)
}
function addEventToMaster_(stringToFind, stringFromFind, makePara, makeParaForSunday, rowNumber){
  Log_.info('--addEventToMaster('+stringToFind+':'+stringFromFind+')')
  /*
  IMPORTANT: If Master does not have pages for the event date in question, the event is skipped.
  */
  var masterId = Config.get('ANNOUNCEMENTS_MASTER_SUNDAY_ID')
  var body = Utils.getMasterBody(masterId)
  
  //remove existing paragraph if found
  var searchText = Utilities.formatString("\\| Row %s \\|", rowNumber) //like: "| Row 4 |"
  removeFromMaster_(searchText) //removes any paragraph with the matching row identifier (the searchtext)
  
  //Master is in reverse order thus fromOffset > toOffset (when from and to are date-centric)
  var fromOffset = Utils.searchInMaster(masterId, stringFromFind) //last match in document order, last in date sequence
  var toOffset   = Utils.searchInMaster(masterId, stringToFind) //first match in document order, first in date sequence
  
  Log_.fine('addEventToMaster fromOffset: '+fromOffset)
  Log_.fine('addEventToMaster toOffset: '+toOffset)
        
  if( ! (fromOffset && toOffset)){
    var missing = !(fromOffset && toOffset) ? 'fromOffset & toOffset' 
    : fromOffset ? 'toOffset' : 'fromOffset';
    throw new Error( Utilities.formatString('Unable to add event.  Missing %s.\nfromOffset: %s - toOffset: %s', 
                                  missing, (fromOffset || 'missing'), (toOffset || 'missing')) )
    return
  }
   
  //add event to all pages between fromOffset and toOffset
  for(var x=toOffset; x<fromOffset+1; x++){
    var elem = body.getChild(x)
    if( elem.asText().getText().match(/^\[ *\d{2}\.\d{2} *]/) ){//found page start
      var para = x==fromOffset ? makePara : makeParaForSunday;//use long version on last entry (which is the first match)
      body
      .insertParagraph((x+3), para)//+1 for hrule, +1 for nth Sunday, +1 more, erm, because (maybe for itself like a 0-based element?)
      .setAttributes(CONFIG_.format.current)
      .setAttributes({FOREGROUND_COLOR:'#FF0000'});///Red
      fromOffset++
      Log_.info('Added text "' + para + '" to Announcement GDoc')
    } 
  }
}
