/**
 * MikroTik Standalone Demo Simulator (Legacy Compatible ES5/ES3)
 * 
 * This script runs only when testing the pages locally without a MikroTik router.
 * It replaces MikroTik variables $(...) with dummy data, and intercepts
 * form submissions to redirect to local html files (login -> alogin -> status -> logout).
 */

document.addEventListener('DOMContentLoaded', function () {
    // Check if we are running locally (file:// or localhost)
    var isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.indexOf('github.io') !== -1;

    if (isLocal) {
        if (window.console && console.log) console.log("🛠️ Running in Local Demo Mode (MikroTik Simulator)");

        // 1. Replace Variables in Text Nodes
        var dummyData = {
            'username': 'Aziz_VIP',
            'ip': '192.168.88.25',
            'mac': 'AA:BB:CC:DD:EE:FF',
            'session-time-left': '02:30:00',
            'uptime': '05:45:12',
            'bytes-in-nice': '1.2 GB',
            'bytes-out-nice': '450 MB',
            'link-login-only': 'index.html',
            'link-login': 'index.html',
            'link-logout': 'logout.html',
            'link-orig': 'status.html',
            'link-status': 'status.html',
            'error': 'سيتم تسجيل الدخول عبر اي كود', // Set to 'كلمة المرور غير صحيحة' to test error states
            'link-hostname': 'عزيز نت',
        };

        // Walk through all text nodes and replace $(var)
        var walkTextNodes = function (node) {
            if (node.nodeType === 3) { // Text node
                var text = node.nodeValue;
                // Simple regex to match $(var_name)
                var regex = /\$\(([^)]+)\)/g;
                if (text.match(regex)) {
                    node.nodeValue = text.replace(regex, function (match, p1) {
                        return dummyData[p1] !== undefined ? dummyData[p1] : '';
                    });
                }
            } else {
                for (var i = 0; i < node.childNodes.length; i++) {
                    walkTextNodes(node.childNodes[i]);
                }
            }
        };

        walkTextNodes(document.body);

        // 2. Replace Variables in input values
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.value && input.value.indexOf('$(') === 0) {
                var varName = input.value.replace('$(', '').replace(')', '');
                input.value = dummyData[varName] !== undefined ? dummyData[varName] : '';
            }
        }

        // Helper: build URL with theme param if dark mode is on
        var demoUrl = function (page) {
            var t = '';
            try {
                var isDark = false;
                if (window.currentTheme === 'dark') isDark = true;
                else {
                    var stored = localStorage.getItem('darkMode');
                    if (stored === 'enabled') isDark = true;
                }
                if (isDark) t = '?theme=dark';
            } catch (e) { }
            return page + t;
        };

        // 3. Intercept Form Submissions for Demo Flow
        var forms = document.getElementsByTagName('form');
        for (var j = 0; j < forms.length; j++) {
            (function (form) {
                form.addEventListener('submit', function (e) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = false;

                    var currentPath = window.location.pathname;

                    setTimeout(function () {
                        if (currentPath.indexOf('index.html') !== -1 || currentPath.indexOf('.html') === -1) {
                            window.location.href = demoUrl('aindex.html');
                        } else if (currentPath.indexOf('status.html') !== -1) {
                            window.location.href = demoUrl('logout.html');
                        } else if (currentPath.indexOf('logout.html') !== -1 || currentPath.indexOf('error.html') !== -1) {
                            window.location.href = demoUrl('index.html');
                        } else {
                            window.location.href = demoUrl('status.html');
                        }
                    }, 800); // Small delay to show loading animation
                });
            })(forms[j]);
        }

        // 4. Handle "alogin" automatic redirect in Demo Mode
        if (window.location.pathname.indexOf('aindex.html') !== -1) {
            setTimeout(function () {
                window.location.href = demoUrl('status.html');
            }, 3000);
        }

        // Remove conditional display styles based on MikroTik `$(if ...)` output that didn't render
        var errorNotice = document.getElementById('errorNotice');
        if (errorNotice) {
            if (dummyData['error'] === '') {
                errorNotice.style.display = 'none';
            } else {
                errorNotice.style.display = 'flex';
                var span = errorNotice.getElementsByTagName('span')[0];
                if (span) span.innerHTML = dummyData['error'];
            }
        }
    }
});
