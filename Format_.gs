/*  
 * NOTE - 2029.01.21
 *
 * This function: 
 * - hides rows before today (does not assume sheet is chronologically sorted) 
 * - colors every second non-hidden row
 *
 * Verbose variable names are used to help me learn javascript data types. See https://www.w3schools.com/js/js_datatypes.asp
 *
 * --cdb
 */

function formatIncomingDataSheet_() {
  var ss_Object = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_Object = ss_Object.getSheetByName("Incoming_Data");
  var firstRowToCheck_Number = 3; //skip header row and top helper row
  var firstIndexToCheck_Number = 0; //Index starts at zero
  var diffrRowNumAndindexNum_Number = firstRowToCheck_Number - firstIndexToCheck_Number; // = 3 = the differential between index number and row number in this dataset
  var lastRowToCheck_Number = sheet_Object.getLastRow()-1; //skip bottom helper row
  var allRowsDates_2DArray = sheet_Object.getRange("E" + firstRowToCheck_Number + ":E" + lastRowToCheck_Number).getValues(); 
  var numCols_Number = sheet_Object.getLastColumn();
  var numRows_Number = sheet_Object.getLastRow()-firstRowToCheck_Number;
  var allRows_1DArray = [];
  var hiddenRows_1DArray = [];
  var nonHiddenRows_1DArray = [];
  sheet_Object.getRange(firstRowToCheck_Number,1,numRows_Number,numCols_Number).setBackground("#FFFFFF");
  //  Logger.log("allRowsDates_2DArray: " + allRowsDates_2DArray);
  var todaysDate_Date = new Date();
  todaysDate_Date.setHours(0, 0, 0, 0);
  for (var rowToCheckIndex_Number = 0; rowToCheckIndex_Number < allRowsDates_2DArray.length; rowToCheckIndex_Number++) { 
    var checkedRowDate_Array = allRowsDates_2DArray[rowToCheckIndex_Number];
    allRows_1DArray.push(rowToCheckIndex_Number+3);
    if (checkedRowDate_Array != "") {
      var checkedRowDate_Date = new Date(checkedRowDate_Array);
      //      Logger.log("checkedRowDate_Date: " + checkedRowDate_Date);
      if (checkedRowDate_Date < todaysDate_Date) {
        sheet_Object.hideRows(rowToCheckIndex_Number + diffrRowNumAndindexNum_Number);
        //        Logger.log("Hide rows:" + (rowToCheckIndex_Number + diffrRowNumAndindexNum_Number)); //Reconcile index number and row number by adding the differential
        hiddenRows_1DArray.push(rowToCheckIndex_Number + diffrRowNumAndindexNum_Number); 
      }
      else {
        nonHiddenRows_1DArray.push(rowToCheckIndex_Number + diffrRowNumAndindexNum_Number); 
        
      }
    }
  }
  
  nonHiddenRows_1DArray = nonHiddenRows_1DArray.filter(function(_, i) { //remove every second element from array
    return (i + 1) % 2;
  }) 
  var colorThese_1DArray = nonHiddenRows_1DArray;
  var colorThese_2DArray = [];
  while(colorThese_1DArray.length) colorThese_2DArray.push(colorThese_1DArray.splice(0,1)); //transform 1d array → 2d array
  for (var index = 0; index < colorThese_2DArray.length; index++) { 
    var rowToColor_1DArray = colorThese_2DArray[index]; 
    sheet_Object.getRange(rowToColor_1DArray,1,1,sheet_Object.getLastColumn()).setBackground("#f7f7f7");
  } 
  
} // formatIncomingDataSheet_()
