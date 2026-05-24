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

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full">
    <div class="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div class="flex items-center gap-3">
                <div class="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <HugeiconsIcon icon={Invoice01Icon} size={18} />
                </div>
                <span class="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Preventivo
                </span>
            </div>
            <span
                class="text-xs font-semibold text-slate-500"
                title={formatChatTooltip(quote.createdAt)}
            >
                {formatChatTime(quote.createdAt)}
            </span>
        </div>

        <div class="space-y-3 px-4 py-4">
            <div>
                <h4 class="text-sm font-semibold text-slate-900">{quote.title}</h4>
                <p class="text-xs text-slate-500 line-clamp-2 mt-1">{quote.description}</p>
            </div>

            <div class="flex items-center justify-between gap-3">
                <span class="text-lg font-bold text-slate-900">
                    {quote.amount.toLocaleString('it-IT', { style: 'currency', currency: quote.currency })}
                </span>
                <button class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                    Visualizza
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                </button>
            </div>
        </div>
    </div>
</div>
