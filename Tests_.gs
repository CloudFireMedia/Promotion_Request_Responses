function test() {
  var sheet = SpreadsheetApp.openById('1DEISM1rHSFAlGzw40L2fxv5qatlbZjFPYZBF4dvEz6s').getSheetByName('Incoming_Data')
  var range = sheet.getRange(155, 1, 1, 10)
//  range.setBorder(top, left, bottom, right, vertical, horizontal)
  range.setBorder(true, true, true, true, false, false, '#ffdd00', SpreadsheetApp.BorderStyle.SOLID_THICK) // YELLOW

//  var values = .getDataRange().getValues()
//  for (var v in values) {
//    var a = v
//  }
//  debugger
}
