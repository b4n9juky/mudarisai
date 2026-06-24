$pw = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "postgres" }
$env:PGPASSWORD = $pw

$migrations = Get-ChildItem -Path "$PSScriptRoot" -Filter "*.sql" | Sort-Object Name
foreach ($m in $migrations) {
  Write-Host "Running migration: $($m.Name)..."
  psql -h localhost -U postgres -d mudarisai -f $m.FullName
  if ($?) {
    Write-Host "  OK" -ForegroundColor Green
  } else {
    Write-Host "  FAILED" -ForegroundColor Red
  }
}
