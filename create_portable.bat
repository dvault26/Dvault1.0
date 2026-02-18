@echo off
echo Creating portable Dvault executable...
echo.

REM Check if unpacked version exists
if not exist "dist\win-unpacked\Dvault.exe" (
    echo ERROR: Unpacked executable not found at dist\win-unpacked\Dvault.exe
    echo Please run 'npm run package:win' first to create the unpacked version.
    pause
    exit /b 1
)

REM Create temp directory for packaging
if exist "temp_portable" rmdir /s /q "temp_portable"
mkdir "temp_portable"

REM Copy all files from unpacked version
xcopy "dist\win-unpacked\*" "temp_portable\" /E /I /H /Y

REM Create config file for 7-Zip SFX
echo ;!@Install@!UTF-8! > temp_portable\config.txt
echo Title="Dvault Portable" >> temp_portable\config.txt
echo BeginPrompt="Do you want to extract Dvault to a temporary folder?" >> temp_portable\config.txt
echo RunProgram="Dvault.exe" >> temp_portable\config.txt
echo ;!@InstallEnd@! >> temp_portable\config.txt

REM Create the portable executable using 7-Zip
if exist "C:\Program Files\7-Zip\7z.exe" (
    "C:\Program Files\7-Zip\7z.exe" a -sfx7z.sfx "Dvault_Portable.exe" "temp_portable\*"
) else if exist "C:\Program Files (x86)\7-Zip\7z.exe" (
    "C:\Program Files (x86)\7-Zip\7z.exe" a -sfx7z.sfx "Dvault_Portable.exe" "temp_portable\*"
) else (
    echo ERROR: 7-Zip not found. Please install 7-Zip or run as Administrator for electron-builder.
    rmdir /s /q "temp_portable"
    pause
    exit /b 1
)

REM Clean up
rmdir /s /q "temp_portable"

echo.
echo SUCCESS: Created Dvault_Portable.exe
echo You can now run this executable on any Windows machine without installation.
echo.
pause