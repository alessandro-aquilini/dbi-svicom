<script lang="ts">
    import type { TicketEvent } from '$lib/data/ticket/tickets';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { LockIcon } from '@hugeicons/core-free-icons';
    import { formatChatTime } from '$lib/utils/dates';

    interface Props {
        event: TicketEvent;
    }

    let { event }: Props = $props();
    const note = $derived(event.body ?? 'La pratica è stata chiusa.');
</script>

<div class="flex flex-col items-center w-full mb-4">
    <div class="w-full max-w-85 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center gap-3 px-4 py-4 bg-slate-50/80">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                <HugeiconsIcon icon={LockIcon} size={20} />
            </div>
            <div>
                <h4 class="text-sm font-bold text-slate-900 leading-tight">Ticket chiuso</h4>
                <p class="text-xs uppercase tracking-[0.24em] text-slate-500 mt-1">La pratica è terminata</p>
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
