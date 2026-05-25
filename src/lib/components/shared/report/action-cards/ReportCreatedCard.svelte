<script lang="ts">
    import type { ReportEvent } from '$lib/data/ticket/reports';
    import { formatChatTime } from '$lib/utils/dates';

    interface Props {
        event: ReportEvent;
    }

    let { event }: Props = $props();
</script>

<div class="flex flex-col items-center w-full my-2">
    <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full ring-1 ring-blue-200 bg-blue-50 text-blue-700 shadow-sm">
        <div class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span class="text-[11px] font-bold uppercase tracking-widest leading-none">
            Segnalazione Inviata
        </span>
    </div>
    <span class="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
        {formatChatTime(event.at)}
    </span>
</div>
