import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'fs';
import { resolve, join } from 'path';
import { createHash } from 'crypto';

// Token e credenciais
const token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
const PROJECT_REF = 'jmlxhsqfvxjggvqusleu';
const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

// Diretório base de backups
const BASE_BACKUP_DIR = resolve('d:\\Lojatenis\\backups');
const DAILY_DIR = join(BASE_BACKUP_DIR, 'daily');
const LATEST_DIR = join(BASE_BACKUP_DIR, 'latest');

// Ordem de dependência para extração e restauração (Foreign Keys)
const TABLES_IN_ORDER = [
  'plans',
  'tenants',
  'users',
  'stores',
  'brands',
  'categories',
  'suppliers',
  'collaborators',
  'products',
  'product_variants',
  'product_images',
  'inventory',
  'customers',
  'sellers',
  'cash_registers',
  'sales',
  'sale_items',
  'payments',
  'cash_movements',
  'inventory_movements',
  'storefront_hero_banners',
  'stock_alerts',
  'wholesale_customers',
  'wholesale_notifications',
  'audit_logs',
];

async function runSQL(sql) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await resp.text();
  return JSON.parse(text);
}

function escapeSQLValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function cleanOldBackups(keepDays = 30) {
  if (!existsSync(DAILY_DIR)) return;
  const entries = readdirSync(DAILY_DIR)
    .map((name) => {
      const fullPath = join(DAILY_DIR, name);
      return { name, fullPath, stat: statSync(fullPath) };
    })
    .filter((e) => e.stat.isDirectory())
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

  if (entries.length > keepDays) {
    const toDelete = entries.slice(keepDays);
    for (const item of toDelete) {
      console.log(`🧹 Removendo backup antigo expirado: ${item.name}`);
      rmSync(item.fullPath, { recursive: true, force: true });
    }
  }
}

async function performDatabaseBackup() {
  const startTime = Date.now();
  const dateObj = new Date();
  const dateStr = dateObj.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const currentBackupDir = join(DAILY_DIR, `backup_${dateStr}`);

  console.log('📦 ==========================================');
  console.log('📦 INICIANDO BACKUP AUTOMÁTICO DO BANCO');
  console.log(`📦 Data/Hora: ${dateObj.toLocaleString('pt-BR')}`);
  console.log(`📦 Destino: ${currentBackupDir}`);
  console.log('📦 ==========================================\n');

  // Criar pastas necessárias
  mkdirSync(currentBackupDir, { recursive: true });
  mkdirSync(LATEST_DIR, { recursive: true });

  const backupData = {};
  const tableStats = {};
  let totalRecords = 0;
  const sqlStatements = [];

  sqlStatements.push(`-- ========================================================`);
  sqlStatements.push(`-- BACKUP LOCAL DO BANCO DE DADOS LOJATENIS`);
  sqlStatements.push(`-- Data de Geração: ${dateObj.toISOString()}`);
  sqlStatements.push(`-- ========================================================\n`);
  sqlStatements.push(`BEGIN;\n`);

  for (const table of TABLES_IN_ORDER) {
    try {
      const rows = await runSQL(`SELECT * FROM "${table}";`);

      if (Array.isArray(rows)) {
        backupData[table] = rows;
        tableStats[table] = rows.length;
        totalRecords += rows.length;

        // Salvar JSON individual de cada tabela
        const tableJsonPath = join(currentBackupDir, `${table}.json`);
        writeFileSync(tableJsonPath, JSON.stringify(rows, null, 2), 'utf-8');

        // Gerar instruções SQL de INSERT para restauração rápida
        if (rows.length > 0) {
          sqlStatements.push(`-- Tabela: ${table} (${rows.length} registros)`);
          const columns = Object.keys(rows[0]);
          const colsEscaped = columns.map((c) => `"${c}"`).join(', ');

          for (const row of rows) {
            const values = columns.map((col) => escapeSQLValue(row[col])).join(', ');
            sqlStatements.push(`INSERT INTO "${table}" (${colsEscaped}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
          }
          sqlStatements.push('');
        }

        console.log(`  ✓ Tabela [${table.padEnd(26)}]: ${String(rows.length).padStart(5)} registros salvos.`);
      } else {
        tableStats[table] = 0;
        console.log(`  - Tabela [${table.padEnd(26)}]: sem registros ou indisponível.`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Erro ao salvar tabela ${table}:`, err.message);
      tableStats[table] = 'error';
    }
  }

  sqlStatements.push(`COMMIT;`);

  // 1. Salvar JSON consolidado
  const fullJsonPath = join(currentBackupDir, 'backup-data-full.json');
  const fullJsonContent = JSON.stringify(backupData, null, 2);
  writeFileSync(fullJsonPath, fullJsonContent, 'utf-8');

  // 2. Salvar Script SQL de Restauração
  const sqlPath = join(currentBackupDir, 'restore-database.sql');
  const sqlContent = sqlStatements.join('\n');
  writeFileSync(sqlPath, sqlContent, 'utf-8');

  // 3. Gerar Hash SHA-256 de integridade
  const hash = createHash('sha256').update(fullJsonContent).digest('hex');

  // 4. Salvar Metadata e Sumário
  const metadata = {
    backup_id: `backup_${dateStr}`,
    created_at: dateObj.toISOString(),
    execution_time_ms: Date.now() - startTime,
    project_ref: PROJECT_REF,
    total_tables: TABLES_IN_ORDER.length,
    total_records: totalRecords,
    sha256_checksum: hash,
    tables: tableStats,
  };

  const metadataPath = join(currentBackupDir, 'metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

  // 5. Atualizar cópia mais recente em /latest
  writeFileSync(join(LATEST_DIR, 'backup-data-full.json'), fullJsonContent, 'utf-8');
  writeFileSync(join(LATEST_DIR, 'restore-database.sql'), sqlContent, 'utf-8');
  writeFileSync(join(LATEST_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');

  // 6. Rotação e limpeza de backups antigos (> 30 dias)
  cleanOldBackups(30);

  console.log('\n==========================================');
  console.log('✅ BACKUP LOCAL CONCLUÍDO COM SUCESSO!');
  console.log(`📊 Total de Registros Salvos: ${totalRecords}`);
  console.log(`⏱️ Tempo de Execução: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  console.log(`🔐 Checksum SHA-256: ${hash}`);
  console.log(`📁 Local: ${currentBackupDir}`);
  console.log(`📁 Cópia Recente: ${LATEST_DIR}`);
  console.log('==========================================\n');
}

performDatabaseBackup().catch(console.error);
