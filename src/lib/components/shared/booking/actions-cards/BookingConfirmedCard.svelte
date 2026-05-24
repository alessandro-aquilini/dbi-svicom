<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Tick02Icon } from '@hugeicons/core-free-icons';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

    interface Props {
        event: BookingEvent;
        isOwn?: boolean;
    }

    let { event, isOwn = false }: Props = $props();
</script>

<div class="flex w-full">
    <div class="{isOwn ? 'ml-auto' : 'mr-auto'} max-w-[85%]">
        <div class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors {isOwn ? 'bg-emerald-600 text-white border-transparent' : ''}">
            <HugeiconsIcon icon={Tick02Icon} size={16} />
            <span>{isOwn ? 'Hai preso in carico il servizio' : 'Servizio preso in carico'}</span>
            <span class="ml-auto text-xs font-semibold text-slate-500" title={formatChatTooltip(event.at)}>{formatChatTime(event.at)}</span>
        </div>
    </div>
</div>
