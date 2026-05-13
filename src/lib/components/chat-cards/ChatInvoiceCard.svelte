<script lang="ts">
    import type { Invoice } from '$lib/data/embeds/invoices';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { ContainerIcon, Download01Icon } from '@hugeicons/core-free-icons';
    import { format } from 'date-fns';
    import { it } from 'date-fns/locale';

    interface Props {
        invoice: Invoice;
    }

    let { invoice }: Props = $props();
</script>

<div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full max-w-sm">
    <div class="p-4 bg-blue-50/50 border-b border-blue-100/50 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                <HugeiconsIcon icon={ContainerIcon} size={18} />
            </div>
            <span class="text-sm font-bold text-blue-900 uppercase tracking-tight">Fattura</span>
        </div>
        <span class="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{invoice.number}</span>
    </div>
    
    <div class="p-4">
        <h4 class="font-bold text-slate-900 text-sm mb-1">{invoice.description}</h4>
        
        <div class="flex items-center justify-between mt-4">
            <div>
                <span class="text-lg font-bold text-[#5D7D94]">{invoice.amount.toLocaleString('it-IT', { style: 'currency', currency: invoice.currency })}</span>
                <p class="text-[10px] text-muted-foreground">IVA Inclusa</p>
            </div>
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200">
                PDF
                <HugeiconsIcon icon={Download01Icon} size={14} />
            </button>
        </div>
    </div>
    
    <div class="px-4 py-2 bg-slate-50/50 text-[10px] text-slate-400">
        Emessa il {format(new Date(invoice.issueDate), "d MMMM yyyy", { locale: it })}
    </div>
</div>
