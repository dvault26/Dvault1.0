@echo off
REM Dvault Windows Build Script

setlocal enabledelayedexpansion
set VERSION=0.2.0

echo.
echo  ^| Dvault Windows Build System v%VERSION%
echo  ^| ==================================
echo.

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    exit /b 1
)

REM Build step
echo [1/3] Building main process...
call npm run build:main
if errorlevel 1 (
    echo Error: Main build failed
    exit /b 1
)

echo [2/3] Building renderer process...
call npm run build:renderer
if errorlevel 1 (
    echo Error: Renderer build failed
    exit /b 1
)

echo [3/3] Packaging executable...
setlocal
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npx electron-builder --win portable --publish never
if errorlevel 1 (
    echo Warning: Portable build completed with warnings
)

REM Copy executable
if exist "dist\win-unpacked\Dvault.exe" (
    mkdir dist\release 2>nul
    copy /Y "dist\win-unpacked\Dvault.exe" "dist\release\Dvault-%VERSION%.exe"
    
    echo.
    echo Build Complete!
    echo Output: dist\release\Dvault-%VERSION%.exe
    echo Size: 
    for %%A in ("dist\release\Dvault-%VERSION%.exe") do (
        echo   %%~zA bytes
    )
    echo.
    echo Ready for distribution!
) else (
    echo Error: Dvault.exe not found
    exit /b 1
)

endlocal
exit /b 0
