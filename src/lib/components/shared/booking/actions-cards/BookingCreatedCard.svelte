<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Add01Icon, Clock01Icon, Location01Icon, Note01Icon } from '@hugeicons/core-free-icons';
    import { format } from 'date-fns';
    import { it } from 'date-fns/locale';

    interface Props {
        event: BookingEvent;
        isOwn?: boolean;
    }

    let { event, isOwn = false }: Props = $props();

    function formatSlot(slot?: { start: string; end: string }) {
        if (!slot) return 'Orario da definire';
        const starts = new Date(slot.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const ends = new Date(slot.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const day = new Date(slot.start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        return `${day} · ${starts} – ${ends}`;
    }
</script>

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full">
    <div class="max-w-[90%]">
        <div class="rounded-[28px] border p-4 shadow-sm transition-colors {isOwn ? 'bg-[#5D7D94] border-transparent text-white' : 'bg-white border border-slate-200 text-slate-900'}">
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2 text-sm font-semibold {isOwn ? 'text-slate-100' : 'text-slate-900'}">
                    <HugeiconsIcon icon={Add01Icon} size={18} />
                    <span>Prenotazione creata</span>
                </div>
                <span class="text-[10px] font-medium {isOwn ? 'text-slate-200' : 'text-slate-400'}">
                    {format(new Date(event.at), 'd MMM · HH:mm', { locale: it })}
                </span>
            </div>

            <p class="mt-3 text-sm leading-6 {isOwn ? 'text-slate-100/90' : 'text-slate-600'}">{isOwn ? 'Hai inviato la richiesta' : 'Richiesta inviata'}</p>
            <p class="mt-1 text-xs {isOwn ? 'text-slate-200/90' : 'text-slate-400'}">{isOwn ? 'La tua prenotazione è stata creata' : 'Nuova prenotazione ricevuta'}</p>

            {#if event.slot || event.place || event.description}
                <div class="mt-4 space-y-3">
                    {#if event.slot}
                        <div class="rounded-3xl border px-3 py-3 {isOwn ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-slate-50'}">
                            <div class="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">
                                <HugeiconsIcon icon={Clock01Icon} size={14} />
                                Orario
                            </div>
                            <p class="mt-2 text-sm font-medium {isOwn ? 'text-white' : 'text-slate-900'}">{formatSlot(event.slot)}</p>
                        </div>
                    {/if}
                    {#if event.place}
                        <div class="rounded-3xl border px-3 py-3 {isOwn ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-slate-50'}">
                            <div class="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">
                                <HugeiconsIcon icon={Location01Icon} size={14} />
                                Luogo
                            </div>
                            <p class="mt-2 text-sm font-medium {isOwn ? 'text-white' : 'text-slate-900'}">{event.place}</p>
                        </div>
                    {/if}
                    {#if event.description}
                        <div class="rounded-3xl border px-3 py-3 {isOwn ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-slate-50'}">
                            <div class="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">
                                <HugeiconsIcon icon={Note01Icon} size={14} />
                                Dettagli
                            </div>
                            <p class="mt-2 text-sm leading-6 {isOwn ? 'text-white' : 'text-slate-900'}">{event.description}</p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>
