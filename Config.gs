// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Code review all files - TODO
// JSHint review (see files) - TODO
// Unit Tests - TODO
// System Test (Dev) - TODO
// System Test (Prod) - TODO

// Config.gs
// =========
//
// All the constants and configuration settings

// Configuration
// =============

var SCRIPT_NAME = "Promotion Request Responses";
var SCRIPT_VERSION = "v0.dev_ajr";

var PRODUCTION_VERSION_ = false;

// Log Library
// -----------

var DEBUG_LOG_LEVEL_ = PRODUCTION_VERSION_ ? BBLog.Level.INFO : BBLog.Level.FINER;
var DEBUG_LOG_DISPLAY_FUNCTION_NAMES_ = PRODUCTION_VERSION_ ? BBLog.DisplayFunctionNames.NO : BBLog.DisplayFunctionNames.YES;

// Assert library
// --------------

var SEND_ERROR_EMAIL_ = PRODUCTION_VERSION_ ? true : false;
var HANDLE_ERROR_ = Assert.HandleError.THROW;
var ADMIN_EMAIL_ADDRESS_ = 'andrewr1969@gmail.com';

// Tests
// -----

var TEST_SPREADSHEET_ID = '1v01QwQXozH79JXOSNdmTTf1P4Utt_SPOsBa-2SZPIx0';

// Constants/Enums
// ===============

var config = {

  files : {
//    masterAnnouncementsID : '', // Master Sunday Announcements
    masterAnnouncementsID : '1qcVEd-Dw5KRrLxv-EyV5zWIseeUwYbwt9kcSMKI2LMo', // Test Copy of Master Sunday Announcements (andrewr)
  },

//  changeLog : {
//    logSheetName : 'ChangeLog',//defaults to 'ChangeLog'
//  },
  
  dataSheetName : 'Incoming_Data',
  
//  subtitlesList : "First Sunday of the month,Second Sunday of the month,Third Sunday of the month,Fourth Sunday of the month,Fifth Sunday of the month",//lazy lazy lazy
//  files : {
//    masterAnnouncementsID : '1vt_yq2YiswCeZ_yt7oJVAgfBs8x86sYktBiC2COErcE',
//    ///implement: masterAnnouncementsID : PropertiesService.getScriptProperties().getProperty('masterAnnouncementsID'),
//    //promotionCalendarSpreadsheetID : '1d0-hBf96ilIpAO67LR86leEq09jYP2866uWC48bJloc',///should use config.files.eventsCalendar
//    promotionCalendarSpreadsheetURL : 'https://docs.google.com/spreadsheets/d/1d0-hBf96ilIpAO67LR86leEq09jYP2866uWC48bJloc/edit',
//    ///promotionCalendarSpreadsheetURL should really come from DriveApp.getFileById(config.files.eventsCalendar).getUrl()
//    promotionCalendarSheetName : 'Communications Director Master',
//  },
//  
  deadline:{ //in days
    Gold   : 8,
    Silver : 6,
    Bronze : 3,
  },
//
  columns : {/* this is now populated when needed */ },
//  
//  changeLog : {
//    watchSheets  : [],//passed by calling script - could default to '.+' to match all sheets
//    logSheetName : 'ChangeLog',
//  },
//  
//  //for fuzzy logic matching
//  matchThresholdPercent : 0.75,
//  maxEventDateDiff : 10,
//  
  format : {

    subtitle : {
      HORIZONTAL_ALIGNMENT : DocumentApp.HorizontalAlignment.RIGHT,
      FONT_SIZE      : 9,
      FONT_FAMILY    : 'Lato',
      LINE_SPACING   : 1.5,
      SPACING_BEFORE : 10,
      SPACING_AFTER  : 10,
      ITALIC         : true,
    },

    current : {
      HORIZONTAL_ALIGNMENT : DocumentApp.HorizontalAlignment.LEFT,
      FONT_SIZE      : 9,
      FONT_FAMILY    : 'Lato',
      LINE_SPACING   : 1.5,
      SPACING_BEFORE : 15,
      SPACING_AFTER  : 15,
      ITALIC         : false,
    },
  },  
};

// Function Template
// -----------------

/**
 *
 *
 * @param {Object} 
 *
 * @return {Object}
 */
/* 
function functionTemplate() {

  Log_.functionEntryPoint();
  
  

} // functionTemplate() 
*/