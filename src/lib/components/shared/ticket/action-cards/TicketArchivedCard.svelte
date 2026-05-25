<script lang="ts">
    import type { TicketEvent } from '$lib/data/ticket/tickets';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { File01Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime } from '$lib/utils/dates';

    interface Props {
        event: TicketEvent;
    }

    let { event }: Props = $props();
    const note = $derived(event.body ?? 'La pratica è stata archiviata.');
</script>

<div class="flex flex-col items-center w-full mb-4">
    <div class="w-full max-w-85 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center gap-3 px-4 py-4 bg-slate-50/80">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                <HugeiconsIcon icon={File01Icon} size={20} />
            </div>
            <div>
                <h4 class="text-sm font-bold text-slate-900 leading-tight">Ticket archiviato</h4>
                <p class="text-xs uppercase tracking-[0.24em] text-slate-500 mt-1">Pratica spostata tra gli archivi</p>
            </div>
        </div>

        <div class="space-y-3 px-4 py-4 text-sm text-slate-600">
            <p>{note}</p>
        </div>
    </div>
    <span class="mt-1 text-[10px] font-medium text-slate-400 text-center w-full">
        {formatChatTime(event.at)}
    </span>
</div>
