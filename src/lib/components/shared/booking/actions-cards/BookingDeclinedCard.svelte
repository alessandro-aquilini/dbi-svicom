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

<div class="flex w-full">
    <div class="{isOwn ? 'ml-auto' : 'mr-auto'} max-w-[85%]">
        <div class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-colors {isOwn ? 'bg-rose-500 text-white border-transparent' : 'bg-slate-100 text-slate-700 border-slate-200'}">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
            <span>{isOwn ? 'Hai rifiutato la prenotazione' : 'Richiesta rifiutata'}</span>
        </div>
        <p class="mt-1 text-[10px] {isOwn ? 'text-slate-200 text-right' : 'text-slate-400'}">
            {format(new Date(event.at), 'd MMM · HH:mm', { locale: it })}
        </p>
    </div>
</div>
