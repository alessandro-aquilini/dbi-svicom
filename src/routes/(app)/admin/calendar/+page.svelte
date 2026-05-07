<script lang="ts">
	import { interventi } from '$lib/data/events/intervento';
	import { meetings } from '$lib/data/events/meetings';
	import { assemblies } from '$lib/data/events/assemblies';
	import { users } from '$lib/data/users';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		ArrowRight01Icon,
		Add01Icon,
		Calendar03Icon
	} from '@hugeicons/core-free-icons';
	import { DemoDialog, PropertyScopeChip } from '$lib/components/shared';

	type EventTone = 'blue' | 'amber' | 'emerald';

	interface CalendarEvent {
		id: string;
		title: string;
		date: string;
		startTime: string;
		endTime: string;
		location: string;
		group: string;
		propertyId?: string;
		ticketId?: string;
		tone: EventTone;
	}

	const today = new Date();

	function pad2(n: number) {
		return n.toString().padStart(2, '0');
	}
	function toDateKey(d: Date) {
		return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
	}
	const todayKey = toDateKey(today);

	let viewMonth = $state({ year: today.getFullYear(), month: today.getMonth() });
	let selectedDate = $state<string | null>(null);
	let demoOpen = $state(false);

	const monthFmt = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });
	const weekdayLong = new Intl.DateTimeFormat('it-IT', { weekday: 'long' });
	const weekdayShort = new Intl.DateTimeFormat('it-IT', { weekday: 'short' });
	const monthOnly = new Intl.DateTimeFormat('it-IT', { month: 'long' });

	const monthLabel = $derived(monthFmt.format(new Date(viewMonth.year, viewMonth.month, 1)));

	function getUserNames(ids: string[]) {
		return ids
			.map((id) => users.find((u) => u.id === id)?.name)
			.filter(Boolean)
			.join(', ');
	}

	const allEvents = $derived.by(() => {
		const evs: CalendarEvent[] = [];

		// Interventi -> Tone Amber
		for (const m of interventi) {
			evs.push({
				id: m.id,
				title: m.title,
				date: m.date,
				startTime: m.startTime,
				endTime: m.endTime,
				location: m.location,
				group: getUserNames(m.participantIds),
				propertyId: m.propertyId,
				ticketId: m.ticketId,
				tone: 'amber'
			});
		}

		// Meetings -> Tone Blue
		for (const m of meetings) {
			evs.push({
				id: m.id,
				title: m.title,
				date: m.date,
				startTime: m.startTime,
				endTime: m.endTime,
				location: m.location,
				group: m.group || getUserNames(m.participantIds),
				propertyId: m.propertyId,
				tone: 'blue'
			});
		}

		// Assemblies -> Tone Blue
		for (const a of assemblies) {
			evs.push({
				id: a.id,
				title: `Assemblea ${a.type}`,
				date: a.scheduledAt.split('T')[0],
				startTime: a.scheduledAt.split('T')[1] ?? '',
				endTime: a.endTime || '',
				location: a.location,
				group: 'Condomini',
				propertyId: a.propertyId,
				tone: 'blue'
			});
		}

		return evs;
	});

	// Events scoped to the active property selection (sidebar). When "Tutti" is
	// selected, show every event. When a specific condominium is active, only
	// events tied to that property are visible — events without a propertyId
	// (e.g. internal team meetings) are excluded.
	const scopedEvents = $derived.by(() => {
		const id = propertySelection.selectedId;
		return id === null ? allEvents : allEvents.filter((e) => e.propertyId === id);
	});

	// Build a map of date → unique tones present that day (insertion order, capped at 3).
	const tonesByDate = $derived.by(() => {
		const map = new Map<string, EventTone[]>();
		for (const e of scopedEvents) {
			const list = map.get(e.date);
			if (!list) {
				map.set(e.date, [e.tone]);
			} else if (!list.includes(e.tone) && list.length < 3) {
				list.push(e.tone);
			}
		}
		return map;
	});

	const monthGrid = $derived.by(() => {
		const first = new Date(viewMonth.year, viewMonth.month, 1);
		// Mon=0..Sun=6
		const offset = (first.getDay() + 6) % 7;
		const start = new Date(viewMonth.year, viewMonth.month, 1 - offset);
		const cells: {
			date: Date;
			key: string;
			day: number;
			inMonth: boolean;
			tones: EventTone[];
			isToday: boolean;
		}[] = [];
		for (let i = 0; i < 42; i++) {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			const key = toDateKey(d);
			cells.push({
				date: d,
				key,
				day: d.getDate(),
				inMonth: d.getMonth() === viewMonth.month,
				tones: tonesByDate.get(key) ?? [],
				isToday: key === todayKey
			});
		}
		return cells;
	});

	const groupedEvents = $derived.by(() => {
		const inMonth = scopedEvents
			.filter((e) => {
				const [y, m] = e.date.split('-').map(Number);
				return y === viewMonth.year && m - 1 === viewMonth.month;
			})
			.sort(
				(a, b) =>
					a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
			);
		const groups = new Map<string, CalendarEvent[]>();
		for (const e of inMonth) {
			if (!groups.has(e.date)) groups.set(e.date, []);
			groups.get(e.date)!.push(e);
		}
		return [...groups.entries()].map(([date, list]) => ({ date, events: list }));
	});

	function prevMonth() {
		const m = viewMonth.month - 1;
		viewMonth = m < 0 ? { year: viewMonth.year - 1, month: 11 } : { ...viewMonth, month: m };
	}
	function nextMonth() {
		const m = viewMonth.month + 1;
		viewMonth = m > 11 ? { year: viewMonth.year + 1, month: 0 } : { ...viewMonth, month: m };
	}
	function goToday() {
		viewMonth = { year: today.getFullYear(), month: today.getMonth() };
		selectedDate = todayKey;
		scrollToDate(todayKey);
	}
	function selectDay(cell: { key: string; inMonth: boolean; date: Date }) {
		if (!cell.inMonth) {
			viewMonth = { year: cell.date.getFullYear(), month: cell.date.getMonth() };
		}
		selectedDate = cell.key;
		scrollToDate(cell.key);
	}
	function scrollToDate(key: string) {
		setTimeout(() => {
			document
				.getElementById(`day-${key}`)
				?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 0);
	}

	function dayNum(date: string) {
		return Number(date.split('-')[2]);
	}
	function dayWeekday(date: string) {
		return weekdayLong.format(new Date(date));
	}
	function dayMonthName(date: string) {
		return monthOnly.format(new Date(date));
	}

	const toneClass: Record<EventTone, string> = {
		blue: 'tone-blue',
		amber: 'tone-amber',
		emerald: 'tone-emerald'
	};

	const weekdayHeader = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

	const legend: { tone: EventTone; label: string }[] = [
		{ tone: 'blue', label: 'Incontri e assemblee' },
		{ tone: 'amber', label: 'Manutenzioni' },
		{ tone: 'emerald', label: 'Servizi' }
	];
</script>

<svelte:head>
	<title>Calendario — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Calendario</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if !propertySelection.isAll && propertySelection.selected}
					Eventi di {propertySelection.selected.name}
				{:else}
					Agenda di eventi e appuntamenti
				{/if}
			</p>
		</div>
		<button
			type="button"
			onclick={() => (demoOpen = true)}
			class="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
		>
			<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
			Nuovo evento
		</button>
	</div>

	<PropertyScopeChip gap="1.5rem" />

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
		<!-- Sidebar -->
		<aside class="space-y-4">
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<div class="mini-cal__header">
					<button
						type="button"
						onclick={prevMonth}
						class="mini-cal__nav"
						aria-label="Mese precedente"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
					</button>
					<span class="mini-cal__title">{monthLabel}</span>
					<button
						type="button"
						onclick={nextMonth}
						class="mini-cal__nav"
						aria-label="Mese successivo"
					>
						<HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
					</button>
				</div>

				<div class="mini-cal__grid" role="grid">
					{#each weekdayHeader as wd, i (i)}
						<span class="mini-cal__wd">{wd}</span>
					{/each}
					{#each monthGrid as cell (cell.key)}
						<button
							type="button"
							class="mini-cal__day"
							class:is-today={cell.isToday}
							class:is-out={!cell.inMonth}
							class:is-selected={cell.key === selectedDate}
							onclick={() => selectDay(cell)}
							aria-label={cell.date.toLocaleDateString('it-IT')}
						>
							<span>{cell.day}</span>
							{#if cell.tones.length > 0}
								<span
									class="mini-cal__dots"
									class:is-multi={cell.tones.length > 1}
									aria-hidden="true"
								>
									{#each cell.tones as tone (tone)}
										<span class="mini-cal__dot {toneClass[tone]}"></span>
									{/each}
								</span>
							{/if}
						</button>
					{/each}
				</div>

				<button type="button" onclick={goToday} class="mini-cal__today">Vai a oggi</button>
			</div>

			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<p class="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Le tue agende
				</p>
				<ul class="space-y-2">
					{#each legend as item (item.tone)}
						<li class="flex items-center gap-2 text-sm text-foreground">
							<span class="legend-dot {toneClass[item.tone]}" aria-hidden="true"></span>
							{item.label}
						</li>
					{/each}
				</ul>
			</div>
		</aside>

		<!-- Agenda -->
		<main>
			<div class="agenda-toolbar">
				<h2 class="agenda-toolbar__title">{monthLabel}</h2>
				<div class="agenda-toolbar__nav">
					<button
						type="button"
						onclick={prevMonth}
						class="agenda-toolbar__btn"
						aria-label="Mese precedente"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
					</button>
					<button type="button" onclick={goToday} class="agenda-toolbar__today">
						Oggi
					</button>
					<button
						type="button"
						onclick={nextMonth}
						class="agenda-toolbar__btn"
						aria-label="Mese successivo"
					>
						<HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
					</button>
				</div>
			</div>

			{#if groupedEvents.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center"
				>
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
						<HugeiconsIcon
							icon={Calendar03Icon}
							size={18}
							strokeWidth={1.75}
							class="text-muted-foreground"
						/>
					</div>
					<p class="mt-3 text-sm font-medium text-foreground">Nessun evento questo mese</p>
					<p class="mt-1 text-xs text-muted-foreground">
						{#if !propertySelection.isAll && propertySelection.selected}
							Su <strong>{propertySelection.selected.name}</strong> non ci sono eventi in {monthLabel}.
						{:else}
							Sfoglia gli altri mesi o crea un nuovo evento.
						{/if}
					</p>
				</div>
			{:else}
				<div class="space-y-8">
					{#each groupedEvents as group (group.date)}
						<section id="day-{group.date}" class="day-section">
							<header class="day-header">
								<div class="day-header__num">{dayNum(group.date)}</div>
								<div class="day-header__meta">
									<p class="day-header__weekday">{dayWeekday(group.date)}</p>
									<p class="day-header__sub">{dayMonthName(group.date)}</p>
								</div>
								<div class="day-header__line" aria-hidden="true"></div>
							</header>

							<ul class="day-events">
								{#each group.events as event (event.id)}
									<li class="event-row {toneClass[event.tone]}">
										<div class="event-row__time">
											<span class="event-row__time-start">{event.startTime}</span>
											<span class="event-row__time-end">{event.endTime}</span>
										</div>
										<span class="event-row__bar" aria-hidden="true"></span>
										<div class="min-w-0 flex-1">
											<h3 class="event-row__title">{event.title}</h3>
											<p class="event-row__meta">
												{event.location} · {event.group}
											</p>
											{#if event.ticketId}
												<a href="/admin/tickets" class="event-row__ticket">
													→ Vincolato a {event.ticketId}
												</a>
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						</section>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>

<DemoDialog bind:open={demoOpen} />

<style>
	/* ─── Mini calendar ─── */
	.mini-cal__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.mini-cal__title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--foreground);
		text-transform: capitalize;
	}

	.mini-cal__nav {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: 0;
		background: transparent;
		color: var(--muted-foreground);
		border-radius: 0.375rem;
		cursor: pointer;
	}

	.mini-cal__nav:hover {
		background: var(--muted);
		color: var(--foreground);
	}

	.mini-cal__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
	}

	.mini-cal__wd {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1.5rem;
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--muted-foreground);
	}

	.mini-cal__day {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1.85rem;
		font-size: 0.75rem;
		color: var(--foreground);
		background: transparent;
		border: 0;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 120ms ease, color 120ms ease;
	}

	.mini-cal__day:hover {
		background: var(--muted);
	}

	.mini-cal__day.is-out {
		color: color-mix(in oklch, var(--muted-foreground) 70%, transparent);
	}

	.mini-cal__day.is-today {
		background: color-mix(in oklch, var(--primary) 10%, transparent);
		color: var(--primary);
		font-weight: 600;
	}

	.mini-cal__day.is-selected {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.mini-cal__day.is-selected.is-today {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.mini-cal__dots {
		position: absolute;
		bottom: 3px;
		left: 50%;
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 1px;
		pointer-events: none;
	}

	.mini-cal__dot {
		width: 4px;
		height: 4px;
		border-radius: 9999px;
		background: var(--primary);
	}

	/* When more than one tone is present, dots get a white ring and overlap slightly. */
	.mini-cal__dots.is-multi .mini-cal__dot {
		width: 6px;
		height: 6px;
		box-shadow: 0 0 0 1.5px var(--card);
	}

	.mini-cal__dots.is-multi .mini-cal__dot + .mini-cal__dot {
		margin-left: -3px;
	}

	/* Inside the selected/today cell the ring color becomes the cell's background
	   to keep the contrast (cell is filled with --primary). */
	.mini-cal__day.is-selected .mini-cal__dots.is-multi .mini-cal__dot,
	.mini-cal__day.is-today:not(.is-selected) .mini-cal__dots.is-multi .mini-cal__dot {
		box-shadow: 0 0 0 1.5px var(--primary);
	}

	.mini-cal__day.is-selected .mini-cal__dots:not(.is-multi) .mini-cal__dot {
		background: var(--primary-foreground);
	}

	.mini-cal__today {
		display: block;
		width: 100%;
		margin-top: 0.625rem;
		padding: 0.375rem 0;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		background: transparent;
		border: 0;
		border-radius: 0.375rem;
		cursor: pointer;
	}

	.mini-cal__today:hover {
		background: var(--muted);
		color: var(--foreground);
	}

	/* ─── Legend ─── */
	.legend-dot {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 9999px;
		flex-shrink: 0;
	}

	.tone-blue {
		background: var(--primary);
	}

	.tone-amber {
		background: var(--warning);
	}

	.tone-emerald {
		background: var(--success, oklch(0.7 0.16 150));
	}

	/* ─── Agenda toolbar ─── */
	.agenda-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}

	.agenda-toolbar__title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--foreground);
		text-transform: capitalize;
	}

	.agenda-toolbar__nav {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 3px;
		border: 1px solid var(--border);
		border-radius: 9999px;
		background: var(--card);
	}

	.agenda-toolbar__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border: 0;
		background: transparent;
		color: var(--muted-foreground);
		border-radius: 9999px;
		cursor: pointer;
	}

	.agenda-toolbar__btn:hover {
		background: var(--muted);
		color: var(--foreground);
	}

	.agenda-toolbar__today {
		height: 1.75rem;
		padding: 0 0.75rem;
		border: 0;
		background: transparent;
		color: var(--foreground);
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 9999px;
		cursor: pointer;
	}

	.agenda-toolbar__today:hover {
		background: var(--muted);
	}

	/* ─── Day section ─── */
	.day-header {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		margin-bottom: 0.875rem;
	}

	.day-header__num {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--foreground);
		line-height: 1;
		min-width: 1.5rem;
		text-align: right;
	}

	.day-header__meta {
		line-height: 1.1;
	}

	.day-header__weekday {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--foreground);
		text-transform: capitalize;
	}

	.day-header__sub {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
		text-transform: capitalize;
	}

	.day-header__line {
		flex: 1;
		height: 1px;
		background: var(--border);
		margin-left: 0.25rem;
	}

	/* ─── Event rows ─── */
	.day-events {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.event-row {
		display: flex;
		align-items: stretch;
		gap: 0.875rem;
		padding: 0.75rem 0.875rem;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: 0.5rem;
		transition: border-color 150ms ease, box-shadow 150ms ease;
	}

	.event-row:hover {
		border-color: color-mix(in oklch, var(--primary) 30%, var(--border));
		box-shadow: 0 2px 6px -2px oklch(0 0 0 / 0.06);
	}

	.event-row__time {
		display: flex;
		flex-direction: column;
		font-variant-numeric: tabular-nums;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		min-width: 3rem;
		flex-shrink: 0;
	}

	.event-row__time-start {
		color: var(--foreground);
		font-weight: 500;
	}

	.event-row__bar {
		width: 2px;
		border-radius: 9999px;
		flex-shrink: 0;
	}

	.event-row.tone-blue .event-row__bar {
		background: var(--primary);
	}
	.event-row.tone-amber .event-row__bar {
		background: var(--warning);
	}
	.event-row.tone-emerald .event-row__bar {
		background: var(--success, oklch(0.7 0.16 150));
	}

	.event-row__title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--foreground);
	}

	.event-row__meta {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		margin-top: 0.125rem;
	}

	.event-row__ticket {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.125rem 0.5rem;
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--primary);
		background: color-mix(in oklch, var(--primary) 8%, transparent);
		border-radius: 9999px;
	}

	.event-row__ticket:hover {
		background: color-mix(in oklch, var(--primary) 14%, transparent);
	}
</style>
