# test-holerite.ps1 — Testa geração de PDF holerite via CDP

$CDP = "http://localhost:9222"

function Report($status, $label, $evidence) {
    $icon = if ($status -eq "OK") { "[OK]" } else { "[NG]" }
    Write-Host "$icon  $label"
    Write-Host "     $evidence"
    Write-Host ""
}

# ── Pegar WebSocket URL do renderer ──────────────────────────────────────────
$targets  = Invoke-RestMethod "$CDP/json" -ErrorAction Stop
$renderer = $targets | Where-Object { $_.url -like "*localhost:5173*" } | Select-Object -First 1
if (-not $renderer) { Write-Error "Renderer nao encontrado"; exit 1 }
$wsUrl = $renderer.webSocketDebuggerUrl

Write-Host ""
Write-Host "=== Teste Holerite PDF =========================================="
Write-Host "Target: $($renderer.title)"
Write-Host ""

# ── Conectar WebSocket ────────────────────────────────────────────────────────
$ws = [System.Net.WebSockets.ClientWebSocket]::new()
$ct = [System.Threading.CancellationToken]::None
$ws.ConnectAsync([uri]$wsUrl, $ct).Wait()

$msgId = 1

function Cdp-Eval($expr) {
    $id = $script:msgId++
    $req = @{
        id     = $id
        method = "Runtime.evaluate"
        params = @{
            expression    = $expr
            awaitPromise  = $true
            returnByValue = $true
        }
    } | ConvertTo-Json -Depth 5 -Compress

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($req)
    $seg   = [System.ArraySegment[byte]]::new($bytes)
    $ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

    $recvBuf = [byte[]]::new(131072)
    $recvSeg = [System.ArraySegment[byte]]::new($recvBuf)
    $limit   = 20
    while ($limit-- -gt 0) {
        $result = $ws.ReceiveAsync($recvSeg, $ct).GetAwaiter().GetResult()
        $json   = [System.Text.Encoding]::UTF8.GetString($recvBuf, 0, $result.Count)
        try {
            $msg = $json | ConvertFrom-Json
            if ($msg.id -eq $id) { return $msg.result.result }
        } catch {}
    }
    return $null
}

# ── Etapa 1: gerarHolerite existe no electronAPI ──────────────────────────────
$r = Cdp-Eval "typeof window.electronAPI.gerarHolerite"
if ($r.value -eq "function") {
    Report "OK" "electronAPI.gerarHolerite existe" "typeof = `"$($r.value)`""
} else {
    Report "NG" "electronAPI.gerarHolerite nao encontrado" "typeof = `"$($r.value)`""
    $ws.Dispose(); exit 1
}

# ── Etapa 2: gerar PDF com payload hardcoded ──────────────────────────────────
$payload = @{
    funcionarioId = 2
    empresaId     = 2
    competencia   = "2026-05"
    rubricas      = @(
        @{ codigo = "0001"; descricao = "Salario Base"; referencia = "220"; proventos = 3500.00; descontos = $null }
    )
    totais = @{ vencimentos = 3500.00; descontos = 409.96; liquido = 3090.04 }
    bases  = @{
        salarioBase = 3500.00; baseInss = 3500.00; baseFgts = 3500.00
        fgtsMes     = 280.00;  baseIrrf = 3186.59; faixaIrrf = "15%"
    }
} | ConvertTo-Json -Depth 5 -Compress

$expr = @"
(async function() {
  try {
    var r = await window.electronAPI.gerarHolerite($payload);
    return JSON.stringify(r);
  } catch(e) {
    return JSON.stringify({ success: false, error: String(e) });
  }
})()
"@

$r = Cdp-Eval $expr

$parsed = $null
try { $parsed = $r.value | ConvertFrom-Json } catch {}

if ($parsed -and $parsed.success -eq $true -and $parsed.data.filePath -match '\.pdf$') {
    Report "OK" "gerarHolerite retornou filePath valido" "filePath = $($parsed.data.filePath)"
} elseif ($parsed) {
    Report "NG" "gerarHolerite falhou" "error = $($parsed.error)"
} else {
    Report "NG" "gerarHolerite resposta invalida" "raw = $($r.value)"
}

$ws.Dispose()
Write-Host "================================================================="
Write-Host ""




