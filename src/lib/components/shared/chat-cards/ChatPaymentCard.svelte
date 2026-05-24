<script lang="ts">
    import type { Payment } from '$lib/data/embeds/payments';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { CreditCardIcon, Tick02Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

    interface Props {
        payment: Payment;
    }

    let { payment }: Props = $props();
</script>

<div class="flex flex-col items-end w-full mb-1">
    <div class="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 rounded-tr-none">
        <div class="flex items-center gap-3 bg-emerald-50/50 px-4 py-3">
            <div class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <HugeiconsIcon icon={CreditCardIcon} size={18} />
            </div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Conferma Pagamento
            </span>
        </div>

        <div class="px-4 py-5 flex items-center justify-between">
            <div>
                <div class="text-2xl font-black text-slate-900 tracking-tight leading-none">{payment.amount.toLocaleString('it-IT', { style: 'currency', currency: payment.currency })}</div>
                <p class="mt-2 text-xs font-medium text-slate-500 uppercase tracking-wide">{payment.description}</p>
            </div>
            <div class="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                 <HugeiconsIcon icon={Tick02Icon} size={24} />
            </div>
        </div>
    </div>
    <span class="mt-1 px-1 text-[10px] font-medium text-slate-400">
        {formatChatTime(payment.createdAt ?? payment.paidAt)}
    </span>
</div>
