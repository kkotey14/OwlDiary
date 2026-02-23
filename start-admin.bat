@echo off
setlocal

set /p ADMIN_EMAIL=Admin email: 
set /p ADMIN_PASSWORD=Admin password: 
set /p ADMIN_NAME=Admin name (optional): 

if "%ADMIN_EMAIL%"=="" (
  echo Admin email is required.
  exit /b 1
)
if "%ADMIN_PASSWORD%"=="" (
  echo Admin password is required.
  exit /b 1
)

set ADMIN_EMAIL=%ADMIN_EMAIL%
set ADMIN_PASSWORD=%ADMIN_PASSWORD%
set ADMIN_NAME=%ADMIN_NAME%

echo Starting server with admin bootstrap...
call npm run server
