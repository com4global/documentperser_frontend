@echo off
REM ═══════════════════════════════════════════════════════════
REM  generate-keystore.bat  —  EdTech AI Android Signing Key
REM  Run this ONCE. Keep zenzee.keystore safe forever.
REM ═══════════════════════════════════════════════════════════

set KEYTOOL="C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot\bin\keytool.exe"

echo.
echo  ══════════════════════════════════════════
echo    EdTech AI - Android Keystore Generator
echo  ══════════════════════════════════════════
echo.

REM ── EDIT THESE BEFORE RUNNING ─────────────────────────────
set ALIAS=zenzee-key
set KEYSTORE_FILE=zenzee.keystore
set STORE_PASS=Success@0812!
set DNAME=CN=Zenzee EdTech, OU=Mobile, O=Zenzee, L=Chennai, S=TamilNadu, C=IN
REM ── (Note: PKCS12 uses same password for store and key) ───

REM Delete old keystore if it exists to avoid "alias already exists" error
if exist "%KEYSTORE_FILE%" (
  echo  Old keystore found — deleting to regenerate fresh...
  del "%KEYSTORE_FILE%"
)

echo  Generating: %KEYSTORE_FILE%   Alias: %ALIAS%
echo.

%KEYTOOL% -genkeypair ^
  -v ^
  -storetype PKCS12 ^
  -keystore "%KEYSTORE_FILE%" ^
  -alias "%ALIAS%" ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -storepass "%STORE_PASS%" ^
  -dname "%DNAME%"

if %ERRORLEVEL% == 0 (
  echo.
  echo  SUCCESS: %KEYSTORE_FILE% created!
  echo  ─────────────────────────────────────────────
  echo  Keystore : %KEYSTORE_FILE%
  echo  Alias    : %ALIAS%
  echo  Password : %STORE_PASS%
  echo  ─────────────────────────────────────────────
  echo  Save these in a password manager now!
  echo  Next: Android Studio ^> Build ^> Generate Signed Bundle
  echo        Select this keystore + enter password above
) else (
  echo.
  echo  ERROR: Generation failed. See message above.
)

pause
