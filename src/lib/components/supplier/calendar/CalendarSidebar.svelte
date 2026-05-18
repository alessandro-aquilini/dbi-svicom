<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Add01Icon, Calendar03Icon } from '@hugeicons/core-free-icons';
	import type { EventType } from './types';
	import { EVENT_COLORS_DOT } from './types';

	let { 
		selectedTypes = $bindable([]),
		onCreateEvent,
		collapsed = $bindable(false),
		onToggle
	} = $props<{
		selectedTypes: EventType[];
		onCreateEvent: () => void;
		collapsed?: boolean;
		onToggle?: () => void;
	}>();

	const types: { value: EventType; label: string }[] = [
		{ value: 'sopralluogo', label: 'Sopralluoghi' },
		{ value: 'intervento', label: 'Interventi' },
		{ value: 'servizio', label: 'Servizi' }
	];

	function toggleType(type: EventType) {
		if (selectedTypes.includes(type)) {
			selectedTypes = selectedTypes.filter((t: EventType) => t !== type);
		} else {
			selectedTypes = [...selectedTypes, type];
		}
	}

    
</script>

<aside class={`w-64 border-r border-slate-200 p-6 flex flex-col gap-8 bg-white/50 ${collapsed ? 'hidden' : ''}`} aria-hidden={collapsed}>
	<button
		onclick={onCreateEvent}
		class="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
	>
		<HugeiconsIcon icon={Add01Icon} size="18" />
		<span>Nuovo evento</span>
	</button>

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
</aside>
