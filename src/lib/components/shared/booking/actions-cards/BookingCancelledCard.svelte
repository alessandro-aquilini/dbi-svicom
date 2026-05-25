<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Cancel01Icon } from '@hugeicons/core-free-icons';
    import { format } from 'date-fns';
    import { it } from 'date-fns/locale';

    interface Props {
        event: BookingEvent;
        isOwn?: boolean;
    }

    let { event, isOwn = false }: Props = $props();
</script>

<div class="flex flex-col items-center w-full my-2">
    <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full ring-1 ring-red-100 bg-red-50 text-red-700 shadow-sm">
        <HugeiconsIcon icon={Cancel01Icon} size={14} />
        <span class="text-[11px] font-bold uppercase tracking-widest leading-none">
            {isOwn ? 'Hai annullato la prenotazione' : 'Prenotazione annullata'}
        </span>
    </div>
    <span class="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
        {format(new Date(event.at), 'HH:mm', { locale: it })}
    </span>
</div>
