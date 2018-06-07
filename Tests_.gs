// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// Tests.gs
// ========
//
// Code for internal/unit testing

function test_init() {

  Log_ = BBLog.getLog({
    sheetId:              TEST_SPREADSHEET_ID,
    level:                BBLog.Level.ALL, 
    displayFunctionNames: BBLog.DisplayFunctionNames.NO,
  })
  
} // test_init()

function test_Sync_syncRowToMaster() {
  test_init()
  Sync_.syncRowToMaster()
  return
}