$ErrorActionPreference = 'Stop'
$blogRoot = $PSScriptRoot
$blogNode = (Get-Command node.exe).Source
$blogPython = Join-Path $blogRoot '.venv\Scripts\python.exe'
$blogLogs = Join-Path $blogRoot '.local\logs'
New-Item -ItemType Directory -Path $blogLogs -Force | Out-Null
@{ api_port = 5317 } | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $blogRoot 'my-blog-manager\public\backend_config.json')
$blogDeployFile = Join-Path $blogRoot 'my-blog-manager\data\deploy_config.json'
if (-not (Test-Path -LiteralPath $blogDeployFile)) {
    @{ blogPath = (Join-Path $blogRoot 'XHBlogs'); sourceRepoUrl = 'https://github.com/LyraSelene/Lyra-blog.git'; sourceBranch = 'main'; staticRepoUrl = ''; staticBranch = 'gh-pages' } | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath $blogDeployFile
}

function Start-BlogService($ServiceName, $ServiceDirectory, $Program, $ServiceArguments, $ServicePort) {
    $blogSocket = [System.Net.Sockets.TcpClient]::new()
    try { $blogSocket.Connect('127.0.0.1', $ServicePort); return } catch {} finally { $blogSocket.Dispose() }
    $blogProcess = Start-Process -FilePath $Program -ArgumentList $ServiceArguments -WorkingDirectory $ServiceDirectory -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $blogLogs "$ServiceName.log") -RedirectStandardError (Join-Path $blogLogs "$ServiceName.error.log")
    $blogProcess.Id | Set-Content -LiteralPath (Join-Path $blogLogs "$ServiceName.pid")
}

Start-BlogService 'site' (Join-Path $blogRoot 'XHBlogs') $blogNode @('node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3100') 3100
Start-BlogService 'manager' (Join-Path $blogRoot 'my-blog-manager') $blogNode @('node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3101') 3101
Start-BlogService 'api' (Join-Path $blogRoot 'my-blog-manager') $blogPython @('-m','uvicorn','cms_core.main:app','--host','127.0.0.1','--port','5317') 5317

Start-Process 'http://127.0.0.1:3100/'
Start-Process 'http://127.0.0.1:3101/settings'
Write-Host 'Blog: http://127.0.0.1:3100/'
Write-Host 'Manager: http://127.0.0.1:3101/settings'
Write-Host "Logs: $blogLogs"
