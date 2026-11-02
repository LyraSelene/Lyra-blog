@echo off
chcp 65001 >nul
powershell.exe -NoProfile -File "%~dp0start-blog.ps1"
if errorlevel 1 pause
