<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Add01Icon, Clock01Icon, Location01Icon, Note01Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

    import { getPropertyById } from '$lib/data/properties';
    import { services } from '$lib/data/services';

    interface Props {
        event: BookingEvent;
        isOwn?: boolean;
    }

    let { event, isOwn = false }: Props = $props();

    const serviceName = $derived(
        services.find(s => s.id === event.propertyId)?.name ?? 'Nuova Prenotazione'
    );

    const propertyPlace = $derived.by(() => {
        const property = event.propertyId ? getPropertyById(event.propertyId) : undefined;
        return (property?.name ?? event.propertyId ?? '') + (event.place ? `, ${event.place}` : '');
    });

    function formatSlot(slot?: { start: string; end: string }) {
        if (!slot) return 'Orario da definire';
        const starts = new Date(slot.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const ends = new Date(slot.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const day = new Date(slot.start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        return `${day} · ${starts} – ${ends}`;
    }
</script>

<div class="flex flex-col items-center w-full mb-4">
    <div class="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center gap-3 bg-slate-50/50 px-4 py-4">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-amber-900 text-white">
                <HugeiconsIcon icon={Add01Icon} size={20} />
            </div>
            <div>
                <span class="text-[11px] font-bold uppercase tracking-widest text-amber-900 block mb-0.5">
                    {serviceName}
                </span>
                {#if event.description}
                    <p class="text-[11px] font-medium text-amber-900/70 leading-tight line-clamp-2 italic">
                        "{event.description}"
                    </p>
                {/if}
            </div>
        </div>

        <div class="space-y-3 px-4 pb-4">
            {#if event.slot}
                <div class="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                        <HugeiconsIcon icon={Clock01Icon} size={14} />
                    </div>
                    <span>{formatSlot(event.slot)}</span>
                </div>
            {/if}

            {#if propertyPlace}
                <div class="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                    <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                        <HugeiconsIcon icon={Location01Icon} size={14} />
                    </div>
                    <span class="line-clamp-1">{propertyPlace}</span>
                </div>
            {/if}
        </div>
    </div>
    <span class="mt-2 text-[10px] font-medium text-slate-400">
        {formatChatTime(event.at)}
    </span>
</div>
