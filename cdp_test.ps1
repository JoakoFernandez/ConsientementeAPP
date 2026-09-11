$ErrorActionPreference = "SilentlyContinue"

Write-Host "=== CDP TEST: Consientemente App ==="
Write-Host ""

# --- Connection ---
Write-Host "=== STEP 1: Connect to CDP ==="
$pages = (Invoke-WebRequest -UseBasicParsing http://localhost:9222/json -TimeoutSec 5).Content | ConvertFrom-Json
Write-Host "Pages found: $($pages.Count)"
foreach ($pg in $pages) { Write-Host "  - $($pg.type) $($pg.url)" }

$p = $pages | Where-Object { $_.type -eq "page" -and $_.url -like "http://localhost:8081*" } | Select-Object -First 1
if (-not $p) { $p = $pages | Where-Object { $_.type -eq "page" } | Select-Object -First 1 }
Write-Host "Using: $($p.url)"
Write-Host "WS: $($p.webSocketDebuggerUrl)"

$conn = New-Object System.Net.WebSockets.ClientWebSocket
$conn.ConnectAsync([Uri]$p.webSocketDebuggerUrl, [System.Threading.CancellationToken]::None).Wait()
Write-Host "WebSocket connected"
$script:mid = 0

function Send-Cdp {
    param([string]$m, [hashtable]$pa = @{})
    $script:mid++
    $j = @{id=$script:mid; method=$m; params=$pa} | ConvertTo-Json -Depth 10 -Compress
    $b = [Text.Encoding]::UTF8.GetBytes($j)
    $conn.SendAsync((New-Object System.ArraySegment[byte] -ArgumentList @(,$b)), [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).Wait()
    $buf = New-Object byte[] 262144
    $r = $conn.ReceiveAsync((New-Object System.ArraySegment[byte] -ArgumentList @(,$buf)), [Threading.CancellationToken]::None).Result
    return [Text.Encoding]::UTF8.GetString($buf, 0, $r.Count)
}

function EJ {
    param([string]$c)
    $r = Send-Cdp "Runtime.evaluate" @{expression=$c; returnByValue=$true; awaitPromise=$true}
    $pr = $r | ConvertFrom-Json
    if ($pr.result.exceptionDetails) { return "EXC:" + $pr.result.exceptionDetails.exception.description }
    else { return $pr.result.result.value }
}

# --- Navigate to localhost:8081 first (establish origin) ---
Write-Host ""
Write-Host "=== Navigate to localhost:8081 (establish origin) ==="
Send-Cdp "Page.navigate" @{url="http://localhost:8081/"} | Out-Null
Start-Sleep -Seconds 3
$url1 = EJ "window.location.href"
Write-Host "URL after nav: $url1"

# --- Seed localStorage on correct origin ---
Write-Host ""
Write-Host "=== STEP 2: Seed localStorage ==="
$seedResult = EJ @"
(function() {
    try {
        localStorage.removeItem('consientemente_clinic_profile');
        localStorage.removeItem('consientemente_patients');
        localStorage.removeItem('consientemente_sessions');
        localStorage.removeItem('consientemente_payments');
        localStorage.setItem('consientemente_clinic_profile', JSON.stringify([{id:'cp1',name:'Clinica Test',address:'Asuncion',phone:'021',email:'c@c.com',bankAccount:'123',professionalName:'Dr Test'}]));
        localStorage.setItem('consientemente_patients', JSON.stringify([{id:'p1',name:'Juan Perez',dni:'123',bankAccounts:[],ageCategory:'ADULT',age:30,parentsNames:'',regularSchedules:[],paymentFrequency:'MONTHLY',paymentAmount:100000,notes:'',isActive:true,createdAt:'2026-08-29T12:00:00.000Z',updatedAt:'2026-08-29T12:00:00.000Z'}]));
        localStorage.setItem('consientemente_sessions', JSON.stringify([]));
        localStorage.setItem('consientemente_payments', JSON.stringify([]));
        return 'SEED_OK';
    } catch(e) { return 'SEED_ERR: ' + e.message; }
})()
"@
Write-Host "Seed: $seedResult"

# Verify
$verifyResult = EJ "(function(){ return JSON.stringify({c:!!localStorage.getItem('consientemente_clinic_profile'),p:!!localStorage.getItem('consientemente_patients'),s:!!localStorage.getItem('consientemente_sessions'),pay:!!localStorage.getItem('consientemente_payments')}); })()"
Write-Host "Verify: $verifyResult"

# --- Reload to pick up seeded data ---
Write-Host ""
Write-Host "=== Reload after seeding ==="
Send-Cdp "Page.navigate" @{url="http://localhost:8081/"} | Out-Null
Start-Sleep -Seconds 5
$url2 = EJ "window.location.href"
Write-Host "URL after reload: $url2"

$pageText1 = EJ "document.body.innerText.substring(0, 500)"
Write-Host "Page text: $pageText1"

# --- Setup error hooks ---
Write-Host ""
Write-Host "=== STEP 3: Setup error hooks ==="
$hookResult = EJ @"
(function() {
    window.__errs = [];
    window.__alertMsg = [];
    window.addEventListener('unhandledrejection', function(e) {
        window.__errs.push('unhandledrejection: ' + (e.reason ? (e.reason.message || e.reason.toString()) : 'unknown'));
    });
    window.addEventListener('error', function(e) {
        window.__errs.push('error: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
    });
    var origAlert = window.alert;
    window.alert = function(msg) {
        window.__alertMsg.push(String(msg));
        origAlert.call(window, msg);
    };
    return 'HOOKS_OK';
})()
"@
Write-Host "Hooks: $hookResult"

# --- Navigate to calendar ---
Write-Host ""
Write-Host "=== STEP 6: Click calendar nav ==="
$calResult = EJ @"
(function() {
    // React Native Web renders TouchableOpacity as div[role="button"]
    var els = document.querySelectorAll('[role="button"], button, a');
    for (var i = 0; i < els.length; i++) {
        var txt = (els[i].textContent || '').trim();
        if (txt === 'Calendario') {
            els[i].click();
            return 'CAL_OK';
        }
    }
    // Fallback: try any element
    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
        if ((all[i].textContent || '').trim() === 'Calendario' && all[i].children.length === 0) {
            all[i].click();
            return 'CAL_OK_FALLBACK';
        }
    }
    return 'CAL_FAIL';
})()
"@
Write-Host "Calendar click: $calResult"

Start-Sleep -Seconds 3
$url3 = EJ "window.location.href"
Write-Host "URL: $url3"

$pageText2 = EJ "document.body.innerText.substring(0, 1000)"
Write-Host "Page text: $pageText2"

# --- Click Nueva Sesion button ---
Write-Host ""
Write-Host "=== STEP 8: Click Nueva Sesion ==="
$nuevaResult = EJ @"
(function() {
    // Search all elements for text containing "Nueva Sesi"
    var all = document.querySelectorAll('*');
    var candidates = [];
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        var directText = '';
        for (var j = 0; j < el.childNodes.length; j++) {
            if (el.childNodes[j].nodeType === 3) directText += el.childNodes[j].textContent;
        }
        var txt = directText.trim();
        if (txt.indexOf('Nueva Sesi') >= 0 || txt.indexOf('+ Nueva') >= 0) {
            candidates.push({tag:el.tagName, role:el.getAttribute('role'), text:txt.substring(0,50), idx:i});
        }
    }
    // Also check innerText for parent elements
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (el.children.length <= 2) {
            var it = (el.innerText || '').trim();
            if (it.indexOf('Nueva Sesi') >= 0 && it.length < 30) {
                candidates.push({tag:el.tagName, role:el.getAttribute('role'), text:it.substring(0,50), idx:i});
            }
        }
    }
    // Try clicking the first candidate
    if (candidates.length > 0) {
        var el = all[candidates[0].idx];
        el.click();
        return 'NUEVA_OK: ' + JSON.stringify(candidates[0]);
    }
    return 'NUEVA_FAIL: candidates=' + candidates.length;
})()
"@
Write-Host "Nueva Sesion: $nuevaResult"

