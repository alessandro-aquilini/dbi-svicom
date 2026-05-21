<script lang="ts">
    import type { Payment } from '$lib/data/embeds/payments';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { CreditCardIcon, Tick02Icon } from '@hugeicons/core-free-icons';
    import { format } from 'date-fns';
    import { it } from 'date-fns/locale';

    interface Props {
        payment: Payment;
    }

    let { payment }: Props = $props();
</script>

<div class="flex flex-col items-end w-full">
    <div class="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden w-full max-w-sm">
        <div class="p-4 bg-emerald-50/50 border-b border-emerald-100/50 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                    <HugeiconsIcon icon={CreditCardIcon} size={18} />
                </div>
                <span class="text-sm font-bold text-emerald-900 uppercase tracking-tight">Pagamento</span>
            </div>
            <div class="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                <HugeiconsIcon icon={Tick02Icon} size={12} />
                Eseguito
            </div>
        </div>
        
        <div class="p-4">
            <div class="flex items-baseline gap-1">
                <span class="text-2xl font-black text-slate-900">{payment.amount.toLocaleString('it-IT', { style: 'currency', currency: payment.currency })}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">{payment.description}</p>
        </div>
        
        <div class="px-4 py-2 bg-emerald-50/30 text-[10px] text-emerald-700/70">
                Transazione completata il {payment.createdAt ? format(new Date(payment.createdAt), "d MMM yyyy 'alle' HH:mm", { locale: it }) : '—'}
        </div>
    </div>
</div>
