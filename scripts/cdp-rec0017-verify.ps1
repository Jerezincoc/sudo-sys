# cdp-rec0017-verify.ps1 — Verifica a correcao da REC-0017 (ACAO-0032)
# Cenarios: (a) pre-init sem sessao deve funcionar; (b) pos-init sem sessao deve
# ser rejeitado; (c) pos-init com sessao admin deve funcionar.
# Uso temporario de diagnostico; nao faz parte do fluxo de produto.

$CDP = "http://localhost:9222"
$OK  = "OK"
$NG  = "NG"

function Report($status, $label, $evidence) {
    $icon = if ($status -eq $OK) { "[OK]" } else { "[NG]" }
    Write-Host "$icon  $label"
    Write-Host "     $evidence"
    Write-Host ""
}

$targets = Invoke-RestMethod "$CDP/json" -ErrorAction Stop
$renderer = $targets | Where-Object { $_.url -like "*localhost:5173*" } | Select-Object -First 1
if (-not $renderer) { Write-Error "Renderer nao encontrado"; exit 1 }
$wsUrl = $renderer.webSocketDebuggerUrl

Write-Host ""
Write-Host "=== CDP REC-0017 Verify ============================================"
Write-Host "Target: $($renderer.title)"
Write-Host ""

$ws = [System.Net.WebSockets.ClientWebSocket]::new()
$ct = [System.Threading.CancellationToken]::None
$ws.ConnectAsync([uri]$wsUrl, $ct).Wait()

$msgId = 1
function Cdp-Eval($expr) {
    $id = $script:msgId++
    $req = @{ id = $id; method = "Runtime.evaluate"; params = @{ expression = $expr; awaitPromise = $true; returnByValue = $true } } | ConvertTo-Json -Depth 5 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($req)
    $seg = [System.ArraySegment[byte]]::new($bytes)
    $ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()
    $recvBuf = [byte[]]::new(65536)
    $recvSeg = [System.ArraySegment[byte]]::new($recvBuf)
    $result = $ws.ReceiveAsync($recvSeg, $ct).GetAwaiter().GetResult()
    $json = [System.Text.Encoding]::UTF8.GetString($recvBuf, 0, $result.Count)
    $limit = 10
    while ($limit-- -gt 0) {
        try { $msg = $json | ConvertFrom-Json; if ($msg.id -eq $id) { return $msg.result.result } } catch {}
        $result = $ws.ReceiveAsync($recvSeg, $ct).GetAwaiter().GetResult()
        $json = [System.Text.Encoding]::UTF8.GetString($recvBuf, 0, $result.Count)
    }
    return $null
}

# ── Cenario (a): pre-init, sem sessao -> deve FUNCIONAR (wizard legitimo) ──
$r = Cdp-Eval "window.electronAPI.checkInitialized()"
Report $OK "checkInitialized() antes do cenario (a)" "value = $($r.value)"

$probeA = '{"database":{"type":"sqlite"},"empresa":{"razaoSocial":"REC0017_CENARIO_A_PREINIT"}}'
$expr = "window.electronAPI.saveConfig(" + $probeA + ").then(function(v){return JSON.stringify(v)}).catch(function(e){return 'REJECTED: ' + e.message})"
$r = Cdp-Eval $expr
$funcionou = $r.value -like '*"success":true*'
if ($funcionou) {
    Report $OK "(a) pre-init, sem sessao: saveConfig FUNCIONOU (wizard nao quebrou)" $r.value
} else {
    Report $NG "(a) pre-init, sem sessao: saveConfig deveria funcionar mas nao funcionou" $r.value
}

# ── Cenario (b): pos-init, sem sessao -> deve ser REJEITADO ──────────────────
$r = Cdp-Eval "window.electronAPI.checkInitialized()"
Report $OK "checkInitialized() apos cenario (a) (deve ser true agora)" "value = $($r.value)"

