(function () {
    try {
        var theme = 'light';
        var urlParams = window.location.search || '';
        var root = document.documentElement;

        // Helper for safe storage access
        var safeGet = function (key) {
            try { return localStorage.getItem(key); } catch (e) { return null; }
        };
        var safeSet = function (key, val) {
            try { localStorage.setItem(key, val); } catch (e) { }
        };

        // 1. Check URL for theme (highest priority)
        if (urlParams.indexOf('theme=dark') !== -1) {
            theme = 'dark';
            // Lock it in for persistence
            safeSet('darkMode', 'enabled');
        }
        // 2. Check localStorage (persistence)
        else {
            var stored = safeGet('darkMode');
            if (stored === 'enabled') {
                theme = 'dark';
            }
        }

        // Apply theme attributes immediately to prevent flash
        root.setAttribute('data-theme', theme);
        
        // Standard className manipulation for older browser compatibility
        var currentClasses = root.className || '';
        if (theme === 'dark') {
            if (currentClasses.indexOf('dark-mode') === -1) {
                root.className = (currentClasses + ' dark-mode').trim();
            }
        } else {
            root.className = currentClasses.replace(/\bdark-mode\b/g, '').trim();
        }

        // Store globally for other scripts
        window.currentTheme = theme;

        // 3. Early Meta Refresh Sync (Crucial for alogin/logout)
        if (theme === 'dark') {
            var metaTags = document.getElementsByTagName('meta');
            var metaRefresh = null;
            for (var i = 0; i < metaTags.length; i++) {
                if (metaTags[i].getAttribute('http-equiv') === 'refresh') {
                    metaRefresh = metaTags[i];
                    break;
                }
            }
            
            if (metaRefresh) {
                var content = metaRefresh.getAttribute('content') || '';
                // Only if url exists and hasn't already been theme-synced
                if (content.indexOf('url=') !== -1 && content.indexOf('theme=dark') === -1) {
                    var parts = content.split('url=');
                    var url = parts[1];
                    var separator = (url.indexOf('?') !== -1) ? '&' : '?';
                    metaRefresh.setAttribute('content', parts[0] + 'url=' + url + separator + 'theme=dark');
                }
            }
        }
    } catch (e) {
        // Fallback for extreme cases
        if (console && console.log) console.log('Theme init fail:', e);
    }
})();
