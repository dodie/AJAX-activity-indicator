/*
* AJAX Progress Indicator
* -----------------------
*
* This script adds onOpenGlobal and onDoneGlobal functions and numberOfOpenCalls property to XMLHttpRequest.
*  - XMLHttpRequest.onOpenGlobal(count) will be called every time an AJAX connection opens.
*  - XMLHttpRequest.onDoneGlobal(count) will be called every time an AJAX connection's readystate changes to DONE (4).
*  - The count parameter indicates the number of open AJAX connections globally, XMLHttpRequest.numberOfOpenCalls holds the same value.
*  - Override the onOpenGlobal and onDoneGlobal functions with custom functions for your AJAX indicator.
*  - Works on IE7+, FF, Chrome... It has no effect on unsupported browsers.
*  - Example:
*        window.XMLHttpRequest.onOpenGlobal = refreshAjaxLoader(openCalls){
*                                                    if (openCalls == 0) {
*                                                        //HIDE AJAX INDICATOR
*                                                    }
*                                                };
*        window.XMLHttpRequest.onDoneGlobal = function(openCalls){
*                                                    //SHOW AJAX INDICATOR
*                                                };
* 
* Author: dodie
* http://www.advancedweb.hu
*/
if (window.XMLHttpRequest) {
   var dummyXmlHttpRequest = new XMLHttpRequest();
   dummyXmlHttpRequest.onreadystatechange = function(){};
   if (dummyXmlHttpRequest.onreadystatechange.apply || dummyXmlHttpRequest.onreadystatechange.handleEvent.call) {
       window.XMLHttpRequest.numberOfOpenCalls = 0;
       window.XMLHttpRequest.onOpenGlobal = function(numberOfOpenCalls){};
       window.XMLHttpRequest.onDoneGlobal = function(numberOfOpenCalls){};
       
       window.XMLHttpRequest.prototype._open = window.XMLHttpRequest.prototype.open;
       window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
           window.XMLHttpRequest.numberOfOpenCalls = window.XMLHttpRequest.numberOfOpenCalls + 1;
           window.XMLHttpRequest.onOpenGlobal(window.XMLHttpRequest.numberOfOpenCalls);
           
           return window.XMLHttpRequest.prototype._open.apply(this, arguments);
       };
       
       window.XMLHttpRequest.prototype._send = window.XMLHttpRequest.prototype.send;
       window.XMLHttpRequest.prototype.send = function(data) {
           if(this.onreadystatechange) {
               this._onreadystatechange = this.onreadystatechange;
           }
           
           this.onreadystatechange = function(){
               if (this.readyState == window.XMLHttpRequest.DONE) {
                  window.XMLHttpRequest.numberOfOpenCalls = window.XMLHttpRequest.numberOfOpenCalls - 1;
                  window.XMLHttpRequest.onDoneGlobal(window.XMLHttpRequest.numberOfOpenCalls);
               }
               
               if(this._onreadystatechange) {
                   if (this._onreadystatechange.apply) {
                       return this._onreadystatechange.apply(this, arguments);
                   } else if (this._onreadystatechange.handleEvent.call) {
                       return this._onreadystatechange.handleEvent.call(this, arguments);
                   }
               }
           };
           return window.XMLHttpRequest.prototype._send.apply(this, arguments);
       }
   }
}