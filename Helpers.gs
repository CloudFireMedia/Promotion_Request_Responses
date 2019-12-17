// JSHint - 11th Dec 2019
/* jshint asi: true */

function fDate_(date, format){//returns the date formatted with format, default to today if date not provided
  date = date || new Date()
  format = format || "MM/dd/yy"
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), format)
}


function getFormatedDateForEvent_(date){
  Log_.fine( '--getFormatedDateForEvent('+fDate_(date)+')' )
  var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "EEEE, MMMM d 'at' h:mma")
  //for compatability with old script output, lowercase the meridiem
  return formattedDate.replace(/[A,P]M$/, function(l){ return l.toLowerCase() })
  //or just //return formattedDate.replace('PM', 'pm').replace('AM', 'am');
}

function getUpcomingSunday_TEST_() {
  //these should all be the same date (time will be diff on the default)
  
  var date = new Date()
  date.setHours(23,0,0,0)
  Log_.fine(date)
  Log_.fine( fDate_( getUpcomingSunday_(date) ) )
  
}
function getUpcomingSunday_(date, skipTodayIfSunday) {
  //return the next Sunday, which might be today
  //skipTodayIfSunday skips this Sunday and returns next week Sunday
  Log_.fine( '--getUpcomingSunday_('+(date ? fDate_(date) : 'null')+')' )
  date = new Date(date || new Date());//clone the date so as not to change the original
  date.setHours(0,0,0,0)
  if( skipTodayIfSunday || date.getDay() >0)//if it's not a Sunday...
    date.setDate(date.getDate() -date.getDay() +7);//subtract days to get to Sunday then add a week
  Log_.fine('upcomingSunday returned: '+fDate_(date))
  return date
}

function searchInMaster_(str){//find first occurence of str
  Log_.info('--searchInMaster_('+str+')')
  str = str.replace(/\[/, '\\[').replace(/\./, '\\.')
  //really should replace all regex reserved chars but we only need find like "[ 04.22 ] Sunday Announcements"
  var body = getMasterBody_()//  var body = DocumentApp.openById(id).getBody()
  
  var hit = body.findText(str)
  
  Log_.fine('hit:' +hit)
  return hit ? body.getChildIndex( hit.getElement().getParent()) : null

}

function getMasterBody_(){
  //usage: var body = getMasterBody_();//  var body = DocumentApp.openById(id).getBody()
  try{
    var masterDoc = DocumentApp.openById(Config.get('ANNOUNCEMENTS_MASTER_SUNDAY_ID'))
  }catch(e){
    throw new Error('Unable to open Master Announcements file.  Check permissions and be sure it has been set in CONFIG_.files.masterAnnouncementsID')
  }
  return masterDoc.getBody()
}


function dates_TEST_() {
  var d1 = new Date(2018,0,10,0)
  var d2 = new Date(2018,0,11,1)
  var d = DateDiff_.inDays(d1, d2)
  Log_.fine(d)
}

var DateDiff_ = (function(ns) {

  // Get the number of whole days
  ns.inDays = function(d1, d2) {  
    checkParams(d1, d2)    
    return Math.floor((d2 - d1) / (24 * 3600 * 1000))
  }
  
  ns.inWeeks = function(d1, d2) {  
    checkParams(d1, d2)        
    return parseInt((d2 - d1)/(24 * 3600 * 1000 * 7));
  }
  
  ns.inMonths = function(d1, d2) {
  
    checkParams(d1, d2)    
    
    var d1Y = d1.getFullYear()
    var d2Y = d2.getFullYear()
    var d1M = d1.getMonth()
    var d2M = d2.getMonth()
    
    return (d2M + 12 * d2Y) - (d1M + 12 * d1Y)
  }
  
  ns.inYears = function(d1, d2) {
    checkParams(d1, d2)    
    return d2.getFullYear() - d1.getFullYear()
  }
  
  function checkParams(d1, d2) {
    if (!(d1 instanceof Date) || !(d2 instanceof Date)) {
      throw new Error('DateDiff_ - bad args. d1: ' + d1 + ', d2:' + d2)
    }
  }
  
  return ns
  
})(DateDiff_ || {})

function arrayDiff_(arr1, arr2) {
  var newArr = arr1.concat(arr2)
  function check(item){ if (arr1.indexOf(item) === -1 || arr2.indexOf(item) === -1) return item; }
  return newArr.filter(check)
}

/**
* Add time to a date in specified interval
* Negative values work as well
*
* @param {date} javascript datetime object
* @param {interval} text interval name [year|quarter|month|week|day|hour|minute|second]
* @param {units} integer units of interval to add to date
* @return {date object} 
*/
function dateAdd_(date, interval, units) {
  date = new Date(date); //don't change original date
  switch(interval.toLowerCase()) {
    case 'year'   :  date.setFullYear(date.getFullYear() + units);            break;
    case 'quarter':  date.setMonth   (date.getMonth()    + units*3);          break;
    case 'month'  :  date.setMonth   (date.getMonth()    + units);            break;
    case 'week'   :  date.setDate    (date.getDate()     + units*7);          break;
    case 'day'    :  date.setDate    (date.getDate()     + units);            break;
    case 'hour'   :  date.setTime    (date.getTime()     + units*60*60*1000); break;
    case 'minute' :  date.setTime    (date.getTime()     + units*60*1000);    break;
    case 'second' :  date.setTime    (date.getTime()     + units*1000);       break;
    default       :  date = undefined; break;
  }
  return date
}