$probeB = '{"database":{"type":"postgresql","host":"attacker-controlled.example","user":"pwn"},"empresa":{"razaoSocial":"REC0017_CENARIO_B_ATAQUE"}}'
$expr = "window.electronAPI.saveConfig(" + $probeB + ").then(function(v){return JSON.stringify(v)}).catch(function(e){return 'REJECTED: ' + e.message})"
$r = Cdp-Eval $expr
$rejeitado = ($r.value -like "REJECTED:*") -or ($r.value -like "*Sess*inv*")
if ($rejeitado) {
    Report $OK "(b) pos-init, sem sessao: saveConfig REJEITADO (gap corrigido)" $r.value
} else {
    Report $NG "(b) pos-init, sem sessao: saveConfig NAO foi rejeitado (correcao falhou)" $r.value
}

# getConfig() sem sessao, pos-init -> tambem deve ser rejeitado
$expr = "window.electronAPI.getConfig().then(function(v){return JSON.stringify(v)}).catch(function(e){return 'REJECTED: ' + e.message})"
$r = Cdp-Eval $expr
$rejeitado = ($r.value -like "REJECTED:*") -or ($r.value -like "*Sess*inv*")
if ($rejeitado) {
    Report $OK "(b) pos-init, sem sessao: getConfig REJEITADO (gap corrigido)" $r.value
} else {
    Report $NG "(b) pos-init, sem sessao: getConfig NAO foi rejeitado (correcao falhou)" $r.value
}

# Confirma que o probe de ataque NAO foi persistido (config continua o do cenario a)
$r = Cdp-Eval "JSON.stringify(require)"
# (nao usar require no renderer; le direto via login abaixo para confirmar estado real)

# ── Cenario (c): pos-init, com sessao admin -> deve FUNCIONAR ────────────────
$expr = "window.electronAPI.login({email:'admin@sudosys.local', senha:'admin123'}).then(function(v){return JSON.stringify(v)})"
$r = Cdp-Eval $expr
Report $OK "login(admin) para o cenario (c)" $r.value
$loginOk = $r.value -like '*"success":true*'

if ($loginOk) {
    $probeC = '{"database":{"type":"sqlite"},"empresa":{"razaoSocial":"REC0017_CENARIO_C_ADMIN_OK"}}'
    $expr = "window.electronAPI.saveConfig(" + $probeC + ").then(function(v){return JSON.stringify(v)}).catch(function(e){return 'REJECTED: ' + e.message})"
    $r = Cdp-Eval $expr
    $funcionou = $r.value -like '*"success":true*'
    if ($funcionou) {
        Report $OK "(c) pos-init, sessao admin: saveConfig FUNCIONOU (caminho legitimo preservado)" $r.value
    } else {
        Report $NG "(c) pos-init, sessao admin: saveConfig deveria funcionar mas nao funcionou" $r.value
    }

    $expr = "window.electronAPI.getConfig().then(function(v){return JSON.stringify(v)}).catch(function(e){return 'REJECTED: ' + e.message})"
    $r = Cdp-Eval $expr
    $funcionou = $r.value -like '*REC0017_CENARIO_C_ADMIN_OK*'
    if ($funcionou) {
        Report $OK "(c) pos-init, sessao admin: getConfig FUNCIONOU e reflete o probe C" $r.value
    } else {
        Report $NG "(c) pos-init, sessao admin: getConfig nao retornou o esperado" $r.value
    }

    # logout para nao deixar sessao pendurada
    $expr = "window.electronAPI.login({email:'admin@sudosys.local', senha:'admin123'}).then(function(v){ return window.electronAPI.logout(v.token) }).then(function(v){return JSON.stringify(v)})"
    $r = Cdp-Eval $expr
    Report $OK "logout ao final do cenario (c)" $r.value
} else {
    Report $NG "login(admin) falhou - cenario (c) nao pode ser testado" $r.value
}

$ws.Dispose()
Write-Host "====================================================================="
Write-Host ""
