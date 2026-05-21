<script lang="ts">
	import type { CalendarEvent, EventType } from './types';
	import { formatTime } from './utils';
	import { EVENT_COLORS } from './types';

	let { event, onclick } = $props<{
		event: CalendarEvent;
		onclick: (e: CalendarEvent) => void;
	}>();

	const durationHours = $derived((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60));
	const startHour = $derived(event.start.getHours() + event.start.getMinutes() / 60);
	const colorClass = $derived(EVENT_COLORS[event.type as EventType]);
</script>

<button
	onclick={() => onclick(event)}
	class={`absolute inset-x-1 sm:inset-x-2 rounded-lg border p-2 text-left transition-all hover:brightness-95 group overflow-hidden ${colorClass}`}
	style={`top: ${startHour * 64}px; height: ${durationHours * 64}px;`}
>
	<div class="text-[11px] font-bold leading-none truncate uppercase tracking-wider mb-1 opacity-70">
		{event.type}
	</div>
	<div class="text-xs font-semibold leading-tight line-clamp-2">{event.title}</div>
	<div class="text-[10px] mt-1 font-medium opacity-80">
		{formatTime(event.start)} - {formatTime(event.end)}
	</div>
</button>
