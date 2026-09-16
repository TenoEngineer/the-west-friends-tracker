(function() {
    // Evita injetar mais de uma vez
    if (document.getElementById("tw-pt-container")) return;

    // Persistencia Local
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
        return localStorage.getItem("tw_ft_mode") || "auto"; // "auto" ou "manual"
    }

    function setCurrentMode(m) {
        localStorage.setItem("tw_ft_mode", m);
    }

    // Cria a interface HTML
    var container = document.createElement("div");
    container.id = "tw-pt-container";
    container.innerHTML = 
        '<div id="tw-pt-header">' +
            '<div class="tw-pt-title">🤠 Friends Tracker</div>' +
            '<div id="tw-pt-header-buttons">' +
                '<button class="tw-pt-icon-btn" id="tw-pt-btn-minimize" title="Minimizar">_</button>' +
                '<button class="tw-pt-icon-btn close" id="tw-pt-btn-close" title="Fechar Janela">✕</button>' +
            '</div>' +
        '</div>' +

        '<div class="tw-pt-tabs">' +
            '<button class="tw-pt-tab active" id="tw-pt-tab-auto">⚡ Auto (Pelos Logs)</button>' +
            '<button class="tw-pt-tab" id="tw-pt-tab-manual">📝 Lista Manual</button>' +
        '</div>' +

        '<div id="tw-pt-body">' +
            '<div class="tw-pt-stats">' +
                '<div class="tw-pt-stat-box">' +
                    '<div class="tw-pt-stat-label" id="tw-pt-label-total">Amigos</div>' +
                    '<div class="tw-pt-stat-val gold" id="tw-pt-stat-total">0</div>' +
                '</div>' +
                '<div class="tw-pt-stat-box">' +
                    '<div class="tw-pt-stat-label">Ativos</div>' +
                    '<div class="tw-pt-stat-val green" id="tw-pt-stat-active">0</div>' +
                '</div>' +
                '<div class="tw-pt-stat-box">' +
                    '<div class="tw-pt-stat-label">Inativos</div>' +
                    '<div class="tw-pt-stat-val red" id="tw-pt-stat-inactive">0</div>' +
                '</div>' +
            '</div>' +

            '<div class="tw-pt-actions">' +
                '<button class="tw-pt-btn" id="tw-pt-btn-scan">🔍 Escanear Logs</button>' +
                '<button class="tw-pt-btn secondary" id="tw-pt-btn-copy">📋 Copiar Inativos</button>' +
            '</div>' +

            '<div id="tw-pt-toast"></div>' +

            // Painel Modo Auto
            '<div id="tw-pt-auto-panel">' +
                '<div style="font-size:11px; color:#a49175; margin-bottom:4px; font-weight:bold;" id="tw-pt-list-title">' +
                    'Você enviou, mas não retribuíram:' +
                '</div>' +
                '<div id="tw-pt-list-container"></div>' +
                '<div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">' +
                    '<button class="tw-pt-btn secondary" style="flex:none; font-size:10px; padding:3px 6px;" id="tw-pt-btn-export-manual" title="Copia os amigos detectados para a lista manual">Salvar como Lista Manual</button>' +
                    '<button class="tw-pt-btn secondary" style="flex:none; font-size:10px; padding:3px 6px;" id="tw-pt-btn-reset">Zerar Ciclo</button>' +
                '</div>' +
            '</div>' +

            // Painel Modo Manual
            '<div id="tw-pt-manual-panel">' +
                '<div style="font-size:11px; color:#a49175; font-weight:bold;">Cole ou edite sua lista de amigos:</div>' +
                '<textarea id="tw-pt-friends-input" placeholder="amigo1;amigo2;amigo3..."></textarea>' +
                '<div style="font-size:10px; color:#888;">Separe os nomes por ponto e vírgula (;), vírgula ou linha.</div>' +
                '<div class="tw-pt-actions">' +
                    '<button class="tw-pt-btn" id="tw-pt-btn-save-manual">Salvar Lista</button>' +
                    '<button class="tw-pt-btn secondary" id="tw-pt-btn-import-auto">Importar dos Logs</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    // Pílula minimizada
    var pill = document.createElement("div");
    pill.id = "tw-pt-pill";
    pill.innerText = "🤠 Friends Tracker";

    // Ícone disparador para reabrir quando fechado
    var launcher = document.createElement("div");
    launcher.id = "tw-pt-launcher";
    launcher.innerHTML = "🤠";
    launcher.title = "Reabrir Friends Tracker";

    document.body.appendChild(container);
    document.body.appendChild(pill);
    document.body.appendChild(launcher);

    function showToast(msg) {
        var el = document.getElementById("tw-pt-toast");
        if (!el) return;
        el.innerText = msg;
        setTimeout(function() {
            if (el.innerText === msg) el.innerText = "";
        }, 3500);
    }

    // Renderiza a interface baseado no modo atual
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
            document.getElementById("tw-pt-label-total").innerText = "Enviados";
        } else {
            tabAuto.className = "tw-pt-tab";
            tabManual.className = "tw-pt-tab active";
            autoPanel.style.display = "none";
            manualPanel.style.display = "flex";
            document.getElementById("tw-pt-label-total").innerText = "Na Lista";
        }

        // Calcula amigos, ativos e inativos
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

        // Atualiza stats
        document.getElementById("tw-pt-stat-total").innerText = totalCount;
        document.getElementById("tw-pt-stat-active").innerText = activeCount;
        document.getElementById("tw-pt-stat-inactive").innerText = inactives.length;

        // Atualiza pílula minimizada
        pill.innerText = "🤠 Inativos: " + inactives.length + " | Ativos: " + activeCount;

        // Atualiza lista
        var listContainer = document.getElementById("tw-pt-list-container");
        listContainer.innerHTML = "";

        if (totalCount === 0) {
            if (mode === "auto") {
                listContainer.innerHTML = 
                    '<div style="padding:15px 10px; text-align:center; color:#a49175; font-size:11px;">' +
                        'Abra a janela de logs no jogo e clique em <b>Escanear Logs</b> para capturar quem você enviou e quem te enviou!' +
                    '</div>';
            } else {
                listContainer.innerHTML = 
                    '<div style="padding:15px 10px; text-align:center; color:#a49175; font-size:11px;">' +
                        'Sua lista manual está vazia.<br>Cole seus amigos na aba <b>Lista Manual</b> ou use a aba <b>Auto (Pelos Logs)</b>!' +
                    '</div>';
            }
        } else if (inactives.length === 0) {
            listContainer.innerHTML = 
                '<div style="padding:15px; text-align:center; color:#55d66e; font-weight:bold;">' +
                    'Nenhum amigo inativo! Todos retribuíram os presentes! 🎉' +
                '</div>';
        } else {
            inactives.forEach(function(name, idx) {
                var row = document.createElement("div");
                row.className = "tw-pt-list-item";
                row.innerHTML = 
                    '<span><b>' + (idx + 1) + '.</b> ' + name + '</span>' +
                    '<span class="tw-pt-badge-inativo">Sem retorno</span>';
                listContainer.appendChild(row);
            });
        }
    }

    // Escaneia a pagina atual do jogo
    function scanPage() {
        var autoSent = loadSet("tw_ft_auto_sent");
        var autoReceived = loadSet("tw_ft_auto_received");
        var bodyText = document.body ? document.body.innerText : "";

        // Regex que captura automaticamente:
        // Gift to a friend: [Nome] (enviados)
        // Gift from a friend: [Nome] (recebidos)
        // Tambem aceita em portugues: Presente para / Presente de
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
            showToast("+" + newSent + " enviados, +" + newReceived + " recebidos nesta página!");
        } else {
            showToast("Nenhum registro novo nesta página.");
        }
    }

    // Retorna a lista de inativos do modo ativo
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

    // Copiar inativos
    document.getElementById("tw-pt-btn-copy").addEventListener("click", function() {
        var inactives = getInactivesList();
        if (inactives.length === 0) {
            showToast("Nenhum amigo inativo para copiar!");
            return;
        }
        navigator.clipboard.writeText(inactives.join(";")).then(function() {
            showToast("Lista copiada! (" + inactives.length + " amigos inativos)");
        });
    });

    // Escanear
    document.getElementById("tw-pt-btn-scan").addEventListener("click", scanPage);

    // Zerar ciclo
    document.getElementById("tw-pt-btn-reset").addEventListener("click", function() {
        if (confirm("Deseja zerar os registros de enviados e recebidos para iniciar um novo ciclo?")) {
            saveSet("tw_ft_auto_sent", new Set());
            saveSet("tw_ft_auto_received", new Set());
            render();
            showToast("Ciclo zerado!");
        }
    });

    // Abas
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

    // Salvar lista manual
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
        showToast("Salvo! " + clean.length + " amigos na lista manual.");
    });

    // Importar amigos detectados dos logs para o campo manual
    function importAutoToManual() {
        var autoSent = loadSet("tw_ft_auto_sent");
        if (autoSent.size === 0) {
            showToast("Nenhum amigo detectado nos logs ainda!");
            return;
        }
        var arr = Array.from(autoSent).sort();
        saveManualFriends(arr);
        document.getElementById("tw-pt-friends-input").value = arr.join("; ");
        render();
        showToast("Importados " + arr.length + " amigos detectados nos logs!");
    }

    document.getElementById("tw-pt-btn-import-auto").addEventListener("click", importAutoToManual);
    document.getElementById("tw-pt-btn-export-manual").addEventListener("click", function() {
        importAutoToManual();
        setCurrentMode("manual");
        render();
    });

    // Minimizar painel
    document.getElementById("tw-pt-btn-minimize").addEventListener("click", function() {
        container.style.display = "none";
        launcher.style.display = "none";
        pill.style.display = "block";
    });

    // Fechar painel completamente
    document.getElementById("tw-pt-btn-close").addEventListener("click", function() {
        container.style.display = "none";
        pill.style.display = "none";
        launcher.style.display = "flex";
    });

    // Reabrir a partir do ícone disparador
    launcher.addEventListener("click", function() {
        if (!launcherMoved) {
            launcher.style.display = "none";
            container.style.display = "block";
        }
    });

    // Variáveis de arraste para Pílula, Janela e Ícone Launcher
    var isPillDragging = false;
    var pillStartX = 0, pillStartY = 0;
    var pillOffsetX = 0, pillOffsetY = 0;
    var pillMoved = false;

    var isMainDragging = false;
    var mainOffsetX = 0, mainOffsetY = 0;

    var isLauncherDragging = false;
    var launcherStartX = 0, launcherStartY = 0;
    var launcherOffsetX = 0, launcherOffsetY = 0;
    var launcherMoved = false;

    // Arrastar Pílula Minimizada
    pill.addEventListener("mousedown", function(e) {
        isPillDragging = true;
        pillMoved = false;
        pillStartX = e.clientX;
        pillStartY = e.clientY;
        var rect = pill.getBoundingClientRect();
        pillOffsetX = e.clientX - rect.left;
        pillOffsetY = e.clientY - rect.top;
        e.preventDefault();
    });

    // Arrastar Ícone Disparador (Launcher)
    launcher.addEventListener("mousedown", function(e) {
        isLauncherDragging = true;
        launcherMoved = false;
        launcherStartX = e.clientX;
        launcherStartY = e.clientY;
        var rect = launcher.getBoundingClientRect();
        launcherOffsetX = e.clientX - rect.left;
        launcherOffsetY = e.clientY - rect.top;
        e.preventDefault();
    });

    // Arrastar Janela Principal
    var header = document.getElementById("tw-pt-header");
    header.addEventListener("mousedown", function(e) {
        if (e.target.tagName === "BUTTON") return;
        isMainDragging = true;
        var rect = container.getBoundingClientRect();
        mainOffsetX = e.clientX - rect.left;
        mainOffsetY = e.clientY - rect.top;
    });

    window.addEventListener("mousemove", function(e) {
        // Arrastando a pílula
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

        // Arrastando o launcher
        if (isLauncherDragging) {
            var ldx = Math.abs(e.clientX - launcherStartX);
            var ldy = Math.abs(e.clientY - launcherStartY);
            if (ldx > 4 || ldy > 4) {
                launcherMoved = true;
                launcher.style.right = "auto";
                launcher.style.bottom = "auto";
                launcher.style.left = (e.clientX - launcherOffsetX) + "px";
                launcher.style.top = (e.clientY - launcherOffsetY) + "px";
            }
        }

        // Arrastando o container principal
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
            if (!pillMoved) {
                pill.style.display = "none";
                container.style.display = "block";
            }
        }
        if (isLauncherDragging) {
            isLauncherDragging = false;
        }
        if (isMainDragging) {
            isMainDragging = false;
        }
    });

    // Auto-scan ao clicar em paginacao do The-West
    document.addEventListener("click", function(e) {
        var target = e.target;
        if (target && (target.classList.contains("page_nav") || 
                      target.classList.contains("page") || 
                      target.closest(".paginator") ||
                      target.closest(".tw2gui_pagination"))) {
            setTimeout(scanPage, 500);
        }
    });

    render();
})();
