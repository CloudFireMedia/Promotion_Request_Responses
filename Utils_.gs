// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Utils_.gs
// =========
//
// Object for managing the rota sheet

var Utils_ = (function(ns) {

  ns.getMasterBody = function(){
  
    try {
    
      var masterDoc = DocumentApp.openById(config.files.masterAnnouncementsID);
      
    } catch(e) {
    
      throw new Error(
        'Unable to open Master Announcements file. Check permissions and be sure ' + 
          'it has been set in config.responseForm.files.masterAnnouncementsID')
    }
    
    return masterDoc.getBody();
    
  } // Utils_.getMasterBody()
  
  ns.searchInMaster = function (str){ //find first occurence of str
  
    str = str.replace(/\[/, '\\[').replace(/\./, '\\.');
    
    //really should replace all regex reserved chars but we only need find like "[ 04.22 ] Sunday Announcements"
    var body = getMasterBody();//  var body = DocumentApp.openById(id).getBody()
    var fromOffset, toOffset;
    
    var hit = body.findText(str);
    
    return hit ? body.getChildIndex( hit.getElement().getParent()) : null;
    
  } // Utils_.searchInMaster()

  ns.removeMultipleLineBreaks = function(element) {
  
    if (!element) {
      element = DocumentApp.openById('0BwqqMAWnXFBhMiJjM6FZakw9b1k').getBody(); // set document id of merged doc
    }
    
    var parent = element.getParent();
    // Remove empty paragraphs
    if (element.getType() == DocumentApp.ElementType.PARAGRAPH 
        && element.asParagraph().getText().replace(/\s/g, '') == '') {
      if (!(parent.getType() == DocumentApp.ElementType.BODY_SECTION 
            && parent.getChildIndex(element) == parent.getNumChildren() - 1)) {
        element.removeFromParent();
      }
      // Remove duplicate newlines in text
    } else if (element.getType() == DocumentApp.ElementType.TEXT) {
      var text = element.asText();
      var content = text.getText();
      var matches;
      // Remove duplicate carriage returns within text.
      if (matches = content.match(/\r\s*\r/g)) {
        for (var i = matches.length - 1; i >= 0; i--) {
          var match = matches[i];
          var startIndex = content.lastIndexOf(match);
          var endIndexInclusive = startIndex + match.length - 1;
          text.deleteText(startIndex + 1, endIndexInclusive);
        }
      }
      // Grab the text again.
      content = text.getText();
      // Remove carriage returns at the end of the text.
      if (matches = content.match(/\r\s*$/)) {
        var match = matches[0];
        text.deleteText(content.length - match.length, content.length - 1);
      }
      // Remove carriage returns at the start of the text.
      if (matches = content.match(/^\s*\r/)) {
        var match = matches[0];
        text.deleteText(0, match.length - 1);
      }
      // Recursively look in child elements
    } else if (element.getNumChildren) {
      for (var i = element.getNumChildren() - 1; i >= 0; i--) {
        var child = element.getChild(i);
        Utils_.removeMultipleLineBreaks(child);
      }
    }
    
  } // Utils_.removeMultipleLineBreaks()

  return ns

})(Utils_ || {})
