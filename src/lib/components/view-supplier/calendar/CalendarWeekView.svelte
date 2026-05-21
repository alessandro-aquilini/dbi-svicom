<script lang="ts">
	import type { CalendarEvent, EventType } from './types';
	import { getWeekDays, formatTime } from './utils';
	import { EVENT_COLORS_DOT } from './types';

	let { 
		currentDate, 
		events, 
		onEventClick 
	} = $props<{
		currentDate: Date;
		events: CalendarEvent[];
		onEventClick: (e: CalendarEvent) => void;
	}>();

	const weekDays = $derived.by(() => getWeekDays(currentDate));
	const hours = Array.from({ length: 24 }, (_, i) => i);

	function getDayEvents(day: Date) {
		return events.filter((e: CalendarEvent) => e.start.toDateString() === day.toDateString())
			.sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime());
	}
</script>

<div class="h-full min-h-0 overflow-hidden flex flex-col bg-slate-50/30">
	<div class="grid grid-cols-7 border-b border-slate-200 bg-white sticky top-0 z-20">
		{#each weekDays as day}
			<div class="py-4 text-center border-r last:border-r-0 border-slate-100">
				<div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
					{new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(day)}
				</div>
				<div
					class="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-bold {day.toDateString() ===
					new Date().toDateString()
						? 'bg-slate-900 text-white'
						: 'text-slate-900'}"
				>
					{day.getDate()}
				</div>
			</div>
		{/each}
	</div>

	<div class="flex-1 min-h-0 overflow-y-auto">
		<div class="grid grid-cols-7 h-full min-h-0">
			{#each weekDays as day}
				<div class="border-r last:border-r-0 border-slate-100 p-2 min-h-0 flex flex-col h-full overflow-hidden">
					<div class="flex-1 min-h-0 space-y-2 overflow-y-auto">
						{#each getDayEvents(day) as event (event.id)}
							<button
								onclick={() => onEventClick(event)}
								class="w-full text-left bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group"
							>
								<div class="flex items-center gap-1.5 mb-1.5">
									<div class={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS_DOT[event.type as EventType]}`}></div>
									<span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">
										{formatTime(event.start)}
									</span>
								</div>
								<div class="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
									{event.title}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
