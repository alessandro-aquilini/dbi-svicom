<script lang="ts">
    import type { Quote } from '$lib/data/embeds/quotes';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Invoice01Icon, Download01Icon } from '@hugeicons/core-free-icons';
    import { format } from 'date-fns';
    import { it } from 'date-fns/locale';

    interface Props {
        quote: Quote;
        isOwn?: boolean;
    }

    let { quote, isOwn = false }: Props = $props();
</script>

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full">
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full max-w-sm">
        <div class="p-4 bg-amber-50/50 border-b border-amber-100/50 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-600 shadow-sm">
                    <HugeiconsIcon icon={Invoice01Icon} size={18} />
                </div>
                <span class="text-sm font-bold text-amber-900 uppercase tracking-tight">Preventivo</span>
            </div>
            <span class="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">In attesa</span>
        </div>
        
        <div class="p-4">
            <h4 class="font-bold text-slate-900 text-sm mb-1">{quote.title}</h4>
            <p class="text-xs text-slate-500 line-clamp-2 mb-3">{quote.description}</p>
            
            <div class="flex items-center justify-between mt-2">
                <div>
                    <span class="text-lg font-bold text-[#5D7D94]">{quote.amount.toLocaleString('it-IT', { style: 'currency', currency: quote.currency })}</span>
                </div>
                <button class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                    Visualizza
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                </button>
            </div>
        </div>
        
        <div class="px-4 py-2 bg-slate-50/50 text-[10px] text-slate-400 flex justify-between">
            <span>Inviato il {format(new Date(quote.sentAt), "d MMM yyyy", { locale: it })}</span>
            <span>Scade il {format(new Date(quote.expiresAt), "d MMM", { locale: it })}</span>
        </div>
    </div>
</div>
