<script lang="ts">
    interface Props {
        ticket: any;
        statusLabel: string;
        onAccept?: () => void;
        onDecline?: () => void;
        onReportCompletion?: () => void;
        onAssign?: () => void;
        onClose?: () => void;
        assignLabel?: string;
    }

    let {
        ticket = null,
        statusLabel = '',
        onAccept,
        onDecline,
        onReportCompletion,
        onAssign,
        onClose,
        assignLabel = '',
    }: Props = $props();

    const isInactive = $derived(statusLabel === 'closed' || statusLabel === 'completed');
</script>

<div class="space-y-5">
    {#if isInactive}
        <div class="flex flex-col items-center text-center py-2 space-y-4">
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 ring-1 ring-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-lock"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect width="8" height="6" x="8" y="12" rx="1"/><path d="M15 12v-2a3 3 0 1 0-6 0v2"/></svg>
            </div>
            <div class="space-y-1">
                <h3 class="text-base font-bold text-slate-900">Nessun Ticket Attivo</h3>
                <p class="text-sm text-slate-500">L'ultimo ticket amministrativo è stato completato.</p>
            </div>
            <div class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                Stato: {statusLabel}
            </div>
        </div>
    {:else}
        <div class="flex items-start justify-between">
            <div class="space-y-1">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Ticket Amministrativo</p>
                <h3 class="text-lg font-bold text-slate-900 leading-tight">{ticket?.title}</h3>
            </div>
            <div class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider ring-1 ring-amber-100">
                {statusLabel}
            </div>
        </div>

        <div class="space-y-4">
            <div class="space-y-1.5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Descrizione</p>
                <p class="text-[14px] text-slate-600 leading-relaxed font-medium px-1">{ticket?.description || 'Nessuna descrizione fornita.'}</p>
            </div>

            {#if ticket?.category || ticket?.location}
                <div class="flex gap-4 pt-1 border-t border-slate-50 mt-2">
                    {#if ticket?.category}
                        <div class="flex-1">
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Categoria</p>
                            <p class="text-[13px] font-semibold text-slate-800 px-1">{ticket.category}</p>
                        </div>
                    {/if}
                    {#if ticket?.location}
                        <div class="flex-1">
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Posizione</p>
                            <p class="text-[13px] font-semibold text-slate-800 px-1">{ticket.location}</p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>

        {#if onAccept || onDecline || onReportCompletion || onAssign || onClose}
            <div class="pt-4 space-y-2">
                {#if onAccept || onDecline}
                    <div class="flex gap-2">
                        {#if onAccept}
                            <button
                                type="button"
                                class="flex-1 h-11 rounded-2xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
                                onclick={onAccept}
                            >
                                Accetta
                            </button>
                        {/if}
                        {#if onDecline}
                            <button
                                type="button"
                                class="flex-1 h-11 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onclick={onDecline}
                            >
                                Rifiuta
                            </button>
                        {/if}
                    </div>
                {/if}

                {#if onReportCompletion}
                    <button
                        type="button"
                        class="w-full h-11 rounded-2xl bg-emerald-600 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-50 hover:bg-emerald-700"
                        onclick={onReportCompletion}
                    >
                        Segnala completamento
                    </button>
                {/if}

                {#if onAssign}
                    <button
                        type="button"
                        class="w-full h-11 rounded-2xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
                        onclick={onAssign}
                    >
                        Assegna a {assignLabel}
                    </button>
                {/if}

                {#if onClose}
                    <button
                        type="button"
                        class="w-full h-10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onclick={onClose}
                    >
                        Chiudi ticket
                    </button>
                {/if}
            </div>
        {/if}
    {/if}
</div>
