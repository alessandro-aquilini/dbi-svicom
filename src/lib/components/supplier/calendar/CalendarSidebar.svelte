<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Add01Icon, Calendar03Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import type { EventType } from './types';
	import { EVENT_COLORS_DOT } from './types';
	import { getDaysInMonth } from './utils';

	let { 
		selectedTypes = $bindable([]),
		currentDate = $bindable(new Date()),
		onCreateEvent,
		collapsed = $bindable(false),
		onToggle
	} = $props<{
		selectedTypes: EventType[];
		onCreateEvent: () => void;
		currentDate: Date;
		collapsed?: boolean;
		onToggle?: () => void;
	}>();

	let miniDate = $state(new Date(currentDate));

	$effect(() => {
		// Sync mini calendar month when main calendar date changes
		miniDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
	});

	const types: { value: EventType; label: string }[] = [
		{ value: 'sopralluogo', label: 'Sopralluoghi' },
		{ value: 'intervento', label: 'Interventi' },
		{ value: 'servizio', label: 'Servizi' }
	];

	const miniMonthDays = $derived.by(() => {
		const y = miniDate.getFullYear();
		const m = miniDate.getMonth();
		const days: { date: Date; currentMonth: boolean }[] = [];
		const firstDayOfMonth = new Date(y, m, 1);
		const startOffset = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
		const leading = startOffset - 1;
		
		for (let i = leading; i >= 1; i--) {
			days.push({ date: new Date(y, m, 1 - i), currentMonth: false });
		}

		const actualDays = getDaysInMonth(y, m);
		for (const d of actualDays) {
			days.push({ date: d, currentMonth: true });
		}

		let nextMonthDay = 1;
		while (days.length < 42) {
			days.push({ date: new Date(y, m + 1, nextMonthDay), currentMonth: false });
			nextMonthDay++;
		}
		return days;
	});

	const monthLabel = $derived(miniDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' }));

	function changeMiniMonth(offset: number) {
		miniDate = new Date(miniDate.getFullYear(), miniDate.getMonth() + offset, 1);
	}

	function selectDate(date: Date) {
		currentDate = new Date(date);
	}

	function toggleType(type: EventType) {
		if (selectedTypes.includes(type)) {
			selectedTypes = selectedTypes.filter((t: EventType) => t !== type);
		} else {
			selectedTypes = [...selectedTypes, type];
		}
	}

    
</script>

<aside class="w-64 flex flex-col gap-8 bg-white" aria-hidden={collapsed}>
	<div class="p-6 flex flex-col gap-8">
		<button
			onclick={onCreateEvent}
			class="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
		>
			<HugeiconsIcon icon={Add01Icon} size="18" />
			<span>Nuovo evento</span>
		</button>

		<!-- Mini Month Calendar -->
		<div class="px-1">
			<div class="flex items-center justify-between mb-4">
				<span class="text-sm font-semibold text-slate-900 first-letter:uppercase">{monthLabel}</span>
				<div class="flex items-center gap-1">
					<button
						class="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
						onclick={() => changeMiniMonth(-1)}
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size="16" />
					</button>
					<button
						class="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
						onclick={() => changeMiniMonth(1)}
					>
						<HugeiconsIcon icon={ArrowRight01Icon} size="16" />
					</button>
				</div>
			</div>

			<div class="grid grid-cols-7 gap-y-1 mb-2">
				{#each ['L', 'M', 'M', 'G', 'V', 'S', 'D'] as day}
					<div class="text-[10px] font-bold text-slate-400 text-center uppercase">
						{day}
					</div>
				{/each}
				{#each miniMonthDays as { date, currentMonth }}
					<button
						onclick={() => selectDate(date)}
						class="aspect-square flex items-center justify-center text-[11px] font-medium rounded-full transition-all
							{date.toDateString() === currentDate.toDateString()
								? 'bg-blue-100 text-blue-700'
								: date.toDateString() === new Date().toDateString()
									? 'bg-slate-900 text-white'
									: currentMonth
										? 'text-slate-700 hover:bg-slate-100'
										: 'text-slate-300 hover:bg-slate-50'}"
					>
						{date.getDate()}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<div class="flex items-center gap-2 mb-4 px-1">
				<HugeiconsIcon icon={Calendar03Icon} size="18" class="text-slate-400" />
				<h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Calendari</h3>
			</div>
			<div class="space-y-1">
				{#each types as type}
					<label
						class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
					>
						<input
							type="checkbox"
							checked={selectedTypes.includes(type.value)}
							onchange={() => toggleType(type.value)}
							class="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
						/>
						<div class="flex items-center gap-2 flex-1">
							<div class={`w-2 h-2 rounded-full ${EVENT_COLORS_DOT[type.value]}`}></div>
							<span class="text-sm font-medium text-slate-600">{type.label}</span>
						</div>
					</label>
				{/each}
			</div>
		</div>
	</div>
</aside>
