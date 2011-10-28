/*
* AJAX Progress Indicator (Progress bar)
* --------------------------------------
* This script adds onOpenGlobal and onDoneGlobal functions and numberOfOpenCalls, doneCallbackDelay and openCallbackDelay properties to XMLHttpRequest.
*  - XMLHttpRequest.onOpenGlobal(count) will be called every time an AJAX connection opens.
*  - XMLHttpRequest.onDoneGlobal(count) will be called every time an AJAX connection's readystate changes to DONE (4).
*  - The count parameter indicates the number of open AJAX connections globally at the given time, XMLHttpRequest.numberOfOpenCalls holds the same value.
*  - Setting openCallbackDelay and doneCallbackDelay greater than zero can prevent spike AJAX communication from showing the indicator for really short times.
*          - openCallbackDelay (ms): before calling onOpenGlobal, the scripts waits the specified time. The client code can ignore spikes by testing the openCalls parameter.
*          - doneCallbackDelay (ms): before calling onDoneGlobal, the scripts waits the specified time. Can be used to show the indicator for a given time once it displayed.
*  - Override the onOpenGlobal and onDoneGlobal functions with custom functions for your AJAX indicator.
*  - Works on IE7+, Firefox, Chrome, Opera, Safari... It has no effect on unsupported browsers. Should work with most AJAX/JS libraries (GWT, JQuery tested).
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
		window.XMLHttpRequest.doneCallbackDelay = 0;
		window.XMLHttpRequest.openCallbackDelay = 0;
		
		if (!window.XMLHttpRequest.DONE) {
			window.XMLHttpRequest.DONE = 4;
		}
		
		var openTimer;
		var doneTimer;
		if(clearTimeout) {
			openTimer = new Object();
			doneTimer = new Object();
		}
       
		window.XMLHttpRequest.prototype._open = window.XMLHttpRequest.prototype.open;
		window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
			window.XMLHttpRequest.numberOfOpenCalls = window.XMLHttpRequest.numberOfOpenCalls + 1;
           
			if (openTimer && window.XMLHttpRequest.openCallbackDelay != 0) {
				clearTimeout(openTimer);
				openTimer = setTimeout("window.XMLHttpRequest.onOpenGlobal(window.XMLHttpRequest.numberOfOpenCalls);", window.XMLHttpRequest.openCallbackDelay);
			} else {
				window.XMLHttpRequest.onOpenGlobal(window.XMLHttpRequest.numberOfOpenCalls);
			}
			
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
					
					if (doneTimer && window.XMLHttpRequest.doneCallbackDelay != 0) {
						clearTimeout(doneTimer);
						doneTimer = setTimeout("window.XMLHttpRequest.onDoneGlobal(window.XMLHttpRequest.numberOfOpenCalls);" , window.XMLHttpRequest.doneCallbackDelay);
					} else {
						window.XMLHttpRequest.onDoneGlobal(window.XMLHttpRequest.numberOfOpenCalls);
					}
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
		};
	}
}