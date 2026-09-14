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

# ── Etapa 1: electronAPI.gerarHolerite existe ──────────────────────────────────
$r = Cdp-Eval "typeof window.electronAPI.gerarHolerite"
if ($r.value -eq "function") {
    Report "OK" "electronAPI.gerarHolerite existe" "typeof = `"$($r.value)`""
} else {
    Report "NG" "electronAPI.gerarHolerite nao encontrado" "typeof = `"$($r.value)`""
    $ws.Dispose(); exit 1
}

# ── Etapa 2: descobrir empresa, folha e funcionario reais (sem payload hardcoded) ──
$discoverExpr = @"
(async function() {
  try {
    var empresas = await window.electronAPI.listEmpresas();
    if (!empresas || empresas.length === 0) return JSON.stringify({ ok: false, motivo: 'nenhuma empresa cadastrada' });
    var empresa = empresas[0];

    var folhas = await window.electronAPI.listFolhas(empresa.id);
    if (!folhas || folhas.length === 0) return JSON.stringify({ ok: false, motivo: 'nenhuma folha cadastrada para a empresa ' + empresa.id });
    var folha = folhas[0];

    var funcionarios = await window.electronAPI.listFuncionarios(empresa.id);
    if (!funcionarios || funcionarios.length === 0) return JSON.stringify({ ok: false, motivo: 'nenhum funcionario cadastrado para a empresa ' + empresa.id });
    var funcionario = funcionarios[0];

    return JSON.stringify({
      ok: true,
      empresaId: empresa.id,
      empresaNome: empresa.razao_social,
      folhaId: folha.id,
      competencia: folha.competencia,
      funcionarioId: funcionario.id,
      funcionarioNome: funcionario.nome
    });
  } catch(e) {
    return JSON.stringify({ ok: false, motivo: String(e) });
  }
})()
"@
$r = Cdp-Eval $discoverExpr
$disc = $null
try { $disc = $r.value | ConvertFrom-Json } catch {}

if ($disc -and $disc.ok -eq $true) {
    Report "OK" "Dados reais descobertos via IPC" "empresa=$($disc.empresaNome) (id=$($disc.empresaId)), folha=$($disc.competencia) (id=$($disc.folhaId)), funcionario=$($disc.funcionarioNome) (id=$($disc.funcionarioId))"
} else {
    $motivo = if ($disc) { $disc.motivo } else { $r.value }
    Report "NG" "Nao foi possivel descobrir empresa/folha/funcionario reais" "motivo = $motivo"
    $ws.Dispose(); exit 1
}

# ── Etapa 3: calcular a folha (idempotente, REC-0004) para garantir holerite existente ──
$calcExpr = "window.electronAPI.calcularFolha($($disc.folhaId)).then(function(r){ return JSON.stringify(r) })"
$r = Cdp-Eval $calcExpr
$calc = $null
try { $calc = $r.value | ConvertFrom-Json } catch {}

if ($calc -and $calc.success -eq $true) {
    Report "OK" "calcularFolha($($disc.folhaId)) executou com sucesso" "success = true"
} else {
    $motivo = if ($calc) { $calc.error } else { $r.value }
    Report "NG" "calcularFolha($($disc.folhaId)) falhou" "error = $motivo"
    $ws.Dispose(); exit 1
}

# ── Etapa 4: gerar PDF do holerite via API real ────────────────────────────────
$payload = @{ folhaId = $disc.folhaId; funcionarioId = $disc.funcionarioId } | ConvertTo-Json -Compress

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
