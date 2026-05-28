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
</script>

<div class="space-y-5">
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
</div>
