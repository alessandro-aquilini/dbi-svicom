<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import {
        Tick02Icon,
        Cancel01Icon,
        Clock01Icon,
        Calendar03Icon,
        Add01Icon,
        LockIcon,
    } from '@hugeicons/core-free-icons';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

    interface Props {
        event: BookingEvent;
    }

    let { event }: Props = $props();

    const config = {
        booking_created: {
            icon: Add01Icon,
            label: 'Prenotazione creata',
            color: 'text-sky-600 bg-sky-50',
        },
        confirmed: {
            icon: Tick02Icon,
            label: 'Prenotazione confermata',
            color: 'text-emerald-600 bg-emerald-50',
        },
        declined: {
            icon: Cancel01Icon,
            label: 'Richiesta rifiutata',
            color: 'text-rose-600 bg-rose-50',
        },
        booking_updated: {
            icon: Clock01Icon,
            label: 'Prenotazione aggiornata',
            color: 'text-amber-600 bg-amber-50',
        },
        cancelled: {
            icon: Cancel01Icon,
            label: 'Prenotazione annullata',
            color: 'text-slate-600 bg-slate-100',
        },
        closed: {
            icon: LockIcon,
            label: 'Pratica chiusa',
            color: 'text-slate-600 bg-slate-100',
        },
    };

    const c = $derived(
        config[event.kind] || {
            icon: Calendar03Icon,
            label: event.kind,
            color: 'text-slate-500 bg-slate-100',
        },
    );
</script>

<div class="flex flex-col gap-3 py-3">
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg {c.color}">
                <HugeiconsIcon icon={c.icon} size={18} />
            </div>
            <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900">{c.label}</p>
                {#if event.place}
                    <p class="mt-1 text-sm text-slate-600">{event.place}</p>
                {/if}
            </div>
            <span
                class="text-xs font-semibold text-slate-500 whitespace-nowrap"
                title={formatChatTooltip(event.at)}
            >
                {formatChatTime(event.at)}
            </span>
        </div>

        {#if event.description}
            <div class="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                {event.description}
            </div>
        {/if}
    </div>
</div>
