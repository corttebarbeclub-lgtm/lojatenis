'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Calendar,
  Clock,
  FileCode,
  FileJson,
  Loader2,
  FolderArchive,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BackupMetadata {
  backup_id: string;
  created_at: string;
  execution_time_ms: number;
  project_ref: string;
  total_tables: number;
  total_records: number;
  sha256_checksum: string;
  tables: Record<string, number>;
}

interface BackupInfo {
  success: boolean;
  has_backup: boolean;
  metadata?: BackupMetadata;
  files?: {
    json_size_kb: string;
    sql_size_kb: string;
  };
}

export function SettingsManagerClient() {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadBackupInfo() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/backup?action=info');
      const data = await res.json();
      if (data.success) {
        setBackupInfo(data);
      }
    } catch {
      toast.error('Erro ao carregar dados de backup.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBackupInfo();
  }, []);

  async function handleGenerateBackup() {
    try {
      setGenerating(true);
      toast.info('Iniciando backup local do banco de dados...');
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('✅ ' + data.message);
        loadBackupInfo();
      } else {
        toast.error(data.error || 'Erro ao gerar backup.');
      }
    } catch {
      toast.error('Erro ao conectar com o servidor de backup.');
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload(type: 'json' | 'sql') {
    const url = `/api/admin/backup?action=download_${type}`;
    window.open(url, '_blank');
    toast.success(`Iniciando download do arquivo ${type.toUpperCase()}...`);
  }

  const meta = backupInfo?.metadata;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          Configurações & Backup Local
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerenciamento de segurança, cópias de segurança locais e integridade do banco de dados da loja.
        </p>
      </div>

      {/* Main Backup Card */}
      <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-gray-900">
                  Backup Diário Automático & Nuvem
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Banco em nuvem protegido 24h com rotina de sincronização local diária no Windows
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadBackupInfo}
                disabled={loading}
                className="rounded-xl text-xs font-bold"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Atualizar Status
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateBackup}
                disabled={generating}
                className="rounded-xl text-xs font-black bg-black text-white hover:bg-gray-800"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Gerando Backup...
                  </>
                ) : (
                  <>
                    <HardDrive className="h-3.5 w-3.5 mr-1.5" />
                    Fazer Backup Agora
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Último Backup
              </div>
              <p className="text-sm font-black text-gray-900 mt-1">
                {meta?.created_at
                  ? new Date(meta.created_at).toLocaleString('pt-BR')
                  : 'Nenhum backup recente'}
              </p>
              <Badge variant="outline" className="mt-2 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Salvo com Sucesso
              </Badge>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Registros Salvos
              </div>
              <p className="text-xl font-black text-gray-900 mt-1">
                {meta?.total_records?.toLocaleString('pt-BR') || 0}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                em {meta?.total_tables || 25} tabelas do sistema
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                <FolderArchive className="h-3.5 w-3.5 text-primary" />
                Tamanho da Cópia
              </div>
              <p className="text-sm font-black text-gray-900 mt-1">
                {backupInfo?.files?.json_size_kb || '0 KB'} (JSON)
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {backupInfo?.files?.sql_size_kb || '0 KB'} (Script SQL)
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Rotina Agendada
              </div>
              <p className="text-sm font-black text-gray-900 mt-1">
                Diariamente às 03:00 AM
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                ou ao ligar o computador do caixa
              </p>
            </div>
          </div>

          {/* Download Buttons Section */}
          <div className="rounded-2xl bg-gray-100/70 border border-gray-200/80 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
                  📥 Baixar Cópia dos Dados em 1 Clique
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Baixe os dados da sua loja para salvar em um pendrive, HD externo ou outro computador.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload('json')}
                  className="rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border-gray-300"
                >
                  <FileJson className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                  Baixar JSON Completo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload('sql')}
                  className="rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border-gray-300"
                >
                  <FileCode className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                  Baixar Script SQL (.sql)
                </Button>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          {meta?.tables && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">
                Detalhamento dos Dados Salvos por Tabela:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(meta.tables).map(([table, count]) => (
                  <div
                    key={table}
                    className="flex items-center justify-between rounded-xl bg-white border border-gray-200/80 px-2.5 py-1.5 text-[11px]"
                  >
                    <span className="font-bold text-gray-600 truncate">{table}</span>
                    <span className="font-black text-gray-900 ml-1">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
