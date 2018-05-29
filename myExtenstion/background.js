// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// To make sure we can uniquely identify each screenshot tab, add an id as a
// query param to the url that displays the screenshot.
// Note: It's OK that this is a global variable (and not in localStorage),
// because the event page will stay open as long as any screenshot tabs are
// open.
var id = 100;
var logo;
var hostname;
var information;
var url;
var title ;
function getLogo(url) {
  logo.src = url + "/apple-touch-icon.png";
  logo.onerror = function () {
    logo.src = "https://plus.google.com/_/favicon?domain_url=" + url;
  }
}
var getLocation = function (href) {
  var l = document.createElement("a");
  l.href = href;
  return l;
};


// Listen for a click on the camera icon. On that click, take a screenshot.
chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {

    title = (tabs[0].title); // get tab name
    //alert(title);

    url = tabs[0].url;
    information = getLocation(url);
  });

  chrome.tabs.captureVisibleTab(function (screenshotUrl) {
    var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + id++)
    var targetId = null;

    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
      // We are waiting for the tab we opened to finish loading.
      // Check that the tab's id matches the tab we opened,
      // and that the tab is done loading.
      if (tabId != targetId || changedProps.status != "complete")
        return;

      // Passing the above test means this is the event we were waiting for.
      // There is nothing we need to do for future onUpdated events, so we
      // use removeListner to stop getting called when onUpdated events fire.
      chrome.tabs.onUpdated.removeListener(listener);

      // Look through all views to find the window which will display
      // the screenshot.  The url of the tab which will display the
      // screenshot includes a query parameter with a unique id, which
      // ensures that exactly one view will have the matching URL.
      var views = chrome.extension.getViews();
      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == viewTabUrl) {
          view.setScreenshotUrl(screenshotUrl);
          view.setTitle(title);
          view.setHostname(information.hostname);
          view.setpath(information.pathname);
          view.setlogo(getLogo(url));


          var sisi = screenshotUrl.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
          window.open(sisi);

          break;
        }
      }
    });

    chrome.tabs.create({ url: viewTabUrl }, function (tab) {
      targetId = tab.id;

    });
  });
});
