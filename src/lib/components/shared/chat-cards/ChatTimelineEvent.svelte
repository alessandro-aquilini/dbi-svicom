<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { 
        Tick02Icon, 
        Cancel01Icon, 
        Clock01Icon, 
        Calendar03Icon,
        Add01Icon,
        LockIcon
    } from '@hugeicons/core-free-icons';
    import { format } from 'date-fns';
    import { it } from 'date-fns/locale';

    interface Props {
        event: BookingEvent;
    }

    let { event }: Props = $props();

    const config = {
		booking_created: { icon: Add01Icon, label: 'Prenotazione creata', color: 'text-blue-500 bg-blue-50' },
		confirmed: { icon: Tick02Icon, label: 'Prenotazione confermata', color: 'text-emerald-500 bg-emerald-50' },
		declined: { icon: Cancel01Icon, label: 'Richiesta rifiutata', color: 'text-red-500 bg-red-50' },
		booking_updated: { icon: Clock01Icon, label: 'Prenotazione aggiornata', color: 'text-amber-500 bg-amber-50' },
		cancelled: { icon: Cancel01Icon, label: 'Prenotazione annullata', color: 'text-slate-400 bg-slate-50' },
		closed: { icon: LockIcon, label: 'Pratica chiusa', color: 'text-slate-500 bg-slate-100' }
	};

	const c = $derived(config[event.kind] || { icon: Calendar03Icon, label: event.kind, color: 'text-slate-400 bg-slate-50' });
</script>

<div class="flex flex-col items-center gap-2 py-4">
    <div class="h-px bg-slate-100 w-full mb-1"></div>
    <div class="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 bg-white shadow-sm ring-4 ring-slate-50">
        <div class="w-6 h-6 rounded-full flex items-center justify-center {c.color}">
            <HugeiconsIcon icon={c.icon} size={14} />
        </div>
        <span class="text-xs font-bold text-slate-700 whitespace-nowrap">{c.label}</span>
        <span class="text-[10px] text-slate-400 font-medium">
            {format(new Date(event.at), "d MMM, HH:mm", { locale: it })}
        </span>
    </div>
    {#if event.place || event.description}
        <div class="max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600">
            {#if event.place}
                <div class="flex items-center gap-2 mb-1 text-slate-500">
                    <HugeiconsIcon icon={Calendar03Icon} size={14} />
                    <span>{event.place}</span>
                </div>
            {/if}
            {#if event.description}
                <div class="text-sm leading-5">{event.description}</div>
            {/if}
        </div>
    {/if}
</div>
