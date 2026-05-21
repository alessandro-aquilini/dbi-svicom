<script lang="ts">
    import type { CalendarEvent, EventType } from './types';
    import { formatTime } from './utils';
    import { EVENT_COLORS_DOT } from './types';

    let { event, onclick } = $props<{
        event: CalendarEvent;
        onclick: (e: CalendarEvent) => void;
    }>();
</script>

<button onclick={() => onclick(event)} class="w-full text-left bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
    <div class="flex items-center gap-2">
        <div class={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS_DOT[event.type as EventType]}`}></div>
        <div class="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">{event.title}</div>
    </div>
</button>
