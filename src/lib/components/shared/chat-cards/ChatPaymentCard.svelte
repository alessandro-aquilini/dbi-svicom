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

<div class="flex flex-col items-end w-full">
    <div class="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div class="flex items-center gap-3">
                <div class="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                    <HugeiconsIcon icon={CreditCardIcon} size={18} />
                </div>
                <span class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Pagamento
                </span>
            </div>
            <span
                class="text-xs font-semibold text-slate-500"
                title={formatChatTooltip(payment.createdAt ?? payment.paidAt)}
            >
                {formatChatTime(payment.createdAt ?? payment.paidAt)}
            </span>
        </div>

        <div class="px-4 py-4">
            <div class="text-2xl font-semibold text-slate-900">{payment.amount.toLocaleString('it-IT', { style: 'currency', currency: payment.currency })}</div>
            <p class="mt-2 text-sm text-slate-600">{payment.description}</p>
        </div>
    </div>
</div>