# --- Wait for modal ---
Start-Sleep -Seconds 2
Write-Host ""
Write-Host "=== STEP 9: Wait for modal ==="
$modalCheck = EJ @"
(function() {
    // Check for modal overlay or dialog
    var modals = document.querySelectorAll('[role="dialog"]');
    if (modals.length > 0) return 'MODAL_DIALOG: ' + modals.length;
    var overlays = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    if (overlays.length > 0) return 'MODAL_FIXED: ' + overlays.length;
    // Check for text that indicates modal opened
    var body = document.body.innerText;
    if (body.indexOf('Seleccionar Paciente') >= 0 || body.indexOf('Nueva Sesi') >= 0) {
        var idx = body.indexOf('Nueva Sesi');
        if (idx >= 0) return 'MODAL_TEXT_OK: found at ' + idx;
    }
    return 'MODAL_CHECK: bodyLen=' + body.length;
})()
"@
Write-Host "Modal: $modalCheck"

$pageText3 = EJ "document.body.innerText.substring(0, 2000)"
Write-Host "Page text: $pageText3"

# --- Click Juan Perez ---
Write-Host ""
Write-Host "=== STEP 10: Click Juan Perez ==="
$juanResult = EJ @"
(function() {
    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        // Check direct text content
        var directText = '';
        for (var j = 0; j < el.childNodes.length; j++) {
            if (el.childNodes[j].nodeType === 3) directText += el.childNodes[j].textContent;
        }
        if (directText.trim() === 'Juan Perez') {
            el.click();
            return 'JUAN_OK_direct: tag=' + el.tagName + ' role=' + el.getAttribute('role');
        }
    }
    // Broader: check innerText of leaf elements
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (el.children.length === 0 && (el.innerText || '').trim() === 'Juan Perez') {
            el.click();
            return 'JUAN_OK_leaf: tag=' + el.tagName + ' role=' + el.getAttribute('role');
        }
    }
    // Very broad
    for (var i = 0; i < all.length; i++) {
        if ((all[i].innerText || '').indexOf('Juan Perez') >= 0 && all[i].children.length <= 3) {
            all[i].click();
            return 'JUAN_OK_broad: tag=' + all[i].tagName + ' children=' + all[i].children.length;
        }
    }
    return 'JUAN_FAIL';
})()
"@
Write-Host "Juan Perez: $juanResult"

