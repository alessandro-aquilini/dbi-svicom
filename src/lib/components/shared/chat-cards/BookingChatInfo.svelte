<script lang="ts">
    interface Props {
        bookingInfo: any;
        serviceName: string;
        place: string;
        onConfirm?: () => void;
        onDecline?: () => void;
        onClose?: () => void;
        onCancel?: () => void;
        isProcessing?: boolean;
    }

    let {
        bookingInfo = null,
        serviceName = '',
        place = '',
        onConfirm,
        onDecline,
        onClose,
        onCancel,
        isProcessing = false,
    }: Props = $props();
</script>

<div class="space-y-5">
    <div class="flex items-start justify-between">
        <div class="space-y-1">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D7D94]">Servizio Prenotato</p>
            <h3 class="text-lg font-bold text-slate-900 leading-tight">{serviceName}</h3>
        </div>
        <div class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider ring-1 ring-emerald-100">
            {bookingInfo?.status ?? 'unknown'}
        </div>
    </div>

    <div class="space-y-4">
        {#if bookingInfo?.notes}
            <div class="space-y-1.5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Note Residente</p>
                <p class="text-[14px] text-slate-600 leading-relaxed font-medium italic px-1">"{bookingInfo.notes}"</p>
            </div>
        {/if}

        <div class="flex gap-4 pt-1 border-t border-slate-50 mt-2">
            <div class="flex-1">
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Ubicazione</p>
                <p class="text-[13px] font-semibold text-slate-800 px-1 truncate">{place || 'Complesso Condominiale'}</p>
            </div>
        </div>
    </div>

    {#if onConfirm || onDecline || onClose || onCancel}
        <div class="pt-4 space-y-2">
            {#if onConfirm || onDecline}
                <div class="flex items-center gap-2">
                    {#if onConfirm}
                        <button
                            type="button"
                            disabled={isProcessing}
                            class="flex-1 h-11 rounded-2xl bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            onclick={onConfirm}
                        >
                            Approva
                        </button>
                    {/if}
                    {#if onDecline}
                        <button
                            type="button"
                            disabled={isProcessing}
                            class="flex-1 h-11 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            onclick={onDecline}
                        >
                            Rifiuta
                        </button>
                    {/if}
                </div>
            {:else if onClose}
                <button
                    type="button"
                    class="w-full h-11 rounded-2xl bg-emerald-600 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-50 hover:bg-emerald-700"
                    onclick={onClose}
                >
                    Concludi Intervento
                </button>
            {/if}

            {#if onCancel && !(onConfirm || onDecline || onClose)}
                <button
                    type="button"
                    class="w-full h-9 rounded-2xl border border-red-100 bg-white text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50"
                    onclick={onCancel}
                >
                    Annulla prenotazione
                </button>
            {/if}
        </div>
    {/if}
</div>
