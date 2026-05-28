<script lang="ts">
    interface Props {
        report: any;
        statusLabel: string;
        onAcknowledge?: () => void;
        onResolve?: () => void;
    }

    let {
        report = null,
        statusLabel = '',
        onAcknowledge,
        onResolve,
    }: Props = $props();

    const isInactive = $derived(statusLabel === 'completata' || statusLabel === 'archiviata');
</script>

<div class="space-y-5">
    {#if isInactive}
        <div class="flex flex-col items-center text-center py-2 space-y-4">
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 ring-1 ring-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div class="space-y-1">
                <h3 class="text-base font-bold text-slate-900">Nessuna Segnalazione Attiva</h3>
                <p class="text-sm text-slate-500">L'ultima segnalazione è stata chiusa.</p>
            </div>
            <div class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                Stato: {statusLabel}
            </div>
        </div>
    {:else}
        <div class="flex items-start justify-between">
            <div class="space-y-1">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Segnalazione Residente</p>
                <h3 class="text-lg font-bold text-slate-900 leading-tight">{report?.title}</h3>
            </div>
            <div class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider ring-1 ring-blue-100">
                {statusLabel}
            </div>
        </div>

        <div class="space-y-4">
            <div class="space-y-1.5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Descrizione</p>
                <p class="text-[14px] text-slate-600 leading-relaxed font-medium px-1">{report?.description || 'Nessuna descrizione fornita.'}</p>
            </div>

            <div class="flex gap-4 pt-1 border-t border-slate-50 mt-2">
                <div class="flex-1">
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Priorità</p>
                    <p class="text-[13px] font-bold {report?.priority === 'alta' || report?.priority === 'critica' ? 'text-rose-600' : 'text-slate-800'} capitalize px-1">{report?.priority || 'media'}</p>
                </div>
                {#if report?.category}
                    <div class="flex-1">
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Categoria</p>
                        <p class="text-[13px] font-semibold text-slate-800 px-1">{report.category}</p>
                    </div>
                {/if}
            </div>
        </div>

        {#if onAcknowledge || onResolve}
            <div class="pt-4 grid gap-2">
                {#if onAcknowledge}
                    <button
                        type="button"
                        class="w-full h-11 rounded-2xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
                        onclick={onAcknowledge}
                    >
                        Prendi in carico
                    </button>
                {/if}
                {#if onResolve}
                    <button
                        type="button"
                        class="w-full h-11 rounded-2xl bg-emerald-600 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-50 hover:bg-emerald-700"
                        onclick={onResolve}
                    >
                        Risolvi segnalazione
                    </button>
                {/if}
            </div>
        {/if}
    {/if}
</div>
