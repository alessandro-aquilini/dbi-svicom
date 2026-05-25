<script lang="ts">
    import type { Quote } from '$lib/data/embeds/quotes';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Invoice01Icon, Download01Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

    interface Props {
        quote: Quote;
        isOwn?: boolean;
    }

    let { quote, isOwn = false }: Props = $props();
</script>

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full mb-1">
    <div class="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 {isOwn ? 'rounded-tr-none' : 'rounded-tl-none'}">
        <div class="flex items-center gap-3 bg-amber-50/50 px-4 py-3">
            <div class="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
                <HugeiconsIcon icon={Invoice01Icon} size={18} />
            </div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Preventivo Servizio
            </span>
        </div>

        <div class="space-y-4 px-4 py-4">
            <div>
                <h4 class="text-sm font-semibold text-slate-900 leading-tight">{quote.title}</h4>
                <p class="text-[11px] text-slate-500 line-clamp-2 mt-1.5">{quote.description}</p>
            </div>

            <div class="flex items-center justify-between gap-3 pt-2">
                <span class="text-xl font-bold text-slate-900 tracking-tight">
                    {quote.amount.toLocaleString('it-IT', { style: 'currency', currency: quote.currency })}
                </span>
                <button class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm">
                    Dettagli
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                </button>
            </div>
        </div>
    </div>
    <span class="mt-1 px-1 text-[10px] font-medium text-slate-400">
        {formatChatTime(quote.createdAt)}
    </span>
</div>
