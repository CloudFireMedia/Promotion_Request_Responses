function setupAutomation_() {////This will need to be called elsewhere - possibly via the form, possibly trigger to run daily against the new for submissions page
  //do NOT run this directly from the library, use a proxy function ala: function function setupAutomation(){PL.setupAutomation();}
  //optFormUrls = []
  var owner = SpreadsheetApp.getActive().getOwner().getEmail();
  var user = Session.getActiveUser().getEmail();
  if( user != owner){
    Browser.msgBox('Enable Automation', "Sorry.  Automation can only be enabled by the sheet owner.\\nPlease ask "+owner+" to run this.", Browser.Buttons.OK);
    return;
  }
  
  //setup onEdit trigger
  deleteTriggerByHandlerName('onEdit_Triggered');//remove any existing triggers so we don't have conflicts
  ScriptApp.newTrigger('onEdit_Triggered').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  
  //setup onFormSubmit trigger
//  deleteTriggerByHandlerName('onFormSubmit');
//  optFormUrls = optFormUrls || [];//var optFormUrls = []//typehint
  var errs = [];
//  if( ! optFormUrls.length ){
//    //nothing was sent so get all forms from the spreadsheet
//    var sheets = SpreadsheetApp.getActive().getSheets();
//    for (var s in sheets){
//      var url = sheets[s].getFormUrl();
//      if(url) optFormUrls.push(url);
//    }
//  }
//  
//  for( var f in optFormUrls ){
//    var url = optFormUrls[f];
//    var form = FormApp.openByUrl(url);
//    if( ! form){
//      errs.push('Unable to open form at "'+url+'".\
//You may not have permission or the url may be incorrect.\\n\
//\\n\
//Form submissions will not trigger automatically for this form.'
//               );
//    }else{
//      ScriptApp.newTrigger('onFormSubmit')
//      .forForm(form)
//      .onFormSubmit()
//      .create();
//    }
//  }
  
    if(errs.length){
      Browser.msgBox('Enable Automation', 'Something went wrong.\\n\\n'+(errs.join('\\n')), Browser.Buttons.OK) 
    }else{
      Browser.msgBox('Enable Automation', 'Done!', Browser.Buttons.OK) 
    }
}

function disableAutomation_() {
  var owner = SpreadsheetApp.getActive().getOwner().getEmail();
  var user = Session.getActiveUser().getEmail();
  if( user != owner){
    Browser.msgBox('Disable Automation', "Sorry.  Automation can only be disabled by the sheet owner.\\nPlease ask "+owner+" to run this.", Browser.Buttons.OK);
    return;
  }

  deleteTriggerByHandlerName('onEdit_Triggered');
//  deleteTriggerByHandlerName('onFormSubmit');//no form linked so can't use this method 

  Browser.msgBox('Disable Automation', "Automation has been disabled.\\nForm Submissions and notifications will no longer be processed.", Browser.Buttons.OK);
}

