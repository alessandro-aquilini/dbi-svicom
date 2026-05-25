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

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full mb-1">
    <div class="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 {isOwn ? 'rounded-tr-none' : 'rounded-tl-none'}">
        <div class="flex items-center gap-3 bg-sky-50/50 px-4 py-3">
            <div class="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-700">
                <HugeiconsIcon icon={ContainerIcon} size={18} />
            </div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                Fattura Professionale
            </span>
        </div>

        <div class="px-4 py-4">
            <h4 class="text-sm font-semibold text-slate-900 mb-1 leading-tight">{invoice.description}</h4>
            <div class="flex items-center justify-between gap-3 mt-4">
                <div>
                    <span class="text-xl font-bold text-slate-900 tracking-tight">{invoice.amount.toLocaleString('it-IT', { style: 'currency', currency: invoice.currency })}</span>
                    <p class="text-[10px] font-medium text-slate-400">Totalità (IVA incl.)</p>
                </div>
                <button class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
                    PDF
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                </button>
            </div>
        </div>
    </div>
    <span class="mt-1 px-1 text-[10px] font-medium text-slate-400">
        {formatChatTime(invoice.createdAt)}
    </span>
</div>
