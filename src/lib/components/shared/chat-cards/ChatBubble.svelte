<script lang="ts">
    import type { BookingMessage } from '$lib/data/ticket/booking';
    import { formatChatTime } from '$lib/utils/dates';

    interface Props {
        message: BookingMessage;
        isOwn: boolean;
    }

    let { message, isOwn }: Props = $props();
</script>

<div class="flex flex-col w-full {isOwn ? 'items-end' : 'items-start'} mb-1 last:mb-0">
    <div
        class="max-w-[85%] md:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm transition-all
        {isOwn
            ? 'bg-[#5D7D94] text-white rounded-tr-none shadow-sm shadow-[#5D7D94]/10'
            : 'bg-white text-slate-900 rounded-tl-none shadow-sm ring-1 ring-slate-100'}"
    >
        {message.text}
    </div>
    <span class="mt-1 px-1 text-[10px] font-medium text-slate-400 {isOwn ? 'text-right' : 'text-left'}">
        {formatChatTime(message.timestamp)}
    </span>
</div>
