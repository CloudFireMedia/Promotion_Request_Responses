// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - 28th Nov 2019
/* jshint asi: true */

(function() {"use strict"})()

// Code review all files - Done
// JSHint review (see files) - Done
// System Test (Dev) - Done
// System Test (Prod) - Done

// Config.gs
// =========
//
// All the constants and configuration settings

// Configuration
// =============

var SCRIPT_NAME_ = "PromotionRequestResponses"
var SCRIPT_VERSION_ = "v1.0"

var PRODUCTION_VERSION_ = true

// Log Library
// -----------

var DEBUG_LOG_LEVEL_ = PRODUCTION_VERSION_ ? BBLog.Level.INFO : BBLog.Level.FINER
var DEBUG_LOG_DISPLAY_FUNCTION_NAMES_ = PRODUCTION_VERSION_ ? BBLog.DisplayFunctionNames.NO : BBLog.DisplayFunctionNames.YES

// Assert library
// --------------

var SEND_ERROR_EMAIL_ = PRODUCTION_VERSION_ ? true : false
var HANDLE_ERROR_ = Assert.HandleError.THROW
var ADMIN_EMAIL_ADDRESS_ = 'dev@cloudfire.media'

// Constants/Enums
// ===============

var CONFIG_ = {
  
  dataSheetName : 'Incoming_Data',
  tierDueDateSheetName : 'Lookup: Tier Due Dates',
  subtitlesList : "First Sunday of the month,Second Sunday of the month,Third Sunday of the month,Fourth Sunday of the month,Fifth Sunday of the month",//lazy lazy lazy
  files : {
    promotionCalendarSheetName : 'Communications Director Master',
  },

  columns : {/* this is now populated by getPRFColumns() only when needed */ },
  lookup : {/* this is now populated by getPRFColumns() only when needed */ },
  
  //for fuzzy logic matching
  matchThresholdPercent : 0.75,
  maxEventDateDiff : 10,
  
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
    normalText_USE_CURRENT_INSTEAD : {//this matches the current DocumentApp.ParagraphHeading.NORMAL settings
      HORIZONTAL_ALIGNMENT : DocumentApp.HorizontalAlignment.LEFT,
      HEADING              : DocumentApp.ParagraphHeading.NORMAL,
      INDENT_END           : 0,
      INDENT_START         : 0,
      INDENT_FIRST_LINE    : 0,
      LINE_SPACING         : 1.5,
      SPACING_BEFORE       : 12,
      SPACING_AFTER        : 0,
      FOREGROUND_COLOR     : '#585858',
      BACKGROUND_COLOR     : '#ffffff',
    },
  },
  
}
