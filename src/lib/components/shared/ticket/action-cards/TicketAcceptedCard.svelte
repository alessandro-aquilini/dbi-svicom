<script lang="ts">
    import type { TicketEvent } from '$lib/data/ticket/tickets';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Tick02Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime } from '$lib/utils/dates';

    interface Props {
        event: TicketEvent;
    }

    let { event }: Props = $props();
</script>

<div class="flex flex-col items-center w-full my-2">
    <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full ring-1 ring-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
        <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span class="text-[11px] font-bold uppercase tracking-widest leading-none">
            Ticket preso in carico
        </span>
    </div>
    <span class="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
        {formatChatTime(event.at)}
    </span>
</div>
