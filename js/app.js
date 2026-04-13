// Centralized JS for MikroTik Hotspot - Azeez Net (Legacy Compatible ES5/ES3)

document.addEventListener('DOMContentLoaded', function () {

    // 1. Dark Mode Logic (Enhanced with URL Persistence)
    var darkModeToggle = document.getElementById('darkModeToggle');
    var toggleWrapper = document.querySelector ? document.querySelector('.toggle-switch-wrapper') : document.getElementsByClassName('toggle-switch-wrapper')[0];
    var root = document.documentElement;

    var storageSafe = {
        get: function (key) {
            try { return localStorage.getItem(key); } catch (e) { return null; }
        },
        set: function (key, val) {
            try { localStorage.setItem(key, val); } catch (e) { }
        }
    };

    // Helper functions for class manipulation (Legacy Support)
    var addClass = function (el, cls) {
        if (!el) return;
        var cur = el.className || '';
        if (cur.indexOf(cls) === -1) {
            el.className = (cur + ' ' + cls).trim();
        }
    };
    var removeClass = function (el, cls) {
        if (!el) return;
        var cur = el.className || '';
        el.className = cur.replace(new RegExp('\\b' + cls + '\\b', 'g'), ' ').trim();
    };
    var toggleClass = function (el, cls, force) {
        if (typeof force !== 'undefined') {
            if (force) addClass(el, cls);
            else removeClass(el, cls);
        } else {
            var cur = el.className || '';
            if (cur.indexOf(cls) !== -1) removeClass(el, cls);
            else addClass(el, cls);
        }
    };
    var findClosest = function (el, tag) {
        tag = tag.toUpperCase();
        while (el && el.parentNode) {
            el = el.parentNode;
            if (el.tagName === tag) return el;
        }
        return null;
    };

    // Helper to sync all internal elements with the current theme
    var syncLinksWithTheme = function (theme) {
        var links = document.getElementsByTagName('a');
        var forms = document.getElementsByTagName('form');
        var isDark = (theme === 'dark');
        window.currentTheme = theme;

        // Update all links
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute('href');
            if (href && href.indexOf('http') !== 0 && href.indexOf('#') !== 0 && href.indexOf('javascript') !== 0) {
                href = href.replace(/[?&]theme=[^&]+/, '');
                if (isDark) {
                    href += (href.indexOf('?') === -1 ? '?' : '&') + 'theme=dark';
                }
                links[i].setAttribute('href', href);
            }
        }

        // Update all forms
        for (var j = 0; j < forms.length; j++) {
            var action = forms[j].getAttribute('action');
            if (action && action.indexOf('http') !== 0 && action.indexOf('javascript') !== 0) {
                action = action.replace(/[?&]theme=[^&]+/, '');
                if (isDark) {
                    action += (action.indexOf('?') === -1 ? '?' : '&') + 'theme=dark';
                }
                forms[j].setAttribute('action', action);
            }
        }
    };

    var applyTheme = function (theme, showToastNotify) {
        var isDark = (theme === 'dark');
        root.setAttribute('data-theme', theme);
        toggleClass(root, 'dark-mode', isDark);
        toggleClass(document.body, 'dark-mode', isDark);
        if (darkModeToggle) darkModeToggle.checked = isDark;
        
        // Persistence
        storageSafe.set('darkMode', isDark ? 'enabled' : 'disabled');
        syncLinksWithTheme(theme);

        // Toast Notification (only if requested)
        if (showToastNotify) {
            showToast(
                isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>',
                isDark ? 'تم التفعيل: الوضع الليلي' : 'تم التفعيل: الوضع النهاري',
                isDark ? 'toast-dark' : 'toast-light'
            );
        }
    };

    // Initial theme apply (skip toast on load)
    applyTheme(window.currentTheme || 'light', false);

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function () {
            var theme = darkModeToggle.checked ? 'dark' : 'light';
            applyTheme(theme, true);
        });
    }

    if (toggleWrapper) {
        toggleWrapper.addEventListener('click', function (e) {
            if (darkModeToggle && e.target !== darkModeToggle) {
                darkModeToggle.click();
            }
        });
    }

    // 2. Error Message Handling
    var errorNotice = document.getElementById('errorNotice');
    if (errorNotice) {
        var errorSpans = errorNotice.getElementsByTagName('span');
        if (errorSpans.length > 0) {
            var errorText = errorSpans[0].textContent || errorSpans[0].innerText || '';
            if (errorText.trim() !== '' && errorText.indexOf('$(') === -1) {
                addClass(errorNotice, 'show');
            }
        }
    }

    // 3. Clock Handling
    var clockDisplay = document.getElementById('clockDisplay');
    var datetimeTicker = document.getElementById('datetimeTicker');

    function updateClock() {
        var now = new Date();
        
        if (clockDisplay) {
            var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
            h = h < 10 ? '0' + h : h; m = m < 10 ? '0' + m : m; s = s < 10 ? '0' + s : s;
            clockDisplay.innerHTML = h + ':' + m + ':' + s;
        }

        if (datetimeTicker) {
            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            var dateTimeString = now.toLocaleDateString('ar-YE', options).replace(/،/g, ' | الساعة الان');
            datetimeTicker.innerHTML = dateTimeString;
        }
    }

    if (clockDisplay || datetimeTicker) {
        setInterval(updateClock, 1000);
        updateClock();
    }

    // 4. Loading States
    var allButtons = document.getElementsByTagName('button');
    var submitButtons = [];
    for (var k = 0; k < allButtons.length; k++) {
        if (allButtons[k].getAttribute('type') === 'submit') {
            submitButtons.push(allButtons[k]);
        }
    }

    for (var l = 0; l < submitButtons.length; l++) {
        (function(btn) {
            var form = findClosest(btn, 'form');
            if (form && (!form.name || form.name.indexOf('search') === -1)) {
                form.addEventListener('submit', function () {
                    if (!btn.disabled) {
                        var originalContent = btn.innerHTML;
                        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...';
                        addClass(btn, 'loading');
                        btn.style.pointerEvents = 'none';
                        
                        var card = document.querySelector ? document.querySelector('.card-container') : document.getElementsByClassName('card-container')[0];
                        if (card) card.style.opacity = '0.8';
                        
                        setTimeout(function () {
                            btn.innerHTML = originalContent;
                            removeClass(btn, 'loading');
                            btn.style.pointerEvents = 'auto';
                            if (card) card.style.opacity = '1';
                        }, 4000);
                    }
                });
            }
        })(submitButtons[l]);
    }

    // 5. WhatsApp Integration
    window.buyPackage = function (name, details) {
        var phone = "967739367154";
        var message = "مرحباً عزيز نت، أود شراء " + name + " (" + details + ").";
        window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(message), '_blank');
    };

    // 6. Navigation Logic
    var statusNavContainer = document.getElementById('statusNavContainer');
    var headerHomeBtn = document.getElementById('headerHomeBtn');

    if (statusNavContainer) {
        var referrer = document.referrer || '', searchSearch = window.location.search || '';
        var isFromStatus = referrer.indexOf('status.html') !== -1 || searchSearch.indexOf('origin=status') !== -1;
        var isFromLogin = referrer.indexOf('index.html') !== -1 || (referrer === '' && !isFromStatus);
        var homeCardBtn = document.getElementById('pricesHomeCardBtn'), statusCardBtn = document.getElementById('pricesStatusCardBtn');

        if (isFromStatus) {
            statusNavContainer.style.display = 'flex';
            if (homeCardBtn) homeCardBtn.style.display = 'none';
            if (headerHomeBtn) headerHomeBtn.style.display = 'none';
            if (statusCardBtn) statusCardBtn.style.display = 'inline-block';
        } else if (isFromLogin) {
            statusNavContainer.style.display = 'flex';
            if (statusCardBtn) statusCardBtn.style.display = 'none';
            if (homeCardBtn) homeCardBtn.style.display = 'inline-block';
            if (headerHomeBtn) headerHomeBtn.style.display = 'inline-block';
        } else {
            statusNavContainer.style.display = 'none';
            if (headerHomeBtn) headerHomeBtn.style.display = 'inline-block';
        }
    }

    // 7. Toast Notification System
    var toastEl = null;
    var toastTimer = null;

    function showToast(icon, msg, cls) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast-notification';
            document.body.appendChild(toastEl);
        }
        if (toastTimer) clearTimeout(toastTimer);
        toastEl.className = 'toast-notification' + (cls ? ' ' + cls : '');
        toastEl.innerHTML = (icon || '') + '<span>' + msg + '</span>';
        // Force reflow for re-animation
        toastEl.offsetHeight;
        addClass(toastEl, 'show');
        toastTimer = setTimeout(function () {
            removeClass(toastEl, 'show');
        }, 2500);
    }

    window.showToast = showToast;

    // 8. Ripple Effect on Buttons
    var rippleTargets = document.querySelectorAll
        ? document.querySelectorAll('.btn-primary, .btn-purple-outline, .btn-yellow, .btn-red, .p-btn, .top-action-btn')
        : [];

    for (var r = 0; r < rippleTargets.length; r++) {
        (function (btn) {
            addClass(btn, 'ripple-container');
            btn.addEventListener('click', function (e) {
                var rect = btn.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;
                var ripple = document.createElement('span');
                ripple.className = 'ripple-wave';
                ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;';
                btn.appendChild(ripple);
                setTimeout(function () {
                    if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
                }, 700);
            });
        })(rippleTargets[r]);
    }

    // 9. Status Page: Progress Bar Animate + Refresh Countdown
    var progressFill = document.querySelector ? document.querySelector('.big-progress-fill') : null;
    if (progressFill) {
        // Animate progress on load
        var targetWidth = progressFill.style.width || '17%';
        progressFill.style.width = '0%';
        setTimeout(function () {
            progressFill.style.width = targetWidth;
        }, 300);
    }

    var refreshBarFill = document.getElementById('refreshBarFill');
    var refreshLabel   = document.getElementById('refreshSecondsLeft');
    if (refreshBarFill && refreshLabel) {
        // Read timeout from meta refresh
        var metaTags2 = document.getElementsByTagName('meta');
        var refreshSecs = 60; // default
        for (var m = 0; m < metaTags2.length; m++) {
            if (metaTags2[m].getAttribute('http-equiv') === 'refresh') {
                var cnt = metaTags2[m].getAttribute('content') || '';
                var parsed = parseInt(cnt, 10);
                if (!isNaN(parsed) && parsed > 0) refreshSecs = parsed;
                break;
            }
        }
        if (refreshSecs === 60 || isNaN(refreshSecs)) refreshSecs = 60; // fallback for demo $(...)
        var totalSecs = refreshSecs;
        var remaining = totalSecs;

        function tickRefresh() {
            remaining--;
            if (remaining <= 0) remaining = 0;
            refreshLabel.textContent = remaining;
            var pct = ((totalSecs - remaining) / totalSecs * 100).toFixed(1) + '%';
            refreshBarFill.style.width = pct;
        }

        setInterval(tickRefresh, 1000);
        tickRefresh();
    }

});

