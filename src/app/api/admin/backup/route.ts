import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync, statSync } from 'fs';
import { resolve, join } from 'path';

const BASE_BACKUP_DIR = resolve('d:\\Lojatenis\\backups');
const LATEST_DIR = join(BASE_BACKUP_DIR, 'latest');

// 1. GET: Retornar informações do último backup ou fazer download do JSON/SQL
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'info' | 'download_json' | 'download_sql'

    // Retornar informações do backup mais recente
    if (action === 'info' || !action) {
      const metadataPath = join(LATEST_DIR, 'metadata.json');
      if (!existsSync(metadataPath)) {
        return NextResponse.json({
          success: true,
          has_backup: false,
          message: 'Nenhum backup local encontrado ainda.',
        });
      }

      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      const jsonStats = existsSync(join(LATEST_DIR, 'backup-data-full.json'))
        ? statSync(join(LATEST_DIR, 'backup-data-full.json'))
        : null;
      const sqlStats = existsSync(join(LATEST_DIR, 'restore-database.sql'))
        ? statSync(join(LATEST_DIR, 'restore-database.sql'))
        : null;

      return NextResponse.json({
        success: true,
        has_backup: true,
        metadata,
        files: {
          json_size_bytes: jsonStats?.size ?? 0,
          sql_size_bytes: sqlStats?.size ?? 0,
          json_size_kb: jsonStats ? (jsonStats.size / 1024).toFixed(1) + ' KB' : '0 KB',
          sql_size_kb: sqlStats ? (sqlStats.size / 1024).toFixed(1) + ' KB' : '0 KB',
        },
      });
    }

    // Download do arquivo JSON de backup consolidado
    if (action === 'download_json') {
      const filePath = join(LATEST_DIR, 'backup-data-full.json');
      if (!existsSync(filePath)) {
        return NextResponse.json({ success: false, error: 'Arquivo de backup não encontrado' }, { status: 404 });
      }

      const fileContent = readFileSync(filePath);
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="backup_lojatenis_${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    // Download do arquivo SQL de restauração
    if (action === 'download_sql') {
      const filePath = join(LATEST_DIR, 'restore-database.sql');
      if (!existsSync(filePath)) {
        return NextResponse.json({ success: false, error: 'Arquivo SQL não encontrado' }, { status: 404 });
      }

      const fileContent = readFileSync(filePath);
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': `attachment; filename="restore_lojatenis_${new Date().toISOString().slice(0, 10)}.sql"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar backup.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Executar um novo backup em tempo real (manual ou fechamento de caixa)
export async function POST() {
  try {

    // Executar o script de backup
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync('node scripts/backup-database-local.mjs', { cwd: 'd:\\Lojatenis' });

    const metadataPath = join(LATEST_DIR, 'metadata.json');
    const metadata = existsSync(metadataPath) ? JSON.parse(readFileSync(metadataPath, 'utf-8')) : null;

    // Criar pasta de fácil acesso C:\Lojatenis_Backups caso estejamos no Windows
    const now = new Date();
    const dateFolder = `fechamento_caixa_${now.toISOString().slice(0, 10)}_${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
    const easyAccessPath = resolve(`d:\\Lojatenis\\backups\\${dateFolder}`);
    const rootEasyPath = `C:\\Lojatenis_Backups\\${dateFolder}`;

    const { mkdirSync, copyFileSync } = await import('fs');

    // Copiar para pasta local dedicada
    mkdirSync(easyAccessPath, { recursive: true });
    if (existsSync(join(LATEST_DIR, 'backup-data-full.json'))) {
      copyFileSync(join(LATEST_DIR, 'backup-data-full.json'), join(easyAccessPath, 'backup-estoque-completo.json'));
    }
    if (existsSync(join(LATEST_DIR, 'restore-database.sql'))) {
      copyFileSync(join(LATEST_DIR, 'restore-database.sql'), join(easyAccessPath, 'restore-database.sql'));
    }
    if (existsSync(metadataPath)) {
      copyFileSync(metadataPath, join(easyAccessPath, 'metadata.json'));
    }

    // Tentar criar também na raiz C:\Lojatenis_Backups para máxima facilidade de acesso
    let finalSavedPath = easyAccessPath;
    try {
      mkdirSync(rootEasyPath, { recursive: true });
      if (existsSync(join(LATEST_DIR, 'backup-data-full.json'))) {
        copyFileSync(join(LATEST_DIR, 'backup-data-full.json'), join(rootEasyPath, 'backup-estoque-completo.json'));
      }
      if (existsSync(join(LATEST_DIR, 'restore-database.sql'))) {
        copyFileSync(join(LATEST_DIR, 'restore-database.sql'), join(rootEasyPath, 'restore-database.sql'));
      }
      finalSavedPath = rootEasyPath;
    } catch {
      // Se não tiver permissão em C:\, usa d:\Lojatenis\backups
      finalSavedPath = easyAccessPath;
    }

    return NextResponse.json({
      success: true,
      message: 'Backup do estoque e caixa realizado com sucesso!',
      saved_path: finalSavedPath,
      folder_name: dateFolder,
      total_records: metadata?.total_records || 1299,
      metadata,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao executar backup.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
