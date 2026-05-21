<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		ArrowRight01Icon,
		Task01Icon,
		InformationCircleIcon,
		Location01Icon,
		Clock01Icon,
		Ticket01Icon,
		Message01Icon,
		Calendar03Icon,
		Menu01Icon
	} from '@hugeicons/core-free-icons';
	import type { CalendarView } from './types';

	let {
		view = $bindable(),
		currentDate = $bindable(),
		sidebarCollapsed = $bindable(),
		onToday
	} = $props<{
		view: CalendarView;
		currentDate: Date;
		sidebarCollapsed: boolean;
		onToday: () => void;
	}>();

	const views: { value: CalendarView; label: string }[] = [
		{ value: 'day', label: 'Giorno' },
		{ value: 'week', label: 'Settimana' },
		{ value: 'month', label: 'Mese' }
	];

	const titleFmt = $derived(
		new Intl.DateTimeFormat('it-IT', {
			month: 'long',
			year: 'numeric',
			...(view === 'day' ? { day: 'numeric' } : {})
		})
	);

	const weekTitle = $derived.by(() => {
		if (view !== 'week') return titleFmt.format(currentDate);

		const first = new Date(currentDate);
		const day = first.getDay();
		const diff = first.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
		first.setDate(diff);

		const last = new Date(first);
		last.setDate(first.getDate() + 6);

		const monthFmt = new Intl.DateTimeFormat('it-IT', { month: 'long' });
		const yearFmt = new Intl.DateTimeFormat('it-IT', { year: 'numeric' });

		if (first.getMonth() === last.getMonth()) {
			return `${first.getDate()}-${last.getDate()} ${monthFmt.format(first)} ${yearFmt.format(first)}`;
		} else if (first.getFullYear() === last.getFullYear()) {
			return `${first.getDate()} ${monthFmt.format(first)} - ${last.getDate()} ${monthFmt.format(last)} ${yearFmt.format(first)}`;
		} else {
			return `${first.getDate()} ${monthFmt.format(first)} ${yearFmt.format(first)} - ${last.getDate()} ${monthFmt.format(last)} ${yearFmt.format(last)}`;
		}
	});

	function navigate(direction: number) {
		const next = new Date(currentDate);
		if (view === 'day') next.setDate(next.getDate() + direction);
		else if (view === 'week') next.setDate(next.getDate() + direction * 7);
		else if (view === 'month') next.setMonth(next.getMonth() + direction);
		currentDate = next;
	}
</script>

<div class="h-16 px-6 flex items-center bg-white">
	<div class="flex items-center gap-6 flex-1">
		<div class="flex items-center gap-2">
			<button
				onclick={onToday}
				class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
			>
				Oggi
			</button>

			<div class="flex items-center rounded-lg border border-slate-200 overflow-hidden">
				<button
					onclick={() => navigate(-1)}
					class="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border-r border-slate-200"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size="18" />
				</button>
				<button
					onclick={() => navigate(1)}
					class="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600"
				>
					<HugeiconsIcon icon={ArrowRight01Icon} size="18" />
				</button>
			</div>
		</div>

		<h1 class="text-lg font-semibold text-slate-900 capitalize min-w-50">
			{weekTitle}
		</h1>
	</div>

	<div class="flex items-center bg-slate-100 p-1 rounded-xl flex-none">
		{#each views as v}
			<button
				onclick={() => (view = v.value)}
				class="px-4 py-1.5 text-sm font-medium rounded-lg transition-all {view === v.value
					? 'bg-white text-slate-900 shadow-sm'
					: 'text-slate-500 hover:text-slate-700'}"
			>
				{v.label}
			</button>
		{/each}
	</div>
</div>
