# PowerShell script to create portable Dvault executable
Write-Host "Creating portable Dvault executable..." -ForegroundColor Green
Write-Host ""

# Check if unpacked version exists
$unpackedPath = "dist\win-unpacked\Dvault.exe"
if (-not (Test-Path $unpackedPath)) {
    Write-Host "ERROR: Unpacked executable not found at $unpackedPath" -ForegroundColor Red
    Write-Host "Please run 'npm run package:win' first to create the unpacked version." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create temp directory for packaging
$tempDir = "temp_portable"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy all files from unpacked version
Write-Host "Copying files from unpacked version..." -ForegroundColor Cyan
Copy-Item "dist\win-unpacked\*" $tempDir -Recurse -Force

# Create config file for 7-Zip SFX
$configContent = @"
;!@Install@!UTF-8!
Title="Dvault Portable"
BeginPrompt="Do you want to extract Dvault to a temporary folder?"
RunProgram="Dvault.exe"
;!@InstallEnd@!
"@

$configContent | Out-File -FilePath "$tempDir\config.txt" -Encoding UTF8

# Find 7-Zip executable
$sevenZipPaths = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe"
)

$sevenZipPath = $null
foreach ($path in $sevenZipPaths) {
    if (Test-Path $path) {
        $sevenZipPath = $path
        break
    }
}

if ($sevenZipPath) {
    Write-Host "Creating portable executable using 7-Zip..." -ForegroundColor Cyan
    $outputFile = "Dvault_Portable.exe"

    # Create the SFX archive
    & $sevenZipPath a -sfx7z.sfx $outputFile "$tempDir\*" | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "" -ForegroundColor Green
        Write-Host "SUCCESS: Created $outputFile" -ForegroundColor Green
        Write-Host "You can now run this executable on any Windows machine without installation." -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to create portable executable" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: 7-Zip not found. Please install 7-Zip or run as Administrator for electron-builder." -ForegroundColor Red
}

# Clean up
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

Write-Host ""
Read-Host "Press Enter to exit"