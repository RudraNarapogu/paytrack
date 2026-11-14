@echo off
REM Install Web Dashboard Dependencies

echo ========================================
echo Installing Web Dashboard Dependencies
echo ========================================
echo.

cd web

echo Installing packages...
echo This may take a few minutes...
echo.

REM Use the full path to npm to bypass PowerShell execution policy
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✓ Web dependencies installed successfully!
    echo ========================================
    echo.
    echo You can now start the web dashboard with:
    echo .\start-web.bat
    echo.
) else (
    echo.
    echo ✗ Installation failed
    echo Please check the error messages above
    echo.
)

pause
