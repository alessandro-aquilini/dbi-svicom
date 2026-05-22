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
    <div class="max-w-[85%]">
        <div class="rounded-2xl border p-3.5 shadow-sm transition-all {isOwn ? 'bg-indigo-600 border-transparent text-white' : 'bg-white border-slate-200 text-slate-900'}">
            <div class="flex items-center gap-2 mb-2 font-bold text-sm">
                <HugeiconsIcon icon={Add01Icon} size={18} class={isOwn ? 'text-indigo-100' : 'text-indigo-600'} />
                <span>{isOwn ? 'Hai creato la prenotazione' : 'Nuova prenotazione'}</span>
            </div>

            <div class="space-y-2.5">
                {#if event.slot}
                    <div class="flex items-center gap-2.5 text-xs">
                        <HugeiconsIcon icon={Clock01Icon} size={14} class={isOwn ? 'text-indigo-200' : 'text-slate-400'} />
                        <span class="font-medium">{formatSlot(event.slot)}</span>
                    </div>
                {/if}
                
                {#if event.place}
                    <div class="flex items-center gap-2.5 text-xs">
                        <HugeiconsIcon icon={Location01Icon} size={14} class={isOwn ? 'text-indigo-200' : 'text-slate-400'} />
                        <span class="font-medium">{event.place}</span>
                    </div>
                {/if}

                {#if event.description}
                    <div class="flex items-start gap-2.5 pt-1 border-t {isOwn ? 'border-white/10' : 'border-slate-100'}">
                        <HugeiconsIcon icon={Note01Icon} size={14} class="mt-0.5 {isOwn ? 'text-indigo-200' : 'text-slate-400'}" />
                        <p class="text-xs leading-relaxed opacity-90">{event.description}</p>
                    </div>
                {/if}
            </div>
        </div>
        
        <p class="mt-1.5 px-1 text-[10px] font-medium {isOwn ? 'text-right text-slate-400' : 'text-slate-400'}">
            {format(new Date(event.at), 'd MMM · HH:mm', { locale: it })}
        </p>
    </div>
</div>
