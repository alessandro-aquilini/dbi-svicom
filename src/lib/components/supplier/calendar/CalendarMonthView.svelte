<script lang="ts">
	import type { CalendarEvent, EventType } from './types';
	import { EVENT_COLORS_DOT } from './types';
	import { getDaysInMonth } from './utils';

	let { currentDate, events, onEventClick } = $props<{
		currentDate: Date;
		events: CalendarEvent[];
		onEventClick: (e: CalendarEvent) => void;
	}>();

	const year = $derived.by(() => currentDate.getFullYear());
	const month = $derived.by(() => currentDate.getMonth());

	const monthDays = $derived.by(() => {
		const y = currentDate.getFullYear();
		const m = currentDate.getMonth();
		const days: { date: Date; currentMonth: boolean }[] = [];
		const firstDayOfMonth = new Date(y, m, 1);
		// Map JS getDay() (0=Sun .. 6=Sat) to Monday-first (1=Mon .. 7=Sun)
		const startOffset = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay(); // Monday = 1

		// Number of leading days from previous month
		const leading = startOffset - 1;
		for (let i = leading; i >= 1; i--) {
			// 1 - i gives dates counting backwards into the previous month in ascending order
			const prevDate = new Date(y, m, 1 - i);
			days.push({ date: prevDate, currentMonth: false });
		}

		const actualDays = getDaysInMonth(y, m);
		for (const d of actualDays) {
			days.push({ date: d, currentMonth: true });
		}

		// pad to 6*7 cells with days from next month
		let nextMonthDay = 1;
		while (days.length < 42) {
			const nextDate = new Date(y, m + 1, nextMonthDay);
			days.push({ date: nextDate, currentMonth: false });
			nextMonthDay++;
		}

		return days;
	});

	function getDayEvents(day: Date) {
		return events.filter((e: CalendarEvent) => e.start.toDateString() === day.toDateString())
			.sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime());
	}
</script>

<div class="flex-1 h-full overflow-hidden flex flex-col bg-white min-h-105">
	<div class="grid grid-cols-7 border-b border-slate-200">
		{#each ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'] as day}
			<div class="py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
				{day}
			</div>
		{/each}
	</div>

	<div class="flex-1 h-full min-h-0 grid grid-cols-7 grid-rows-6 auto-rows-fr">
		{#each monthDays as { date, currentMonth }}
			<div
				class="border-r border-b border-slate-100 p-2 flex flex-col gap-1 min-h-0 overflow-hidden {currentMonth
					? 'bg-white'
					: 'bg-slate-50/50'}"
			>
				<div
					class="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1 {date.toDateString() ===
					new Date().toDateString()
						? 'bg-slate-900 text-white'
						: currentMonth
							? 'text-slate-900'
							: 'text-slate-300'}"
				>
					{date.getDate()}
				</div>
				<!-- limit visible events to avoid changing cell height; show +N when more -->
				<div class="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
					{#each getDayEvents(date).slice(0, 3) as event}
						<button
							onclick={() => onEventClick(event)}
							class="w-full text-left px-2 py-1 rounded-md text-[10px] font-semibold truncate transition-colors border {currentMonth ? 'hover:bg-slate-50' : 'opacity-60'}"
							title={event.title}
						>
							<div class="flex items-center gap-1.5">
								<div class={`w-1.5 h-1.5 rounded-full shrink-0 ${EVENT_COLORS_DOT[event.type as EventType]}`}></div>
								<span class="truncate">{event.title}</span>
							</div>
						</button>
					{/each}

					{#if getDayEvents(date).length > 3}
						<div class="text-[11px] text-slate-500 px-2 py-0.5">+{getDayEvents(date).length - 3} altro</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
