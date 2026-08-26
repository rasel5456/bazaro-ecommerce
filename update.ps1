# update.ps1
# Run this from inside the bazaro-supabase project folder:
#   .\update.ps1
#
# It finds the newest "bazaro-supabase*.zip" in your Downloads folder,
# extracts it, copies the updated files into this project (without
# touching your .env), and runs npm install.

$downloads = "$env:USERPROFILE\Downloads"
$latestZip = Get-ChildItem -Path $downloads -Filter "bazaro-supabase*.zip" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $latestZip) {
    Write-Host "No bazaro-supabase*.zip found in $downloads" -ForegroundColor Red
    exit 1
}

Write-Host "Using: $($latestZip.Name) (downloaded $($latestZip.LastWriteTime))" -ForegroundColor Cyan

$tempDir = "$env:TEMP\bazaro-update-latest"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
Expand-Archive -Path $latestZip.FullName -DestinationPath $tempDir -Force

$source = Join-Path $tempDir "bazaro-supabase"
if (-not (Test-Path $source)) {
    Write-Host "Could not find bazaro-supabase folder inside the zip." -ForegroundColor Red
    exit 1
}

# Copy everything except .env (so your Supabase credentials are kept safe)
Get-ChildItem -Path $source -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($source.Length + 1)
    if ($relativePath -eq ".env") { return }
    $destPath = Join-Path $PSScriptRoot $relativePath
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item -Path $_.FullName -Destination $destPath -Force
}

Write-Host "Files updated." -ForegroundColor Green
Write-Host "Running npm install..." -ForegroundColor Cyan
npm install

Write-Host "`nDone! Now run: npm run dev" -ForegroundColor Green
