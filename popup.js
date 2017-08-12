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

// Display Genius' lyrics in the popup
function renderLyrics(html) {
  document.getElementById('page').innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  var request = window.superagent;

  getCurrentTabTitle(function(title) {
    var cleanTitle = title.replace(' - YouTube', '');
    renderLyrics(`Querying Genius API for "${cleanTitle}" ...`);

    // Request Genius API to get songs relevant with the given title
    request
      .get(`https://api.genius.com/search?q=${encodeURIComponent(cleanTitle)}`)
      .set('Authorization', `Bearer ${GENIUS_ACCESS_TOKEN}`) // Authorization header
      .end(function(err, res) {
        if (err == null && res.body.response.hits.length > 0) { // No error
          // Get most relevant song's id
          var url = res.body.response.hits[0].result.url;
          // Request song with his id
          request
            .get(url)
            .end(function(err, res) {
              if (err == null) {
                console.log(res)
                /////////////////////////////////// PROBLEME DE CORS ///////////
                // Render HTML lyrics with annotations
                // renderLyrics(lyrics);
              }
            });
        }
      });
  });
});
