# seed-test.ps1 -- Insere dados de teste via CDP (app Electron deve estar aberto)

$CDP = "http://localhost:9222"

function Report($status, $label, $evidence) {
    $icon = if ($status -eq "OK") { "[OK]" } else { "[NG]" }
    Write-Host "$icon  $label"
    Write-Host "     $evidence"
    Write-Host ""
}

# -- Conectar ao renderer -----------------------------------------------------
$targets  = Invoke-RestMethod "$CDP/json" -ErrorAction Stop
$renderer = $targets | Where-Object { $_.url -like "*localhost:5173*" } | Select-Object -First 1
if (-not $renderer) { Write-Error "Renderer nao encontrado -- app esta aberto?"; exit 1 }
$wsUrl = $renderer.webSocketDebuggerUrl

Write-Host ""
Write-Host "=== Seed Dados de Teste ========================================="
Write-Host "Target: $($renderer.title)"
Write-Host ""

$ws = [System.Net.WebSockets.ClientWebSocket]::new()
$ct = [System.Threading.CancellationToken]::None
$ws.ConnectAsync([uri]$wsUrl, $ct).Wait()

$msgId = 1

function Cdp-Eval($expr) {
    $id  = $script:msgId++
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
    $ws.SendAsync([System.ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

    $buf   = [byte[]]::new(131072)
    $seg   = [System.ArraySegment[byte]]::new($buf)
    $limit = 20
    while ($limit-- -gt 0) {
        $res  = $ws.ReceiveAsync($seg, $ct).GetAwaiter().GetResult()
        $json = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Count)
        try {
            $msg = $json | ConvertFrom-Json
            if ($msg.id -eq $id) { return $msg.result.result }
        } catch {}
    }
    return $null
}

# -- 1. Criar empresa ---------------------------------------------------------
$expr = @"
(async function() {
  var res = await window.electronAPI.createEmpresa({
    razao_social: 'Empresa Teste SA',
    cnpj: '12345678000190',
    uf: 'SP',
    cidade: 'Sao Paulo',
    logradouro: 'Rua Teste',
    numero: '100'
  });
  return JSON.stringify(res);
})()
"@
$r = Cdp-Eval $expr
$parsed = $null; try { $parsed = $r.value | ConvertFrom-Json } catch {}
if ($parsed -and $parsed.success) {
    $empresaId = $parsed.data.id
    Report "OK" "Empresa criada" "id=$empresaId razao_social=$($parsed.data.razao_social)"
} else {
    Report "NG" "Falha ao criar empresa" "$($r.value)"
    $ws.Dispose(); exit 1
}

# -- 2. Criar funcionario Joao ------------------------------------------------
$expr = @"
(async function() {
  var res = await window.electronAPI.createFuncionario({
    empresa_id: $empresaId,
    nome: 'Joao Silva',
    cpf: '12345678901',
    salario_base: 3500,
    data_admissao: '2024-01-01',
    cargo: 'Analista',
    status: 'ativo'
  });
  return JSON.stringify(res);
})()
"@
$r = Cdp-Eval $expr
$parsed = $null; try { $parsed = $r.value | ConvertFrom-Json } catch {}
if ($parsed -and $parsed.success) {
    $joaoId = $parsed.data.id
    Report "OK" "Funcionario Joao criado" "id=$joaoId"
} else {
    Report "NG" "Falha ao criar Joao" "$($r.value)"
    $ws.Dispose(); exit 1
}

# -- 3. Criar funcionaria Maria -----------------------------------------------
$expr = @"
(async function() {
  var res = await window.electronAPI.createFuncionario({
    empresa_id: $empresaId,
    nome: 'Maria Costa',
    cpf: '98765432100',
    salario_base: 5000,
    data_admissao: '2024-01-01',
    cargo: 'Gerente',
    status: 'ativo'
  });
  return JSON.stringify(res);
})()
"@
$r = Cdp-Eval $expr
$parsed = $null; try { $parsed = $r.value | ConvertFrom-Json } catch {}
if ($parsed -and $parsed.success) {
    $mariaId = $parsed.data.id
    Report "OK" "Funcionaria Maria criada" "id=$mariaId"
} else {
    Report "NG" "Falha ao criar Maria" "$($r.value)"
    $ws.Dispose(); exit 1
}

# -- 4. Criar folha 2026-05 ---------------------------------------------------
$expr = @"
(async function() {
  var res = await window.electronAPI.createFolha({
    empresa_id: $empresaId,
    competencia: '2026-05',
    status: 'aberta'
  });
  return JSON.stringify(res);
})()
"@
$r = Cdp-Eval $expr
$parsed = $null; try { $parsed = $r.value | ConvertFrom-Json } catch {}
if ($parsed -and $parsed.success) {
    $folhaId = $parsed.data.id
    Report "OK" "Folha 2026-05 criada" "id=$folhaId"
} else {
    Report "NG" "Falha ao criar folha" "$($r.value)"
    $ws.Dispose(); exit 1
}

# -- 5. Lancamento Joao -------------------------------------------------------
$expr = @"
(async function() {
  var res = await window.electronAPI.addLancamento({
    folha_id: $folhaId,
    funcionario_id: $joaoId,
    empresa_id: $empresaId,
    rubrica_codigo: '0001',
    rubrica_nome: 'Salario Base',
    rubrica_tipo: 'provento',
    referencia: 220,
    valor: 3500
  });
  return JSON.stringify(res);
})()
"@
$r = Cdp-Eval $expr
$parsed = $null; try { $parsed = $r.value | ConvertFrom-Json } catch {}
if ($parsed -and $parsed.success) {
    Report "OK" "Lancamento Joao (0001) inserido" "valor=3500"
} else {
    Report "NG" "Falha lancamento Joao" "$($r.value)"
}

# -- 6. Lancamento Maria ------------------------------------------------------
$expr = @"
(async function() {
  var res = await window.electronAPI.addLancamento({
    folha_id: $folhaId,
    funcionario_id: $mariaId,
    empresa_id: $empresaId,
    rubrica_codigo: '0001',
    referencia: 220,
    valor: 5000
  });
  return JSON.stringify(res);
})()
"@
$r = Cdp-Eval $expr
$parsed = $null; try { $parsed = $r.value | ConvertFrom-Json } catch {}
if ($parsed -and $parsed.success) {
    Report "OK" "Lancamento Maria (0001) inserido" "valor=5000"
} else {
    Report "NG" "Falha lancamento Maria" "$($r.value)"
}

# -- 7. Calcular folha --------------------------------------------------------
$expr = @"
(async function() {
  var res = await window.electronAPI.calcularFolha($folhaId);
  return JSON.stringify(res);
})()
"@
$r = Cdp-Eval $expr
$parsed = $null; try { $parsed = $r.value | ConvertFrom-Json } catch {}
if ($parsed -and $parsed.success) {
    Report "OK" "Folha calculada" "status=$($parsed.data.status) liquido_total=$($parsed.data.total_liquido)"
} else {
    Report "NG" "Falha ao calcular folha" "$($r.value)"
}

$ws.Dispose()
Write-Host "================================================================="
Write-Host "  empresaId=$empresaId  folhaId=$folhaId  joaoId=$joaoId  mariaId=$mariaId"
Write-Host ""
