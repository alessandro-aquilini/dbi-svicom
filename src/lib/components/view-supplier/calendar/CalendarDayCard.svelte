<script lang="ts">
    import type { CalendarEvent } from './types';
    import { formatTime } from './utils';
    import { EVENT_COLORS_DOT } from './types';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { Location01Icon, Clock01Icon } from '@hugeicons/core-free-icons';

    import type { EventType } from './types';

    let { event, onclick } = $props<{
        event: CalendarEvent;
        onclick: (e: CalendarEvent) => void;
    }>();
</script>

<button onclick={() => onclick(event)} class="w-full text-left bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
    <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
                <div class={`w-2 h-2 rounded-full ${EVENT_COLORS_DOT[event.type as EventType]}`}></div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{event.type}</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-slate-700 transition-colors">{event.title}</h3>
            <div class="flex flex-wrap gap-x-6 gap-y-2">
                <div class="flex items-center gap-2 text-slate-500">
                    <HugeiconsIcon icon={Clock01Icon} size="16" class="text-slate-300" />
                    <span class="text-sm font-medium">{formatTime(event.start)} — {formatTime(event.end)}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-500">
                    <HugeiconsIcon icon={Location01Icon} size="16" class="text-slate-300" />
                    <span class="text-sm font-medium">{event.location}</span>
                </div>
            </div>
        </div>
        <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Durata</div>
            <div class="text-sm font-bold text-slate-900">{Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))} min</div>
        </div>
    </div>
</button>