Start-Sleep -Seconds 1

# --- Click Guardar ---
Write-Host ""
Write-Host "=== STEP 12: Click Guardar ==="
$guardarResult = EJ @"
(function() {
    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        var directText = '';
        for (var j = 0; j < el.childNodes.length; j++) {
            if (el.childNodes[j].nodeType === 3) directText += el.childNodes[j].textContent;
        }
        var txt = directText.trim();
        if (txt === 'Guardar') {
            el.click();
            return 'GUARDAR_OK: tag=' + el.tagName + ' role=' + el.getAttribute('role');
        }
    }
    for (var i = 0; i < all.length; i++) {
        if ((all[i].innerText || '').trim() === 'Guardar' && all[i].children.length === 0) {
            all[i].click();
            return 'GUARDAR_OK2: tag=' + all[i].tagName;
        }
    }
    return 'GUARDAR_FAIL';
})()
"@
Write-Host "Guardar: $guardarResult"

Start-Sleep -Seconds 3

# --- Final checks ---
Write-Host ""
Write-Host "=== STEP 14: Final checks ==="
$urlFinal = EJ "window.location.href"
Write-Host "Final URL: $urlFinal"

$errs = EJ "JSON.stringify(window.__errs || [])"
Write-Host "window.__errs: $errs"

$alerts = EJ "JSON.stringify(window.__alertMsg || [])"
Write-Host "window.__alertMsg: $alerts"

$sessions = EJ "localStorage.getItem('consientemente_sessions')"
Write-Host "consientemente_sessions: $sessions"

$pageTextFinal = EJ "document.body.innerText.substring(0, 2000)"
Write-Host "Page text: $pageTextFinal"

Write-Host ""
Write-Host "=== TEST COMPLETE ==="
$conn.CloseAsync([Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "", [Threading.CancellationToken]::None).Wait()
Write-Host "WebSocket closed"
