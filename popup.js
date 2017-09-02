var GENIUS_ACCESS_TOKEN = 'ZFORNou36eu6x896r0XD37fxPsYPEnmugEg_P8ItRjNbX7vGAKmg1fcg64F_wByk';

// Get the title of the current page
function getCurrentTabTitle(callback) {
  // The tab looked for should be active and in the current window
  var queryInfo = {
    active: true,
    currentWindow: true
  }

  chrome.tabs.query(queryInfo, function(tabs) {
    // Array must be a one-element array with the active tab as first element
    var tab = tabs[0];
    // Get the current tab's title
    var title = tab.title;

    callback(title);
  });
}

var page = document.querySelector('#page');

function appendHTML(html) {
  page.appendChild(html);
}

function parseHTML(html, selector = '*') {
  return new DOMParser().parseFromString(html, 'text/html').querySelector('body ' + selector);
}

function parseLyrics(html) {
  return parseHTML(html, '.lyrics');
}

// Display HTML in the popup
function cleanTitle(title) {
  var cleanedTitle = title.replace(/youtube|deezer/i, '');
  cleanedTitle = cleanedTitle.replace(/\ -\ /ig, ' ');
  cleanedTitle = cleanedTitle.replace(/\ x\ /ig, ' ');
  cleanedTitle = cleanedTitle.replace(/[\[\(](?:official|music|video|explicit)[^.]*[\)\]]/i, '');
  cleanedTitle = cleanedTitle.replace(/feat\.?|ft\.?/, '');
  return cleanedTitle;
}

document.addEventListener('DOMContentLoaded', function() {
  var request = window.superagent;

  getCurrentTabTitle(function(title) {
    var parser = new DOMParser();
    var cleanedTitle = cleanTitle(title);
    appendHTML(parseHTML(`<p>Querying Genius API for "${cleanedTitle}" ...</p>`));

    // Request Genius API to get songs relevant with the given title
    request
      .get(`https://api.genius.com/search?q=${encodeURIComponent(cleanedTitle)}`)
      .set('Authorization', `Bearer ${GENIUS_ACCESS_TOKEN}`) // Authorization header
      .end(function(err, res) {
        if (err == null && res.body.response.hits.length > 0) { // No error
          // Get most relevant song's id
          var url = res.body.response.hits[0].result.url;
          page.removeChild(page.firstChild);
          appendHTML(parseHTML(`<a href="${url}" target="_blank">${cleanedTitle}</a>`));
          // Request song with his id
          request
            .get(url)
            .end(function(err, res) {
              if (err == null) {
                lyrics = parseLyrics(res.text)
                console.log(lyrics);
                appendHTML(lyrics);
              }
            });
        }
      });
  });
});
