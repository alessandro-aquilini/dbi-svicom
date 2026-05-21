<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		UserAdd02Icon,
		Building03Icon,
		UserGroupIcon,
		Wrench01Icon,
		Mail01Icon,
		ArrowRight01Icon
	} from '@hugeicons/core-free-icons';
	import { onboardingPipeline, type OnboardingStage } from '$lib/svicom/metrics';
	import { DemoDialog } from '$lib/components/shared';

	let demoOpen = $state(false);

	const items = onboardingPipeline();

	const stages: { key: OnboardingStage; label: string }[] = [
		{ key: 'invito', label: 'Invito inviato' },
		{ key: 'configurazione', label: 'Configurazione' },
		{ key: 'verifica-documenti', label: 'Verifica documenti' },
		{ key: 'attivazione', label: 'Attivazione' }
	];

	const byTarget = {
		condominio: items.filter((i) => i.target === 'condominio'),
		amministratore: items.filter((i) => i.target === 'amministratore'),
		fornitore: items.filter((i) => i.target === 'fornitore')
	};

	const targetMeta = {
		condominio: { icon: Building03Icon, label: 'Condomìni', hint: 'Attivazione nuovo immobile' },
		amministratore: { icon: UserGroupIcon, label: 'Amministratori', hint: 'Apertura nuovo studio' },
		fornitore: { icon: Wrench01Icon, label: 'Fornitori', hint: 'Partner abilitati al network' }
	} as const;

	const stageIndex: Record<OnboardingStage, number> = {
		invito: 0,
		configurazione: 1,
		'verifica-documenti': 2,
		attivazione: 3
	};

	const quickActions = [
		{
			title: 'Nuovo condominio',
			body: 'Avvia un workflow di onboarding per un nuovo immobile gestito.',
			icon: Building03Icon
		},
		{
			title: 'Nuovo amministratore',
			body: 'Invita uno studio amministrativo a operare nel network Svicom.',
			icon: UserGroupIcon
		},
		{
			title: 'Nuovo fornitore',
			body: 'Estendi il catalogo invitando un partner di servizio.',
			icon: Wrench01Icon
		}
	];

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('it-IT', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Onboarding — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				User management & onboarding
			</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
				Attivazione del network
			</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				Avvia nuovi condomìni, amministratori e fornitori. Traccia gli stati di onboarding, l'assegnazione
				dei ruoli e la configurazione iniziale di servizi, documenti e permessi.
			</p>
		</div>
		<button
			type="button"
			onclick={() => (demoOpen = true)}
			class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
		>
			<HugeiconsIcon icon={UserAdd02Icon} size={16} strokeWidth={1.75} />
			Avvia onboarding
		</button>
	</header>

	<!-- Quick actions -->
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each quickActions as action}
			<button
				type="button"
				onclick={() => (demoOpen = true)}
				class="group flex items-start gap-3 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
			>
				<span class="rounded-md bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
					<HugeiconsIcon icon={action.icon} size={20} strokeWidth={1.5} />
				</span>
				<div class="flex-1">
					<p class="text-sm font-semibold text-foreground">{action.title}</p>
					<p class="mt-1 text-xs text-muted-foreground">{action.body}</p>
				</div>
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					size={16}
					strokeWidth={1.5}
					class="mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
				/>
			</button>
		{/each}
	</section>

	<!-- Pipeline by target -->
	{#each Object.entries(byTarget) as [target, list] (target)}
		{@const meta = targetMeta[target as keyof typeof targetMeta]}
		<section class="rounded-xl border border-border bg-card shadow-sm">
			<div class="flex items-center justify-between border-b border-border px-6 py-4">
				<div class="flex items-center gap-3">
					<span class="rounded-md bg-primary/10 p-2 text-primary">
						<HugeiconsIcon icon={meta.icon} size={18} strokeWidth={1.5} />
					</span>
					<div>
						<h2 class="text-base font-semibold text-foreground">{meta.label}</h2>
						<p class="text-xs text-muted-foreground">{meta.hint}</p>
					</div>
				</div>
				<span class="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
					{list.length} in corso
				</span>
			</div>

			{#if list.length === 0}
				<p class="px-6 py-8 text-center text-sm text-muted-foreground">
					Nessun onboarding attivo in questa categoria.
				</p>
			{:else}
				<ul class="divide-y divide-border">
					{#each list as item (item.id)}
						{@const currentIdx = stageIndex[item.stage]}
						<li class="px-6 py-5">
							<div class="flex flex-wrap items-baseline justify-between gap-3">
								<div>
									<p class="text-sm font-semibold text-foreground">{item.name}</p>
									<p class="text-xs text-muted-foreground">
										Owner: {item.owner} · Avviato {formatDate(item.startedAt)}
									</p>
								</div>
								<div class="flex items-center gap-3">
									<span class="text-xs font-medium text-foreground">{item.progress}%</span>
									<button
										type="button"
										onclick={() => (demoOpen = true)}
										class="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
									>
										<HugeiconsIcon icon={Mail01Icon} size={12} strokeWidth={1.75} />
										Solleciti
									</button>
								</div>
							</div>

							<!-- Stepper -->
							<ol class="mt-4 flex items-center gap-2">
								{#each stages as stage, i}
									{@const done = i < currentIdx}
									{@const active = i === currentIdx}
									<li class="flex flex-1 items-center gap-2">
										<div class="flex flex-1 flex-col gap-1.5">
											<div
												class="h-1.5 w-full rounded-full {done
													? 'bg-success'
													: active
														? 'bg-primary'
														: 'bg-muted'}"
											></div>
											<span class="text-[10px] uppercase tracking-wider {active
												? 'text-primary font-semibold'
												: done
													? 'text-success'
													: 'text-muted-foreground'}"
											>
												{stage.label}
											</span>
										</div>
									</li>
								{/each}
							</ol>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</div>

<DemoDialog bind:open={demoOpen} />
