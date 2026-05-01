<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Building03Icon,
		Building04Icon,
		ArrowDown01Icon,
		Tick02Icon,
		InformationCircleIcon,
		FilterIcon,
		EyeIcon,
		Layers01Icon
	} from '@hugeicons/core-free-icons';
	import { propertySelection } from '$lib/state/property-selection.svelte';

	let open = $state(false);
	let infoOpen = $state(false);
	let triggerEl: HTMLButtonElement | undefined = $state();
	let menuEl: HTMLDivElement | undefined = $state();
	let infoTriggerEl: HTMLButtonElement | undefined = $state();
	let infoEl: HTMLDivElement | undefined = $state();

	const label = $derived(propertySelection.isAll ? 'Tutti i condomini' : propertySelection.selected!.name);
	const sublabel = $derived(
		propertySelection.isAll
			? `${propertySelection.options.length} condomìni`
			: `${propertySelection.selected!.address.city} · ${propertySelection.selected!.units} unità`
	);

	function toggleMenu() {
		open ? closeMenu() : openMenu();
	}

	function openMenu() {
		open = true;
		queueMicrotask(positionMenu);
	}

	function closeMenu() {
		open = false;
	}

	function positionMenu() {
		if (!triggerEl || !menuEl) return;
		const r = triggerEl.getBoundingClientRect();
		menuEl.style.left = `${r.left}px`;
		menuEl.style.top = `${r.bottom + 6}px`;
		menuEl.style.width = `${r.width}px`;
	}

	function pick(id: string | null) {
		propertySelection.select(id);
		closeMenu();
	}

	function showInfo() {
		infoOpen = true;
		queueMicrotask(positionInfo);
	}
	function hideInfo() {
		infoOpen = false;
	}
	function positionInfo() {
		if (!infoTriggerEl || !infoEl) return;
		const r = infoTriggerEl.getBoundingClientRect();
		const margin = 8;
		const bw = infoEl.offsetWidth;
		const bh = infoEl.offsetHeight;
		let left = r.right + 10;
		if (left + bw + margin > window.innerWidth) left = r.left - bw - 10;
		let top = r.top + r.height / 2 - bh / 2;
		top = Math.max(margin, Math.min(top, window.innerHeight - bh - margin));
		infoEl.style.left = `${left}px`;
		infoEl.style.top = `${top}px`;
	}

	function onDocClick(e: MouseEvent) {
		const t = e.target as Node;
		if (open && menuEl && !menuEl.contains(t) && triggerEl && !triggerEl.contains(t)) closeMenu();
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) closeMenu();
	}

	$effect(() => {
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		window.addEventListener('resize', positionMenu);
		window.addEventListener('scroll', positionMenu, true);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
			window.removeEventListener('resize', positionMenu);
			window.removeEventListener('scroll', positionMenu, true);
		};
	});
</script>

<div class="property-selector">
	<div class="property-selector__header">
		<span class="property-selector__caption">Condominio attivo</span>
		<button
			bind:this={infoTriggerEl}
			type="button"
			class="property-selector__info-trigger"
			aria-label="Cosa fa questo selettore?"
			onmouseenter={showInfo}
			onmouseleave={hideInfo}
			onfocus={showInfo}
			onblur={hideInfo}
		>
			<HugeiconsIcon icon={InformationCircleIcon} size={13} strokeWidth={2} />
		</button>
	</div>

	<button
		bind:this={triggerEl}
		type="button"
		class="property-selector__trigger"
		class:is-open={open}
		class:is-filtered={!propertySelection.isAll}
		aria-haspopup="listbox"
		aria-expanded={open}
		onclick={toggleMenu}
	>
		<span class="property-selector__icon" aria-hidden="true">
			<HugeiconsIcon
				icon={propertySelection.isAll ? Layers01Icon : Building03Icon}
				size={16}
				strokeWidth={1.75}
			/>
		</span>
		<span class="property-selector__labels">
			<span class="property-selector__label">{label}</span>
			<span class="property-selector__sublabel">{sublabel}</span>
		</span>
		<span class="property-selector__chevron" class:is-open={open} aria-hidden="true">
			<HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
		</span>
	</button>
