<script lang="ts">
	import { getCurrentUserId } from '$lib/auth';
	import { getSupplierEvents } from './utils';
	import type { CalendarView, CalendarEvent, EventType } from './types';
	import CalendarSidebar from './CalendarSidebar.svelte';
	import CalendarToolbar from './CalendarToolbar.svelte';
	import CalendarDayView from './CalendarDayView.svelte';
	import CalendarWeekView from './CalendarWeekView.svelte';
	import CalendarMonthView from './CalendarMonthView.svelte';
	import CalendarEventDialog from './CalendarEventDialog.svelte';
	import { DemoDialog } from '$lib/components/shared';

	let view = $state<CalendarView>('week');
	let currentDate = $state(new Date());
	let selectedTypes = $state<EventType[]>(['sopralluogo', 'intervento', 'servizio']);
	let selectedEvent = $state<CalendarEvent | null>(null);
	let isDialogOpen = $state(false);
	let isCreateOpen = $state(false);

	let sidebarCollapsed = $state(false);

	const supplierId = getCurrentUserId() || 'frn-idroclima-nord';
	const allEvents = $derived(getSupplierEvents(supplierId));
	const filteredEvents = $derived(allEvents.filter((e) => selectedTypes.includes(e.type)));

	function handleEventClick(event: CalendarEvent) {
		selectedEvent = event;
		isDialogOpen = true;
	}

	function handleToday() {
		currentDate = new Date();
	}
</script>

<div class="flex-1 min-h-0 flex w-full bg-white overflow-hidden">
	{#if !sidebarCollapsed}
		<div class="flex-none border-r border-slate-200">
			<CalendarSidebar
				bind:selectedTypes
				bind:currentDate
				onCreateEvent={() => (isCreateOpen = true)}
				collapsed={sidebarCollapsed}
				onToggle={() => (sidebarCollapsed = !sidebarCollapsed)}
			/>
		</div>
	{/if}

	<div class="flex-1 min-h-0 flex flex-col overflow-hidden">
		<div class="flex-none border-b border-slate-100">
			<CalendarToolbar bind:view bind:currentDate onToday={handleToday} bind:sidebarCollapsed />
		</div>

		<div class="flex-1 min-h-0 relative overflow-hidden">
			{#if view === 'day'}
				<CalendarDayView {currentDate} events={filteredEvents} onEventClick={handleEventClick} />
			{:else if view === 'week'}
				<CalendarWeekView {currentDate} events={filteredEvents} onEventClick={handleEventClick} />
			{:else}
				<CalendarMonthView {currentDate} events={filteredEvents} onEventClick={handleEventClick} />
			{/if}
		</div>
	</div>
</div>

<CalendarEventDialog bind:open={isDialogOpen} event={selectedEvent} />

<DemoDialog bind:open={isCreateOpen} title="Crea Evento" description="Questa funzionalità permette di pianificare nuovi sopralluoghi o interventi. Per ora è solo una demo." />
