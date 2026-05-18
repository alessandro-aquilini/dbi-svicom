<script lang="ts">
	import type { CalendarEvent, EventType } from './types';
	import { EVENT_COLORS_DOT } from './types';

	let { currentDate, events } = $props<{
		currentDate: Date;
		events: CalendarEvent[];
	}>();

	const months = Array.from({ length: 12 }, (_, i) => i);
	const year = $derived(currentDate.getFullYear());

	function getMonthDays(m: number) {
		const days = [];
		const date = new Date(year, m, 1);
		const firstDay = date.getDay() || 7; // Monday = 1
		for (let i = 1; i < firstDay; i++) days.push(null);
		while (date.getMonth() === m) {
			days.push(new Date(date));
			date.setDate(date.getDate() + 1);
		}
		return days;
	}

	function getDayEvents(day: Date) {
		return events.filter((e: CalendarEvent) => e.start.toDateString() === day.toDateString());
	}
</script>

<div class="flex-1 overflow-y-auto p-10 bg-slate-50/30">
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12 max-w-7xl mx-auto">
		{#each months as month}
			<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
				<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 text-center">
					{new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date(year, month, 1))}
				</h3>
				<div class="grid grid-cols-7 text-center mb-4">
					{#each ['L', 'M', 'M', 'G', 'V', 'S', 'D'] as d}
						<div class="text-[10px] font-bold text-slate-300">{d}</div>
					{/each}
				</div>
				<div class="grid grid-cols-7 gap-y-3">
					{#each getMonthDays(month) as day}
						<div class="aspect-square flex flex-col items-center group">
							{#if day}
								<span
									class="text-[11px] font-medium transition-colors {day.toDateString() ===
									new Date().toDateString()
										? 'bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-full'
										: 'text-slate-600 group-hover:text-slate-900'}"
								>
									{day.getDate()}
								</span>
								<div class="flex gap-0.5 mt-1 h-1">
									{#each getDayEvents(day).slice(0, 3) as ev}
										<div class="w-1 h-1 rounded-full {EVENT_COLORS_DOT[ev.type as EventType]}"></div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
