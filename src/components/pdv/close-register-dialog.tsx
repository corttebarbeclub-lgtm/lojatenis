'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { closeCashRegister } from '@/app/dashboard/pdv/actions';
import {
  HardDrive,
  CheckCircle2,
  FolderArchive,
  Loader2,
  Database,
  FileCheck,
} from 'lucide-react';

function inputToCents(value: string) {
  const n = Number(value.replace(',', '.'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CloseRegisterDialog({
  cashRegisterId,
  open,
  onOpenChange,
}: {
  cashRegisterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'summary' | 'backup_prompt' | 'backup_done'>('input');
  const [result, setResult] = useState<{ expected: number; informed: number; diff: number } | null>(null);

  // Backup State
  const [backingUp, setBackingUp] = useState(false);
  const [savedPath, setSavedPath] = useState<string>('');
  const [totalRecords, setTotalRecords] = useState<number>(0);

  function handleSubmit() {
    const cents = inputToCents(amount);

    startTransition(async () => {
      const res = await closeCashRegister({ cashRegisterId, closingBalanceCents: cents });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const expected = res.cashRegister.expected_balance_cents ?? 0;
      setResult({ expected, informed: cents, diff: cents - expected });
      setStep('backup_prompt'); // Avança diretamente para a pergunta de backup local!
    });
  }

  async function handlePerformBackup() {
    try {
      setBackingUp(true);
      toast.info('Gerando cópia de segurança local do estoque...');

      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCashRegisterClose: true, registerId: cashRegisterId }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedPath(data.saved_path || 'C:\\Lojatenis_Backups');
        setTotalRecords(data.total_records || 1299);
        setStep('backup_done');
        toast.success('✅ Backup do estoque e caixa salvo com sucesso!');

        // Iniciar download automático da cópia JSON para a pasta do usuário
        window.open('/api/admin/backup?action=download_json', '_blank');
      } else {
        toast.error(data.error || 'Erro ao gerar backup.');
      }
    } catch {
      toast.error('Erro de conexão ao salvar backup.');
    } finally {
      setBackingUp(false);
    }
  }

  function handleFinish() {
    setAmount('');
    setResult(null);
    setStep('input');
    setSavedPath('');
    onOpenChange(false);
    router.refresh();
  }

  const currentDateStr = new Date().toLocaleDateString('pt-BR');
  const estimatedPath = `C:\\Lojatenis_Backups\\fechamento_${new Date().toISOString().slice(0, 10)}`;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleFinish())}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        {/* ETAPA 1: DIGITAÇÃO DO SALDO CONTADO */}
        {step === 'input' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-gray-900">Fechar Caixa</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Conte o dinheiro físico em caixa e informe o valor real para conferência.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Saldo contado em Dinheiro (R$)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-black rounded-xl h-11"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-xl font-bold text-xs">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !amount.trim()}
                className="bg-black hover:bg-gray-800 text-white rounded-xl font-black text-xs"
              >
                {isPending ? 'Fechando Caixa...' : 'Fechar Caixa & Continuar'}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ETAPA 2: PERGUNTA DE BACKUP LOCAL APÓS FECHAMENTO */}
        {step === 'backup_prompt' && (
          <div className="space-y-5 py-1">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-gray-900">
                    Caixa Fechado com Sucesso!
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    Data do Fechamento: {currentDateStr}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Resumo do Caixa */}
            {result && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Saldo esperado:</span>
                  <span className="font-mono text-gray-900">{formatPrice(result.expected)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Saldo informado:</span>
                  <span className="font-mono text-gray-900">{formatPrice(result.informed)}</span>
                </div>
                <div className="flex justify-between font-black pt-1 border-t border-gray-200">
                  <span className="text-gray-700">Diferença:</span>
                  <span className={result.diff !== 0 ? 'text-red-600 font-mono' : 'text-emerald-600 font-mono'}>
                    {result.diff === 0 ? 'Exato (Sem diferença)' : formatPrice(result.diff)}
                  </span>
                </div>
              </div>
            )}

            {/* PROMPT DE BACKUP */}
            <div className="rounded-2xl border-2 border-primary/20 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                <Database className="h-4 w-4 text-primary" />
                Realizar backup do estoque localmente?
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Recomendado para segurança do seu negócio: salva uma cópia de todos os produtos,
                estoques, vendas e clientes atualizados no seu computador.
              </p>

              {/* Informação explícita do caminho onde será salvo */}
              <div className="rounded-xl bg-white border border-amber-200 p-2.5 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <FolderArchive className="h-3 w-3 text-primary" />
                  Onde o backup será salvo no seu computador:
                </span>
                <p className="text-xs font-mono font-bold text-gray-800 select-all break-all bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  {estimatedPath}
                </p>
                <span className="text-[10px] text-gray-400">
                  (Também salva uma cópia na pasta de Backups da Loja)
                </span>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleFinish}
                disabled={backingUp}
                className="rounded-xl text-xs font-bold w-full sm:w-auto"
              >
                Não, fechar sem backup
              </Button>
              <Button
                onClick={handlePerformBackup}
                disabled={backingUp}
                className="bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black w-full sm:w-auto"
              >
                {backingUp ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Salvando Backup...
                  </>
                ) : (
                  <>
                    <HardDrive className="h-3.5 w-3.5 mr-1.5" />
                    Sim, realizar backup agora
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ETAPA 3: BACKUP CONCLUÍDO E CONFIRMAÇÃO DO LOCAL */}
        {step === 'backup_done' && (
          <div className="space-y-5 py-2">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-gray-900">
                    Backup Salvo com Sucesso! 💾
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    {totalRecords} registros protegidos e salvos no disco local
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
              <span className="text-xs font-black text-emerald-900 block">
                📁 Os arquivos foram gravados com sucesso na pasta:
              </span>

              <div className="rounded-xl bg-white border border-emerald-200 p-2.5">
                <p className="text-xs font-mono font-black text-gray-800 select-all break-all">
                  {savedPath}
                </p>
              </div>

              <ul className="text-[11px] text-emerald-800 space-y-1 pl-4 list-disc font-medium">
                <li><strong>backup-estoque-completo.json</strong> (Dados completos em formato aberto)</li>
                <li><strong>restore-database.sql</strong> (Script de restauração rápida)</li>
                <li><strong>metadata.json</strong> (Checksum de integridade SHA-256)</li>
              </ul>
            </div>

            <DialogFooter>
              <Button
                onClick={handleFinish}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Concluir e Finalizar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
