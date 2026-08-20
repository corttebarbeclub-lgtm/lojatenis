@echo off
chcp 65001 >nul
echo [LOJATENIS] Executando rotina de Backup do Banco de Dados...
cd /d "d:\Lojatenis"

node scripts/backup-database-local.mjs >> backups\backup.log 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [LOJATENIS] Backup concluido com sucesso! Log salvo em backups\backup.log
) else (
    echo [LOJATENIS] ERRO ao realizar backup! Verifique backups\backup.log
)