</div>

{#if open}
	<div bind:this={menuEl} class="property-menu" role="listbox" aria-label="Seleziona condominio">
		<button
			type="button"
			class="property-menu__item property-menu__item--all"
			class:is-active={propertySelection.isAll}
			role="option"
			aria-selected={propertySelection.isAll}
			onclick={() => pick(null)}
		>
			<span class="property-menu__icon"><HugeiconsIcon icon={Layers01Icon} size={16} strokeWidth={1.75} /></span>
			<span class="property-menu__text">
				<span class="property-menu__name">Tutti i condomìni</span>
				<span class="property-menu__meta">Vista d'insieme · {propertySelection.options.length} totali</span>
			</span>
			{#if propertySelection.isAll}
				<HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.25} />
			{/if}
		</button>

		<div class="property-menu__divider" role="separator"></div>

		<div class="property-menu__list">
			{#each propertySelection.options as p (p.id)}
				{@const active = propertySelection.selectedId === p.id}
				<button
					type="button"
					class="property-menu__item"
					class:is-active={active}
					role="option"
					aria-selected={active}
					onclick={() => pick(p.id)}
				>
					<span class="property-menu__icon"><HugeiconsIcon icon={Building04Icon} size={16} strokeWidth={1.75} /></span>
					<span class="property-menu__text">
						<span class="property-menu__name">{p.name}</span>
						<span class="property-menu__meta">{p.address.city} · {p.units} unità</span>
					</span>
					{#if active}
						<HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.25} />
					{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}

{#if infoOpen}
	<div bind:this={infoEl} class="property-info" role="tooltip">
		<div class="property-info__title">
			<HugeiconsIcon icon={Building03Icon} size={14} strokeWidth={1.75} />
			<span>Condominio attivo</span>
		</div>
		<p class="property-info__lead">
			Determina su quale condominio stai lavorando. Le altre viste si filtrano di conseguenza.
		</p>

		<ul class="property-info__rows">
			<li>
				<span class="property-info__row-icon"><HugeiconsIcon icon={Building04Icon} size={13} strokeWidth={1.75} /></span>
				<span><strong>Un condominio</strong> — pratiche, calendario, pagamenti e chat sono limitati a quell'immobile.</span>
			</li>
			<li>
				<span class="property-info__row-icon"><HugeiconsIcon icon={Layers01Icon} size={13} strokeWidth={1.75} /></span>
				<span><strong>Tutti</strong> — vista d'insieme sull'intero portafoglio gestito.</span>
			</li>
			<li>
				<span class="property-info__row-icon"><HugeiconsIcon icon={FilterIcon} size={13} strokeWidth={1.75} /></span>
				<span>Il filtro si applica automaticamente alle pagine che lo supportano.</span>
			</li>
			<li>
				<span class="property-info__row-icon"><HugeiconsIcon icon={EyeIcon} size={13} strokeWidth={1.75} /></span>
				<span>La selezione resta attiva mentre navighi tra le sezioni.</span>
			</li>
		</ul>
	</div>
{/if}

<style>
	.property-selector {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.property-selector__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0.125rem;
	}

	.property-selector__caption {
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.property-selector__info-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 9999px;
		border: 0;
		background: transparent;
		color: var(--muted-foreground);
		cursor: help;
		padding: 0;
		transition: color 0.15s, background 0.15s;
	}
	.property-selector__info-trigger:hover,
	.property-selector__info-trigger:focus-visible {
		color: var(--foreground);
		background: var(--sidebar-accent);
		outline: none;
	}

	.property-selector__trigger {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		background: var(--card);
		border: 1px solid var(--sidebar-border);
		border-radius: 0.5rem;
		text-align: left;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
	}
	.property-selector__trigger:hover {
		border-color: var(--primary);
	}
	.property-selector__trigger:focus-visible {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 18%, transparent);
	}
	.property-selector__trigger.is-open {
		border-color: var(--primary);
		box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 14%, transparent);
	}

	/* Filter active: trigger takes the primary brand color to make the active filter unmistakable. */
	.property-selector__trigger.is-filtered {
		background: var(--primary);
		border-color: var(--primary);
		color: var(--primary-foreground);
	}
	.property-selector__trigger.is-filtered:hover {
		background: color-mix(in oklab, var(--primary) 92%, black);
	}

	.property-selector__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.375rem;
		background: var(--accent);
		color: var(--primary);
		flex-shrink: 0;
		transition: background 0.15s, color 0.15s;
	}
	.property-selector__trigger.is-filtered .property-selector__icon {
		background: color-mix(in oklab, var(--primary-foreground) 18%, transparent);
		color: var(--primary-foreground);
	}

	.property-selector__labels {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
		line-height: 1.15;
	}

	.property-selector__label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.property-selector__trigger.is-filtered .property-selector__label {
		color: var(--primary-foreground);
	}

	.property-selector__sublabel {
		margin-top: 0.125rem;
		font-size: 0.6875rem;
		color: var(--muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.property-selector__trigger.is-filtered .property-selector__sublabel {
		color: color-mix(in oklab, var(--primary-foreground) 75%, transparent);
	}

	.property-selector__chevron {
		color: var(--muted-foreground);
		flex-shrink: 0;
		transition: transform 0.18s ease;
	}
	.property-selector__chevron.is-open {
		transform: rotate(180deg);
		color: var(--foreground);
	}
	.property-selector__trigger.is-filtered .property-selector__chevron {
		color: color-mix(in oklab, var(--primary-foreground) 80%, transparent);
	}

	/* ─── Dropdown menu ─── */
	.property-menu {
		position: fixed;
		z-index: 60;
		min-width: 14rem;
		padding: 0.375rem;
		background: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		box-shadow: 0 12px 32px -8px oklch(0 0 0 / 0.18), 0 4px 8px -4px oklch(0 0 0 / 0.08);
		animation: pm-in 0.12s ease-out;
	}

	@keyframes pm-in {
		from { opacity: 0; transform: translateY(-2px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.property-menu__list {
		max-height: 18rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.property-menu__divider {
		height: 1px;
		background: var(--border);
		margin: 0.375rem 0;
	}

	.property-menu__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.4375rem 0.5rem;
		background: transparent;
		border: 0;
		border-radius: 0.375rem;
		text-align: left;
		cursor: pointer;
		color: var(--foreground);
		transition: background 0.12s;
	}
	.property-menu__item:hover {
		background: var(--accent);
	}
	.property-menu__item.is-active {
		background: var(--accent);
		color: var(--accent-foreground);
	}
	.property-menu__item.is-active .property-menu__icon {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.property-menu__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.3125rem;
		background: var(--muted);
		color: var(--muted-foreground);
		flex-shrink: 0;
	}

	.property-menu__text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
		line-height: 1.15;
	}

	.property-menu__name {
		font-size: 0.8125rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.property-menu__meta {
		margin-top: 0.125rem;
		font-size: 0.6875rem;
		color: var(--muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.property-menu__item--all {
		background: color-mix(in oklab, var(--primary) 5%, transparent);
	}
	.property-menu__item--all .property-menu__icon {
		background: color-mix(in oklab, var(--primary) 15%, transparent);
		color: var(--primary);
	}

	/* ─── Info popover ─── */
	.property-info {
		position: fixed;
		z-index: 70;
		width: 17rem;
		padding: 0.75rem 0.875rem;
		background: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		box-shadow: 0 12px 32px -8px oklch(0 0 0 / 0.2), 0 4px 8px -4px oklch(0 0 0 / 0.1);
		font-size: 0.75rem;
		line-height: 1.25rem;
		pointer-events: auto;
	}

	.property-info__title {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.property-info__lead {
		margin: 0.375rem 0 0.625rem;
		color: var(--muted-foreground);
	}

	.property-info__rows {
		display: flex;
		flex-direction: column;
		gap: 0.4375rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.property-info__rows li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		color: var(--foreground);
	}

	.property-info__rows strong {
		font-weight: 600;
	}

	.property-info__row-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 0.25rem;
		background: var(--accent);
		color: var(--primary);
		flex-shrink: 0;
		margin-top: 0.0625rem;
	}
</style>
