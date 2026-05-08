<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getResidentById } from '$lib/data/residents';
	import { getPropertyById } from '$lib/data/properties';
	import { assemblies } from '$lib/data/events/assemblies';
	import { supplierTasks } from '$lib/data/embeds/supplierTasks';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Add01Icon,
		ArrowLeft01Icon,
		ArrowRight01Icon,
		Calendar03Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { InfoTip } from '$lib/components/shared';
	import {
		buildResidentCalendarEvents,
		filterResidentCalendarEvents,
		residentCalendarFilterOptions,
		type ResidentCalendarEvent,
		type ResidentCalendarFilter,
		type ResidentCalendarTone
	} from '$lib/components/resident/calendar';
	import {
		createResidentLocalCalendarEvent,
		getResidentLocalCalendarEventsByResidentId,
		residentLocalCalendarEventTypeOptions,
		type ResidentLocalCalendarEventType
	} from '$lib/components/resident/local-calendar-events';

	type CreateEventFormState = {
		title: string;
		type: ResidentLocalCalendarEventType;
		date: string;
		startTime: string;
		endTime: string;
		location: string;
	};

	type CreateEventFormErrors = Partial<Record<keyof CreateEventFormState, string>>;

	type CalendarCell = {
		date: Date;
		key: string;
		day: number;
		inMonth: boolean;
		tones: ResidentCalendarTone[];
		isToday: boolean;
	};

	type GroupedEvents = {
		date: string;
		events: ResidentCalendarEvent[];
	};

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);

	const today = new Date();

	function pad2(value: number) {
		return value.toString().padStart(2, '0');
	}

	function toDateKey(date: Date) {
		return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
	}

	function buildDateFromKey(key: string) {
		return new Date(`${key}T00:00:00`);
	}

	const todayKey = toDateKey(today);

	const monthFormatter = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });
	const weekdayFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'long' });
	const monthOnlyFormatter = new Intl.DateTimeFormat('it-IT', { month: 'long' });

	let localEventsVersion = $state(0);
	let activeFilter = $state<ResidentCalendarFilter>('all');
	let isCreateDialogOpen = $state(false);
	let isCreatingEvent = $state(false);
	let createEventErrors = $state<CreateEventFormErrors>({});
	let createEventForm = $state<CreateEventFormState>({
		title: '',
		type: 'promemoria',
		date: todayKey,
		startTime: '18:00',
		endTime: '18:30',
		location: ''
	});

	let viewMonth = $state({ year: today.getFullYear(), month: today.getMonth() });
	let selectedDate = $state(todayKey);

	const scopedAssemblies = $derived(
		property ? assemblies.filter((assembly) => assembly.propertyId === property.id) : []
	);
	const scopedSupplierTasks = $derived(
		property ? supplierTasks.filter((task) => task.propertyId === property.id) : []
	);
	const localEvents = $derived.by(() => {
		localEventsVersion;
		return currentUser ? getResidentLocalCalendarEventsByResidentId(currentUser.id) : [];
	});

	const calendarEvents = $derived(
		buildResidentCalendarEvents({
			assemblies: scopedAssemblies,
			supplierTasks: scopedSupplierTasks,
			localEvents
		})
	);
	const filteredEvents = $derived(filterResidentCalendarEvents(calendarEvents, activeFilter));

	const monthLabel = $derived(monthFormatter.format(new Date(viewMonth.year, viewMonth.month, 1)));
	const nextEvent = $derived(filteredEvents.find((event) => event.date >= todayKey));
	const filterCounts = $derived({
		all: calendarEvents.length,
		assembly: calendarEvents.filter((event) => event.kind === 'assembly').length,
		maintenance: calendarEvents.filter((event) => event.kind === 'maintenance').length,
		personal: calendarEvents.filter((event) => event.kind === 'personal').length
	});

	const tonesByDate = $derived.by(() => {
		const map = new Map<string, ResidentCalendarTone[]>();

		for (const event of filteredEvents) {
			const tones = map.get(event.date);
			if (!tones) {
				map.set(event.date, [event.tone]);
				continue;
			}

			if (!tones.includes(event.tone) && tones.length < 3) {
				tones.push(event.tone);
			}
		}

		return map;
	});

	const monthGrid = $derived.by(() => {
		const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
		const offset = (firstDay.getDay() + 6) % 7;
		const start = new Date(viewMonth.year, viewMonth.month, 1 - offset);
		const cells: CalendarCell[] = [];

		for (let index = 0; index < 42; index += 1) {
			const date = new Date(start);
			date.setDate(start.getDate() + index);
			const key = toDateKey(date);

			cells.push({
				date,
				key,
				day: date.getDate(),
				inMonth: date.getMonth() === viewMonth.month,
				tones: tonesByDate.get(key) ?? [],
				isToday: key === todayKey
			});
		}

		return cells;
	});

	const groupedEvents = $derived.by(() => {
		const monthEvents = filteredEvents
			.filter((event) => {
				const [year, month] = event.date.split('-').map(Number);
				return year === viewMonth.year && month - 1 === viewMonth.month;
			})
			.sort(
				(a, b) =>
					a.date.localeCompare(b.date) ||
					a.startTime.localeCompare(b.startTime) ||
					a.title.localeCompare(b.title)
			);

		const groups = new Map<string, ResidentCalendarEvent[]>();

		for (const event of monthEvents) {
			if (!groups.has(event.date)) {
				groups.set(event.date, []);
			}

			groups.get(event.date)?.push(event);
		}

		return [...groups.entries()].map(([date, events]) => ({ date, events })) satisfies GroupedEvents[];
	});

	const selectedDayEvents = $derived(
		groupedEvents.find((group) => group.date === selectedDate)?.events ?? []
	);

	const weekdayHeader = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

	const toneClass: Record<ResidentCalendarTone, string> = {
		blue: 'resident-calendar-tone--blue',
		amber: 'resident-calendar-tone--amber',
		emerald: 'resident-calendar-tone--emerald'
	};

	function setCreateEventField<K extends keyof CreateEventFormState>(
		field: K,
		value: CreateEventFormState[K]
	) {
		createEventForm[field] = value;

		if (createEventErrors[field]) {
			createEventErrors = { ...createEventErrors, [field]: undefined };
		}
	}

	function resetCreateEventForm() {
		createEventForm = {
			title: '',
			type: 'promemoria',
			date: selectedDate,
			startTime: '18:00',
			endTime: '18:30',
			location: ''
		};
		createEventErrors = {};
	}

	function prevMonth() {
		const nextMonth = viewMonth.month - 1;
		viewMonth =
			nextMonth < 0
				? { year: viewMonth.year - 1, month: 11 }
				: { year: viewMonth.year, month: nextMonth };
	}

	function nextMonth() {
		const nextMonth = viewMonth.month + 1;
		viewMonth =
			nextMonth > 11
				? { year: viewMonth.year + 1, month: 0 }
				: { year: viewMonth.year, month: nextMonth };
	}

	function goToToday() {
		viewMonth = { year: today.getFullYear(), month: today.getMonth() };
		selectedDate = todayKey;
		scrollToDate(todayKey);
	}

	function selectDay(cell: CalendarCell) {
		if (!cell.inMonth) {
			viewMonth = { year: cell.date.getFullYear(), month: cell.date.getMonth() };
		}

		selectedDate = cell.key;
		scrollToDate(cell.key);
	}

	function scrollToDate(key: string) {
		setTimeout(() => {
			document.getElementById(`resident-calendar-day-${key}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}, 0);
	}

	function openCreateEventDialog() {
		resetCreateEventForm();
		isCreateDialogOpen = true;
	}

	function validateCreateEventForm() {
		const nextErrors: CreateEventFormErrors = {};

		if (createEventForm.title.trim().length < 4) {
			nextErrors.title = 'Inserisci un titolo di almeno 4 caratteri.';
		}

		if (!createEventForm.date) {
			nextErrors.date = 'Seleziona una data.';
		}

		if (!createEventForm.startTime) {
			nextErrors.startTime = 'Inserisci un orario di inizio.';
		}

		if (
			createEventForm.endTime &&
			createEventForm.startTime &&
			createEventForm.endTime <= createEventForm.startTime
		) {
			nextErrors.endTime = 'L orario di fine deve essere successivo a quello di inizio.';
		}

		createEventErrors = nextErrors;

		return Object.keys(nextErrors).length === 0;
	}

	async function handleCreateEventSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!resident || !property || !validateCreateEventForm()) {
			return;
		}

		isCreatingEvent = true;
		await new Promise((resolve) => setTimeout(resolve, 450));

		const createdEvent = createResidentLocalCalendarEvent({
			residentId: resident.id,
			propertyId: property.id,
			title: createEventForm.title,
			type: createEventForm.type,
			date: createEventForm.date,
			startTime: createEventForm.startTime,
			endTime: createEventForm.endTime,
			location: createEventForm.location
		});

		localEventsVersion += 1;
		activeFilter = 'all';
		selectedDate = createdEvent.date;

		const createdEventDate = buildDateFromKey(createdEvent.date);
		viewMonth = {
			year: createdEventDate.getFullYear(),
			month: createdEventDate.getMonth()
		};

		isCreatingEvent = false;
		isCreateDialogOpen = false;
		scrollToDate(createdEvent.date);
	}

	function formatDayNumber(date: string) {
		return Number(date.split('-')[2]);
	}

	function formatWeekday(date: string) {
		return weekdayFormatter.format(buildDateFromKey(date));
	}

	function formatMonth(date: string) {
		return monthOnlyFormatter.format(buildDateFromKey(date));
	}

	function formatTimeRange(event: ResidentCalendarEvent) {
		if (event.endTime) {
			return `${event.startTime} - ${event.endTime}`;
		}

		return event.startTime;
	}
</script>

<svelte:head>
	<title>Calendario - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-calendar-page">
	{#if !currentUser || !resident || !property}
		<section class="resident-calendar-empty">
			<div class="resident-calendar-empty__icon" aria-hidden="true">
				<HugeiconsIcon icon={Calendar03Icon} size={18} strokeWidth={1.9} />
			</div>
			<h1 class="resident-calendar-empty__title">Calendario non disponibile</h1>
			<p class="resident-calendar-empty__copy">
				Serve un profilo residente attivo per vedere appuntamenti ed eventi del tuo condominio.
			</p>
		</section>
	{:else}
		<section class="resident-calendar-header">
			<div class="resident-calendar-header__main">
				<p class="resident-calendar-header__eyebrow">Calendario residente</p>
				<h1 class="resident-calendar-header__title">Agenda del condominio</h1>
				<p class="resident-calendar-header__copy">
					Visualizza assemblee, manutenzioni e i promemoria che aggiungi dal tuo profilo.
				</p>
			</div>

			<div class="resident-calendar-header__actions">
				<div class="resident-calendar-header__meta">
					<p class="resident-calendar-header__property">{property.name}</p>
					<p class="resident-calendar-header__apartment">{resident.apartment}</p>
				</div>

				<div class="resident-calendar-header__buttons">
					<Button
						type="button"
						size="sm"
						class="resident-calendar-header__button"
						onclick={openCreateEventDialog}
					>
						<HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
						<span>Aggiungi evento</span>
					</Button>
					<InfoTip text="Puoi aggiungere promemoria o appuntamenti personali senza alterare il calendario condominiale condiviso." />
				</div>
			</div>
		</section>

		<section class="resident-calendar-overview">
			<div class="resident-calendar-overview__item">
				<span class="resident-calendar-overview__label">Prossimo appuntamento</span>
				{#if nextEvent}
					<span class="resident-calendar-overview__value">
						{formatDayNumber(nextEvent.date)} {formatMonth(nextEvent.date)} · {nextEvent.title}
					</span>
				{:else}
					<span class="resident-calendar-overview__value">Nessun evento imminente</span>
				{/if}
			</div>
			<div class="resident-calendar-overview__item">
				<span class="resident-calendar-overview__label">Nel calendario</span>
				<div class="resident-calendar-overview__chips">
					<span class="resident-calendar-overview__chip">
						{filterCounts.assembly} assemblee
					</span>
					<span class="resident-calendar-overview__chip">
						{filterCounts.maintenance} manutenzioni
					</span>
					<span class="resident-calendar-overview__chip">
						{filterCounts.personal} personali
					</span>
				</div>
			</div>
		</section>

		<section class="resident-calendar-surface">
			<div class="resident-calendar-monthbar">
				<div class="resident-calendar-monthbar__nav">
					<button
						type="button"
						class="resident-calendar-monthbar__nav-button"
						onclick={prevMonth}
						aria-label="Mese precedente"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={2} />
					</button>
					<h2 class="resident-calendar-monthbar__title">{monthLabel}</h2>
					<button
						type="button"
						class="resident-calendar-monthbar__nav-button"
						onclick={nextMonth}
						aria-label="Mese successivo"
					>
						<HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
					</button>
				</div>

				<div class="resident-calendar-monthbar__actions">
					<button type="button" class="resident-calendar-monthbar__today" onclick={goToToday}>
						Oggi
					</button>
				</div>
			</div>

			<div class="resident-calendar-grid-wrap">
				<div class="resident-calendar-grid resident-calendar-grid--weekdays" aria-hidden="true">
					{#each weekdayHeader as weekday}
						<span class="resident-calendar-grid__weekday">{weekday}</span>
					{/each}
				</div>

				<div class="resident-calendar-grid" role="grid" aria-label={monthLabel}>
					{#each monthGrid as cell (cell.key)}
						<button
							type="button"
							class="resident-calendar-grid__day"
							class:is-out={ !cell.inMonth }
							class:is-today={ cell.isToday }
							class:is-selected={ cell.key === selectedDate }
							onclick={() => selectDay(cell)}
							aria-label={cell.date.toLocaleDateString('it-IT')}
						>
							<span class="resident-calendar-grid__day-number">{cell.day}</span>
							{#if cell.tones.length > 0}
								<span class="resident-calendar-grid__dots" aria-hidden="true">
									{#each cell.tones as tone (tone)}
										<span class={`resident-calendar-grid__dot ${toneClass[tone]}`}></span>
									{/each}
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="resident-calendar-filters">
				<div class="resident-calendar-filters__list" role="tablist" aria-label="Filtri calendario">
					{#each residentCalendarFilterOptions as option}
						<button
							type="button"
							class="resident-calendar-filters__button"
							class:is-active={activeFilter === option.value}
							onclick={() => (activeFilter = option.value)}
						>
							<span>{option.label}</span>
							<span class="resident-calendar-filters__count">
								{filterCounts[option.value]}
							</span>
						</button>
					{/each}
				</div>

				<div class="resident-calendar-legend" aria-label="Legenda calendario">
					<span class="resident-calendar-legend__item">
						<span class="resident-calendar-legend__dot resident-calendar-tone--blue"></span>
						Assemblee
					</span>
					<span class="resident-calendar-legend__item">
						<span class="resident-calendar-legend__dot resident-calendar-tone--amber"></span>
						Manutenzioni
					</span>
					<span class="resident-calendar-legend__item">
						<span class="resident-calendar-legend__dot resident-calendar-tone--emerald"></span>
						Eventi personali
					</span>
				</div>
			</div>
		</section>

		<section class="resident-calendar-day-focus" aria-live="polite">
			<div class="resident-calendar-day-focus__header">
				<div>
					<p class="resident-calendar-day-focus__eyebrow">Data selezionata</p>
					<p class="resident-calendar-day-focus__title">
						{formatDayNumber(selectedDate)} {formatMonth(selectedDate)}
					</p>
				</div>
				<p class="resident-calendar-day-focus__meta">
					{selectedDayEvents.length}
					{selectedDayEvents.length === 1 ? ' evento' : ' eventi'}
				</p>
			</div>

			{#if selectedDayEvents.length === 0}
				<p class="resident-calendar-day-focus__empty">
					Nessun appuntamento registrato per questa data.
				</p>
			{:else}
				<ul class="resident-calendar-day-focus__list">
					{#each selectedDayEvents as event (event.id)}
						<li class="resident-calendar-day-focus__item">
							<span class={`resident-calendar-day-focus__bar ${toneClass[event.tone]}`}></span>
							<div class="resident-calendar-day-focus__content">
								<p class="resident-calendar-day-focus__item-title">{event.title}</p>
								<p class="resident-calendar-day-focus__item-meta">
									{formatTimeRange(event)} · {event.sourceLabel}
								</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="resident-calendar-agenda">
			{#if groupedEvents.length === 0}
				<div class="resident-calendar-agenda__empty">
					<div class="resident-calendar-agenda__empty-icon" aria-hidden="true">
						<HugeiconsIcon icon={Calendar03Icon} size={18} strokeWidth={1.9} />
					</div>
					<p class="resident-calendar-agenda__empty-title">Nessun evento in questo mese</p>
					<p class="resident-calendar-agenda__empty-copy">
						Cambia mese oppure aggiungi un promemoria personale dal tuo calendario.
					</p>
				</div>
			{:else}
				<div class="resident-calendar-agenda__groups">
					{#each groupedEvents as group (group.date)}
						<section
							id={`resident-calendar-day-${group.date}`}
							class="resident-calendar-day-group"
							class:is-selected={group.date === selectedDate}
						>
							<header class="resident-calendar-day-group__header">
								<div class="resident-calendar-day-group__date">
									<span class="resident-calendar-day-group__day">
										{formatDayNumber(group.date)}
									</span>
									<div class="resident-calendar-day-group__meta">
										<p class="resident-calendar-day-group__weekday">{formatWeekday(group.date)}</p>
										<p class="resident-calendar-day-group__month">{formatMonth(group.date)}</p>
									</div>
								</div>
								<p class="resident-calendar-day-group__count">
									{group.events.length}
									{group.events.length === 1 ? ' evento' : ' eventi'}
								</p>
							</header>

							<ul class="resident-calendar-events">
								{#each group.events as event (event.id)}
									<li class="resident-calendar-event">
										<div class="resident-calendar-event__time">
											<p class="resident-calendar-event__time-value">{formatTimeRange(event)}</p>
										</div>
										<span class={`resident-calendar-event__bar ${toneClass[event.tone]}`}></span>
										<div class="resident-calendar-event__main">
											<div class="resident-calendar-event__topline">
												<p class="resident-calendar-event__title">{event.title}</p>
												<span class="resident-calendar-event__label">{event.sourceLabel}</span>
											</div>
											<p class="resident-calendar-event__subtitle">{event.supportLabel}</p>
											<p class="resident-calendar-event__location">{event.location}</p>
										</div>
									</li>
								{/each}
							</ul>
						</section>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>

<Dialog bind:open={isCreateDialogOpen}>
	<DialogContent class="resident-calendar-dialog">
		<DialogHeader class="resident-calendar-dialog__header">
			<DialogTitle class="resident-calendar-dialog__title">Aggiungi un evento</DialogTitle>
			<DialogDescription class="resident-calendar-dialog__copy">
				Crea un promemoria o un appuntamento personale nel tuo calendario residente.
			</DialogDescription>
		</DialogHeader>

		<form class="resident-calendar-form" onsubmit={handleCreateEventSubmit}>
			<div class="resident-calendar-form__field">
				<Label for="resident-calendar-title">Titolo</Label>
				<Input
					id="resident-calendar-title"
					value={createEventForm.title}
					placeholder="Es. Incontro con assicurazione"
					oninput={(event: Event) =>
						setCreateEventField('title', (event.currentTarget as HTMLInputElement).value)}
					class="resident-calendar-form__input"
					aria-invalid={createEventErrors.title ? 'true' : undefined}
				/>
				{#if createEventErrors.title}
					<p class="resident-calendar-form__error">{createEventErrors.title}</p>
				{/if}
			</div>

			<div class="resident-calendar-form__field">
				<Label for="resident-calendar-type">Tipo evento</Label>
				<Select type="single" bind:value={createEventForm.type}>
					<SelectTrigger id="resident-calendar-type" class="resident-calendar-form__select">
						{residentLocalCalendarEventTypeOptions.find(
							(option) => option.value === createEventForm.type
						)?.label ?? 'Seleziona un tipo'}
					</SelectTrigger>
					<SelectContent>
						{#each residentLocalCalendarEventTypeOptions as option}
							<SelectItem value={option.value} label={option.label} />
						{/each}
					</SelectContent>
				</Select>
				<p class="resident-calendar-form__hint">
					{residentLocalCalendarEventTypeOptions.find(
						(option) => option.value === createEventForm.type
					)?.copy}
				</p>
			</div>

			<div class="resident-calendar-form__grid">
				<div class="resident-calendar-form__field">
					<Label for="resident-calendar-date">Data</Label>
					<Input
						id="resident-calendar-date"
						type="date"
						value={createEventForm.date}
						oninput={(event: Event) =>
							setCreateEventField('date', (event.currentTarget as HTMLInputElement).value)}
						class="resident-calendar-form__input"
						aria-invalid={createEventErrors.date ? 'true' : undefined}
					/>
					{#if createEventErrors.date}
						<p class="resident-calendar-form__error">{createEventErrors.date}</p>
					{/if}
				</div>

				<div class="resident-calendar-form__field">
					<Label for="resident-calendar-location">Luogo</Label>
					<Input
						id="resident-calendar-location"
						value={createEventForm.location}
						placeholder="Es. Reception stabile"
						oninput={(event: Event) =>
							setCreateEventField('location', (event.currentTarget as HTMLInputElement).value)}
						class="resident-calendar-form__input"
					/>
				</div>
			</div>

			<div class="resident-calendar-form__grid">
				<div class="resident-calendar-form__field">
					<Label for="resident-calendar-start">Inizio</Label>
					<Input
						id="resident-calendar-start"
						type="time"
						value={createEventForm.startTime}
						oninput={(event: Event) =>
							setCreateEventField('startTime', (event.currentTarget as HTMLInputElement).value)}
						class="resident-calendar-form__input"
						aria-invalid={createEventErrors.startTime ? 'true' : undefined}
					/>
					{#if createEventErrors.startTime}
						<p class="resident-calendar-form__error">{createEventErrors.startTime}</p>
					{/if}
				</div>

				<div class="resident-calendar-form__field">
					<Label for="resident-calendar-end">Fine</Label>
					<Input
						id="resident-calendar-end"
						type="time"
						value={createEventForm.endTime}
						oninput={(event: Event) =>
							setCreateEventField('endTime', (event.currentTarget as HTMLInputElement).value)}
						class="resident-calendar-form__input"
						aria-invalid={createEventErrors.endTime ? 'true' : undefined}
					/>
					{#if createEventErrors.endTime}
						<p class="resident-calendar-form__error">{createEventErrors.endTime}</p>
					{/if}
				</div>
			</div>

			<DialogFooter class="resident-calendar-form__actions">
				<Button
					type="button"
					variant="outline"
					size="lg"
					class="resident-calendar-form__button resident-calendar-form__button--secondary"
					disabled={isCreatingEvent}
					onclick={() => (isCreateDialogOpen = false)}
				>
					Annulla
				</Button>
				<Button
					type="submit"
					size="lg"
					class="resident-calendar-form__button"
					disabled={isCreatingEvent}
				>
					{isCreatingEvent ? 'Aggiunta in corso...' : 'Aggiungi al calendario'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
