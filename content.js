(function() {
    // Prevent multiple injections
    if (document.getElementById("tw-pt-container")) return;

    // Local Persistence
    function loadSet(key) {
        var raw = localStorage.getItem(key);
        var set = new Set();
        if (raw) {
            try {
                var arr = JSON.parse(raw);
                arr.forEach(function(item) { set.add(item); });
            } catch (e) {}
        }
        return set;
    }

    function saveSet(key, set) {
        localStorage.setItem(key, JSON.stringify(Array.from(set)));
    }

    function getManualFriends() {
        var raw = localStorage.getItem("tw_ft_manual_friends");
        if (!raw) return [];
        try {
            var arr = JSON.parse(raw);
            if (Array.isArray(arr)) return arr;
        } catch (e) {}
        return [];
    }

    function saveManualFriends(arr) {
        localStorage.setItem("tw_ft_manual_friends", JSON.stringify(arr));
    }

    function getCurrentMode() {
        return localStorage.getItem("tw_ft_mode") || "auto"; // "auto" or "manual"
    }

    function setCurrentMode(m) {
        localStorage.setItem("tw_ft_mode", m);
    }

    function isClosedState() {
        return localStorage.getItem("tw_ft_closed") === "true";
    }

    function setClosedState(closed) {
        localStorage.setItem("tw_ft_closed", closed ? "true" : "false");
    }

    // Create HTML interface
    var container = document.createElement("div");
    container.id = "tw-pt-container";
    container.innerHTML = 
        '<div id="tw-pt-header">' +
            '<div class="tw-pt-title">🤠 Friends Tracker</div>' +
            '<div id="tw-pt-header-buttons">' +
                '<button class="tw-pt-icon-btn" id="tw-pt-btn-minimize" title="Minimize">_</button>' +
                '<button class="tw-pt-icon-btn close" id="tw-pt-btn-close" title="Close (Reopen anytime via extension icon)">✕</button>' +
            '</div>' +
        '</div>' +

        '<div class="tw-pt-tabs">' +
            '<button class="tw-pt-tab active" id="tw-pt-tab-auto">⚡ Auto (From Logs)</button>' +
            '<button class="tw-pt-tab" id="tw-pt-tab-manual">📝 Manual List</button>' +
        '</div>' +

        '<div id="tw-pt-body">' +
            '<div class="tw-pt-stats">' +
                '<div class="tw-pt-stat-box">' +
                    '<div class="tw-pt-stat-label" id="tw-pt-label-total">Friends</div>' +
                    '<div class="tw-pt-stat-val gold" id="tw-pt-stat-total">0</div>' +
                '</div>' +
                '<div class="tw-pt-stat-box">' +
                    '<div class="tw-pt-stat-label">Active</div>' +
                    '<div class="tw-pt-stat-val green" id="tw-pt-stat-active">0</div>' +
                '</div>' +
                '<div class="tw-pt-stat-box">' +
                    '<div class="tw-pt-stat-label">Inactive</div>' +
                    '<div class="tw-pt-stat-val red" id="tw-pt-stat-inactive">0</div>' +
                '</div>' +
            '</div>' +

            '<div class="tw-pt-actions">' +
                '<button class="tw-pt-btn" id="tw-pt-btn-scan">🔍 Scan Logs</button>' +
                '<button class="tw-pt-btn secondary" id="tw-pt-btn-copy">📋 Copy Inactive</button>' +
            '</div>' +

            '<div id="tw-pt-toast"></div>' +

            // Auto Mode Panel
            '<div id="tw-pt-auto-panel">' +
                '<div style="font-size:11px; color:#a49175; margin-bottom:4px; font-weight:bold;" id="tw-pt-list-title">' +
                    'You sent, but they didn\'t return:' +
                '</div>' +
                '<div id="tw-pt-list-container"></div>' +
                '<div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">' +
                    '<button class="tw-pt-btn secondary" style="flex:none; font-size:10px; padding:3px 6px;" id="tw-pt-btn-export-manual" title="Copy detected friends to manual list">Save as Manual List</button>' +
                    '<button class="tw-pt-btn secondary" style="flex:none; font-size:10px; padding:3px 6px;" id="tw-pt-btn-reset">Reset Cycle</button>' +
                '</div>' +
            '</div>' +

            // Manual Mode Panel
            '<div id="tw-pt-manual-panel">' +
                '<div style="font-size:11px; color:#a49175; font-weight:bold;">Paste or edit your friends list:</div>' +
                '<textarea id="tw-pt-friends-input" placeholder="friend1;friend2;friend3..."></textarea>' +
                '<div style="font-size:10px; color:#888;">Separate names by semicolon (;), comma, or line.</div>' +
                '<div class="tw-pt-actions">' +
                    '<button class="tw-pt-btn" id="tw-pt-btn-save-manual">Save List</button>' +
                    '<button class="tw-pt-btn secondary" id="tw-pt-btn-import-auto">Import from Logs</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    // Minimized Pill
    var pill = document.createElement("div");
    pill.id = "tw-pt-pill";
    pill.innerHTML = '<span id="tw-pt-pill-text">🤠 Friends Tracker</span><span id="tw-pt-pill-close" class="tw-pt-pill-close" title="Close">✕</span>';

    // If in closed state, start hidden
    if (isClosedState()) {
        container.style.display = "none";
        pill.style.display = "none";
    }

    document.body.appendChild(container);
    document.body.appendChild(pill);

    function showToast(msg) {
        var el = document.getElementById("tw-pt-toast");
        if (!el) return;
        el.innerText = msg;
        setTimeout(function() {
            if (el.innerText === msg) el.innerText = "";
        }, 3500);
    }

    // Completely close window (hide everything and remember choice)
    function closeTracker() {
        setClosedState(true);
        container.style.display = "none";
        pill.style.display = "none";
    }

    // Open window
    function openTracker() {
        setClosedState(false);
        pill.style.display = "none";
        container.style.display = "block";
        render();
    }

    // Toggle open/close (triggered by clicking extension icon in Chrome)
    function toggleTracker() {
        var isHidden = container.style.display === "none" && pill.style.display === "none";
        if (isHidden) {
            openTracker();
        } else {
            closeTracker();
        }
    }

    // Listen for extension messages (Chrome toolbar icon click)
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request && request.action === "toggle_tracker") {
                toggleTracker();
                if (sendResponse) sendResponse({ success: true });
            }
        });
    }

    // Render interface based on current mode
    function render() {
        var mode = getCurrentMode();
        var autoSent = loadSet("tw_ft_auto_sent");
        var autoReceived = loadSet("tw_ft_auto_received");
        var manualFriends = getManualFriends();

        var tabAuto = document.getElementById("tw-pt-tab-auto");
        var tabManual = document.getElementById("tw-pt-tab-manual");
        var autoPanel = document.getElementById("tw-pt-auto-panel");
        var manualPanel = document.getElementById("tw-pt-manual-panel");

        if (mode === "auto") {
            tabAuto.className = "tw-pt-tab active";
            tabManual.className = "tw-pt-tab";
            autoPanel.style.display = "block";
            manualPanel.style.display = "none";
            document.getElementById("tw-pt-label-total").innerText = "Sent";
        } else {
            tabAuto.className = "tw-pt-tab";
            tabManual.className = "tw-pt-tab active";
            autoPanel.style.display = "none";
            manualPanel.style.display = "flex";
            document.getElementById("tw-pt-label-total").innerText = "On List";
        }

        // Calculate friends, active, and inactive
        var totalCount = 0;
        var activeCount = 0;
        var inactives = [];

        if (mode === "auto") {
            totalCount = autoSent.size;
            autoSent.forEach(function(friend) {
                if (autoReceived.has(friend)) {
                    activeCount++;
                } else {
                    inactives.push(friend);
                }
            });
        } else {
            totalCount = manualFriends.length;
            manualFriends.forEach(function(friend) {
                if (autoReceived.has(friend)) {
                    activeCount++;
                } else {
                    inactives.push(friend);
                }
            });
        }

        inactives.sort();

        // Update stats
        document.getElementById("tw-pt-stat-total").innerText = totalCount;
        document.getElementById("tw-pt-stat-active").innerText = activeCount;
        document.getElementById("tw-pt-stat-inactive").innerText = inactives.length;

        // Update minimized pill
        var pillText = document.getElementById("tw-pt-pill-text");
        if (pillText) {
            pillText.innerText = "🤠 Inactive: " + inactives.length + " | Active: " + activeCount;
        }

        // Update list
        var listContainer = document.getElementById("tw-pt-list-container");
        listContainer.innerHTML = "";

        if (totalCount === 0) {
            if (mode === "auto") {
                listContainer.innerHTML = 
                    '<div style="padding:15px 10px; text-align:center; color:#a49175; font-size:11px;">' +
                        'Open the in-game log window and click <b>Scan Logs</b> to capture who you sent gifts to and who sent to you!' +
                    '</div>';
            } else {
                listContainer.innerHTML = 
                    '<div style="padding:15px 10px; text-align:center; color:#a49175; font-size:11px;">' +
                        'Your manual list is empty.<br>Paste your friends in the <b>Manual List</b> tab or switch to <b>Auto (From Logs)</b>!' +
                    '</div>';
            }
        } else if (inactives.length === 0) {
            listContainer.innerHTML = 
                '<div style="padding:15px; text-align:center; color:#55d66e; font-weight:bold;">' +
                    'No inactive friends! Everyone returned gifts! 🎉' +
                '</div>';
        } else {
            inactives.forEach(function(name, idx) {
                var row = document.createElement("div");
                row.className = "tw-pt-list-item";
                row.innerHTML = 
                    '<span><b>' + (idx + 1) + '.</b> ' + name + '</span>' +
                    '<span class="tw-pt-badge-inativo">No return</span>';
                listContainer.appendChild(row);
            });
        }
    }

    // Scan current game page
    function scanPage() {
        var autoSent = loadSet("tw_ft_auto_sent");
        var autoReceived = loadSet("tw_ft_auto_received");
        var bodyText = document.body ? document.body.innerText : "";

        // Regex that matches:
        // Gift to a friend: [Name] (sent)
        // Gift from a friend: [Name] (received)
        // Also supports Portuguese: Presente para / Presente de
        var pattern = new RegExp("(?:Gift|Presente)\\s+(to|from|para|de)\\s+(?:a\\s+friend|um\\s+amigo):\\s*([^\\r\\n\\t(+]+)", "gi");

        var newSent = 0;
        var newReceived = 0;
        var match;

        while ((match = pattern.exec(bodyText)) !== null) {
            var action = match[1].toLowerCase();
            var name = match[2].trim();
            if (!name) continue;

            if (action === "to" || action === "para") {
                if (!autoSent.has(name)) {
                    autoSent.add(name);
                    newSent++;
                }
            } else if (action === "from" || action === "de") {
                if (!autoReceived.has(name)) {
                    autoReceived.add(name);
                    newReceived++;
                }
            }
        }

        saveSet("tw_ft_auto_sent", autoSent);
        saveSet("tw_ft_auto_received", autoReceived);

        render();

        if (newSent > 0 || newReceived > 0) {
            showToast("+" + newSent + " sent, +" + newReceived + " received on this page!");
        } else {
            showToast("No new records on this page.");
        }
    }

    // Get inactive list for current mode
    function getInactivesList() {
        var mode = getCurrentMode();
        var autoSent = loadSet("tw_ft_auto_sent");
        var autoReceived = loadSet("tw_ft_auto_received");
        var list = [];

        if (mode === "auto") {
            autoSent.forEach(function(f) {
                if (!autoReceived.has(f)) list.push(f);
            });
        } else {
            var manual = getManualFriends();
            manual.forEach(function(f) {
                if (!autoReceived.has(f)) list.push(f);
            });
        }
        list.sort();
        return list;
    }

    // Copy inactive friends
    document.getElementById("tw-pt-btn-copy").addEventListener("click", function() {
        var inactives = getInactivesList();
        if (inactives.length === 0) {
            showToast("No inactive friends to copy!");
            return;
        }
        navigator.clipboard.writeText(inactives.join(";")).then(function() {
            showToast("List copied! (" + inactives.length + " inactive friends)");
        });
    });

    // Scan
    document.getElementById("tw-pt-btn-scan").addEventListener("click", scanPage);

    // Reset cycle
    document.getElementById("tw-pt-btn-reset").addEventListener("click", function() {
        if (confirm("Reset sent and received records to start a new cycle?")) {
            saveSet("tw_ft_auto_sent", new Set());
            saveSet("tw_ft_auto_received", new Set());
            render();
            showToast("Cycle reset!");
        }
    });

    // Tabs
    document.getElementById("tw-pt-tab-auto").addEventListener("click", function() {
        setCurrentMode("auto");
        render();
    });

    document.getElementById("tw-pt-tab-manual").addEventListener("click", function() {
        setCurrentMode("manual");
        var input = document.getElementById("tw-pt-friends-input");
        input.value = getManualFriends().join("; ");
        render();
    });

    // Save manual list
    document.getElementById("tw-pt-btn-save-manual").addEventListener("click", function() {
        var input = document.getElementById("tw-pt-friends-input").value;
        var rawItems = input.split(/[\n,;]+/);
        var clean = [];
        rawItems.forEach(function(item) {
            var trimmed = item.trim();
            if (trimmed.length > 0 && clean.indexOf(trimmed) === -1) {
                clean.push(trimmed);
            }
        });
        saveManualFriends(clean);
        render();
        showToast("Saved! " + clean.length + " friends in manual list.");
    });

    // Import detected friends from logs to manual input
    function importAutoToManual() {
        var autoSent = loadSet("tw_ft_auto_sent");
        if (autoSent.size === 0) {
            showToast("No friends detected in logs yet!");
            return;
        }
        var arr = Array.from(autoSent).sort();
        saveManualFriends(arr);
        document.getElementById("tw-pt-friends-input").value = arr.join("; ");
        render();
        showToast("Imported " + arr.length + " friends detected in logs!");
    }

    document.getElementById("tw-pt-btn-import-auto").addEventListener("click", importAutoToManual);
    document.getElementById("tw-pt-btn-export-manual").addEventListener("click", function() {
        importAutoToManual();
        setCurrentMode("manual");
        render();
    });

    // Minimize panel
    document.getElementById("tw-pt-btn-minimize").addEventListener("click", function() {
        container.style.display = "none";
        pill.style.display = "flex";
    });

    // Close panel completely (hides everything and remembers choice)
    document.getElementById("tw-pt-btn-close").addEventListener("click", closeTracker);
    document.getElementById("tw-pt-pill-close").addEventListener("click", function(e) {
        e.stopPropagation();
        closeTracker();
    });

    // Dragging variables for Pill and Window
    var isPillDragging = false;
    var pillStartX = 0, pillStartY = 0;
    var pillOffsetX = 0, pillOffsetY = 0;
    var pillMoved = false;

    var isMainDragging = false;
    var mainOffsetX = 0, mainOffsetY = 0;

    // Drag Minimized Pill
    pill.addEventListener("mousedown", function(e) {
        if (e.target.id === "tw-pt-pill-close") return;
        isPillDragging = true;
        pillMoved = false;
        pillStartX = e.clientX;
        pillStartY = e.clientY;
        var rect = pill.getBoundingClientRect();
        pillOffsetX = e.clientX - rect.left;
        pillOffsetY = e.clientY - rect.top;
        e.preventDefault();
    });

    // Drag Main Window
    var header = document.getElementById("tw-pt-header");
    header.addEventListener("mousedown", function(e) {
        if (e.target.tagName === "BUTTON") return;
        isMainDragging = true;
        var rect = container.getBoundingClientRect();
        mainOffsetX = e.clientX - rect.left;
        mainOffsetY = e.clientY - rect.top;
    });

    window.addEventListener("mousemove", function(e) {
        // Dragging pill
        if (isPillDragging) {
            var dx = Math.abs(e.clientX - pillStartX);
            var dy = Math.abs(e.clientY - pillStartY);
            if (dx > 4 || dy > 4) {
                pillMoved = true;
                pill.style.right = "auto";
                pill.style.bottom = "auto";
                pill.style.left = (e.clientX - pillOffsetX) + "px";
                pill.style.top = (e.clientY - pillOffsetY) + "px";
            }
        }

        // Dragging main container
        if (isMainDragging) {
            container.style.right = "auto";
            container.style.bottom = "auto";
            container.style.left = (e.clientX - mainOffsetX) + "px";
            container.style.top = (e.clientY - mainOffsetY) + "px";
        }
    });

    window.addEventListener("mouseup", function() {
        if (isPillDragging) {
            isPillDragging = false;
            // If clicked without dragging, restore main window
            if (!pillMoved) {
                pill.style.display = "none";
                container.style.display = "block";
            }
        }
        if (isMainDragging) {
            isMainDragging = false;
        }
    });

    // Auto-scan when clicking pagination in The-West
    document.addEventListener("click", function(e) {
        var target = e.target;
        if (target && (target.classList.contains("page_nav") || 
                      target.classList.contains("page") || 
                      target.closest(".paginator") ||
                      target.closest(".tw2gui_pagination"))) {
            setTimeout(scanPage, 500);
        }
    });

    if (!isClosedState()) {
        render();
    }
})();
