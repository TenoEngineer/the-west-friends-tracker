// Background Service Worker - The West Friends Tracker
chrome.action.onClicked.addListener(function(tab) {
    if (tab && tab.id && tab.url && tab.url.indexOf("the-west.net/game.php") !== -1) {
        chrome.tabs.sendMessage(tab.id, { action: "toggle_tracker" }, function(response) {
            if (chrome.runtime.lastError) {
                // Content script pode ainda não estar pronto
            }
        });
    }
});
