<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Calendar03Icon, Location01Icon, Note01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

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
    <div class="max-w-[85%] rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all text-slate-900">
        <div class="flex items-center gap-2 mb-3 text-sm font-semibold">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
            </div>
            <span>{isOwn ? 'Hai modificato i dettagli' : 'Prenotazione aggiornata'}</span>
            <span class="ml-auto text-xs font-semibold text-slate-500" title={formatChatTooltip(event.at)}>
                {formatChatTime(event.at)}
            </span>
        </div>

        <div class="space-y-3 text-sm text-slate-600">
            {#if event.slot}
                <div class="flex items-center gap-2.5 text-sm text-slate-700">
                    <HugeiconsIcon icon={Calendar03Icon} size={14} class="text-slate-400" />
                    <span class="font-medium">{formatSlot(event.slot)}</span>
                </div>
            {/if}

            {#if event.place}
                <div class="flex items-center gap-2.5 text-sm text-slate-700">
                    <HugeiconsIcon icon={Location01Icon} size={14} class="text-slate-400" />
                    <span class="font-medium">{event.place}</span>
                </div>
            {/if}

            {#if event.description}
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                    <div class="flex items-start gap-2.5">
                        <HugeiconsIcon icon={Note01Icon} size={14} class="mt-0.5 text-slate-400" />
                        <p>{event.description}</p>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
