# Script para Registrar o Backup Automático Diário no Agendador de Tarefas do Windows

$TaskName = "LojatenisDailyDatabaseBackup"
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument '/c "d:\Lojatenis\scripts\run-daily-backup.bat"'
$Trigger = New-ScheduledTaskTrigger -Daily -At 03:00AM
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Registrar ou atualizar a tarefa
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Backup diario automatico local do banco de dados da Lojatenis"
    Write-Host "✅ Tarefa agendada '$TaskName' criada com sucesso! Executará diariamente às 03:00 AM." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível registrar no agendador automaticamente (pode exigir privilégios de Administrador): $_" -ForegroundColor Yellow
}
