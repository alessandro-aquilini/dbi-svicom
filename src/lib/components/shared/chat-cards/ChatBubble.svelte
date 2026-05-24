<script lang="ts">
    import type { BookingMessage } from '$lib/data/ticket/booking';
    import { formatChatTime } from '$lib/utils/dates';

    interface Props {
        message: BookingMessage;
        isOwn: boolean;
    }

    let { message, isOwn }: Props = $props();
</script>

<div class="flex flex-col w-full {isOwn ? 'items-end' : 'items-start'}">
    <div
        class="max-w-[72%] px-4 py-3 rounded-xl border border-slate-200 text-sm shadow-sm transition-colors
        {isOwn
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-white text-slate-900'}"
    >
        {message.text}
    </div>
    <span class="mt-2 text-[11px] text-slate-500 {isOwn ? 'text-right' : 'text-left'}">
        {formatChatTime(message.timestamp)}
    </span>
</div>
