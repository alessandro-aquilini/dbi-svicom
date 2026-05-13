<script lang="ts">
    import type { BookingMessage } from '$lib/data/ticket/booking';
    import { format } from 'date-fns';
    import { it } from 'date-fns/locale';

    interface Props {
        message: BookingMessage;
        isOwn: boolean;
    }

    let { message, isOwn }: Props = $props();
</script>

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full">
    <div 
        class="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm
        {isOwn 
            ? 'bg-[#5D7D94] text-white rounded-tr-none' 
            : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'}"
    >
        {message.text}
    </div>
    <span class="text-[10px] text-muted-foreground mt-1 px-1">
        {format(new Date(message.timestamp), "HH:mm", { locale: it })}
    </span>
</div>
