<script lang="ts">
    import type { Invoice } from '$lib/data/embeds/invoices';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { ContainerIcon, Download01Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

    interface Props {
        invoice: Invoice;
        isOwn?: boolean;
    }

    let { invoice, isOwn = false }: Props = $props();
</script>

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full">
    <div class="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div class="flex items-center gap-3">
                <div class="grid h-9 w-9 place-items-center rounded-lg bg-sky-100 text-sky-700">
                    <HugeiconsIcon icon={ContainerIcon} size={18} />
                </div>
                <span class="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Fattura
                </span>
            </div>
            <span
                class="text-xs font-semibold text-slate-500"
                title={formatChatTooltip(invoice.createdAt)}
            >
                {formatChatTime(invoice.createdAt)}
            </span>
        </div>

        <div class="px-4 py-4">
            <h4 class="text-sm font-semibold text-slate-900 mb-1">{invoice.description}</h4>
            <div class="flex items-center justify-between gap-3 mt-4">
                <div>
                    <span class="text-lg font-bold text-slate-900">{invoice.amount.toLocaleString('it-IT', { style: 'currency', currency: invoice.currency })}</span>
                    <p class="text-[10px] text-slate-500">IVA inclusa</p>
                </div>
                <button class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                    PDF
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                </button>
            </div>
        </div>
    </div>
</div>
