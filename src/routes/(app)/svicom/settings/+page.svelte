<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Settings02Icon,
		OfficeIcon,
		UserGroupIcon,
		ShieldUserIcon,
		Notification02Icon,
		Key01Icon,
		PlugSocketIcon,
		LinkSquare02Icon
	} from '@hugeicons/core-free-icons';
	import { DemoDialog } from '$lib/components/shared';
	import { Switch } from '$lib/components/ui/switch';

	let demoOpen = $state(false);

	const organizationFields = [
		{ label: 'Ragione sociale', value: 'Svicom S.p.A.' },
		{ label: 'P. IVA', value: 'IT 09876543210' },
		{ label: 'Sede operativa', value: 'Milano · Via Tortona 12' },
		{ label: 'Referente prodotto', value: 'platform@svicom.it' }
	];

	const teamMembers = [
		{ name: 'Sara Bianchi', role: 'Platform manager', email: 'sara.bianchi@svicom.it' },
		{ name: 'Luca Marini', role: 'Operations lead', email: 'luca.marini@svicom.it' },
		{ name: 'Elena De Santis', role: 'Account & compliance', email: 'elena.desantis@svicom.it' }
	];

	let notifications = $state({
		critici: true,
		settimanaleReport: true,
		insightsAI: false,
		anomalie: true
	});

	const integrations = [
		{ name: 'Stripe', status: 'connesso', detail: 'Pagamenti ricorrenti e transazionali' },
		{ name: 'DocuSign', status: 'connesso', detail: 'Firma elettronica per contratti partner' },
		{ name: 'Hubspot CRM', status: 'in pausa', detail: 'Sincronizzazione lead onboarding' },
		{ name: 'Datawarehouse BI', status: 'connesso', detail: 'Export notturno KPI ed insights' }
	];

	const statusClass: Record<string, string> = {
		connesso: 'bg-success/15 text-success border-success/30',
		'in pausa': 'bg-warning/15 text-foreground border-warning/40',
		errore: 'bg-destructive/15 text-destructive border-destructive/30'
	};
</script>

<svelte:head>
	<title>Impostazioni — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header>
		<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Impostazioni</p>
		<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
			Configurazione piattaforma
		</h1>
		<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
			Parametri di organizzazione, team operativo, notifiche e integrazioni del Living Hub.
		</p>
	</header>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Organization -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<span class="rounded-md bg-primary/10 p-2 text-primary">
					<HugeiconsIcon icon={OfficeIcon} size={18} strokeWidth={1.5} />
				</span>
				<div>
					<h2 class="text-base font-semibold text-foreground">Organizzazione</h2>
					<p class="text-xs text-muted-foreground">Dati legali e contatti istituzionali.</p>
				</div>
			</div>

			<dl class="mt-5 divide-y divide-border">
				{#each organizationFields as field}
					<div class="flex items-center justify-between py-3">
						<dt class="text-sm text-muted-foreground">{field.label}</dt>
						<dd class="text-sm font-medium text-foreground">{field.value}</dd>
					</div>
				{/each}
			</dl>

			<button
				type="button"
				onclick={() => (demoOpen = true)}
				class="mt-4 w-full rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
			>
				Modifica dati organizzazione
			</button>
		</section>

		<!-- Team -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<span class="rounded-md bg-primary/10 p-2 text-primary">
					<HugeiconsIcon icon={UserGroupIcon} size={18} strokeWidth={1.5} />
				</span>
				<div class="flex-1">
					<h2 class="text-base font-semibold text-foreground">Team Svicom HQ</h2>
					<p class="text-xs text-muted-foreground">Persone abilitate alla vista orchestrator.</p>
				</div>
				<button
					type="button"
					onclick={() => (demoOpen = true)}
					class="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
				>
					Invita
				</button>
			</div>

			<ul class="mt-5 divide-y divide-border">
				{#each teamMembers as member}
					<li class="flex items-center justify-between py-3">
						<div>
							<p class="text-sm font-medium text-foreground">{member.name}</p>
							<p class="text-xs text-muted-foreground">{member.email}</p>
						</div>
						<span class="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
							{member.role}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Notifications -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<span class="rounded-md bg-primary/10 p-2 text-primary">
					<HugeiconsIcon icon={Notification02Icon} size={18} strokeWidth={1.5} />
				</span>
				<div>
					<h2 class="text-base font-semibold text-foreground">Notifiche</h2>
					<p class="text-xs text-muted-foreground">Canali e cadenza degli alert operativi.</p>
				</div>
			</div>

			<ul class="mt-5 space-y-3">
				{#each [
					{ key: 'critici' as const, label: 'Alert critici real-time', hint: 'Health rosso e ticket critici via email immediata.' },
					{ key: 'settimanaleReport' as const, label: 'Report settimanale ecosistema', hint: 'Ogni lunedì alle 08:00.' },
					{ key: 'insightsAI' as const, label: 'Digest insights AI', hint: 'Aggregazione pattern cross-condominio.' },
					{ key: 'anomalie' as const, label: 'Notifica anomalie operative', hint: 'Cluster di ticket fuori distribuzione.' }
				] as opt}
					{@const on = notifications[opt.key]}
					<li class="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
						<div class="min-w-0">
							<p class="text-sm font-medium text-foreground">{opt.label}</p>
							<p class="mt-0.5 text-xs text-muted-foreground">{opt.hint}</p>
						</div>
						<Switch
							checked={on}
							aria-label={opt.label}
							onCheckedChange={() => (demoOpen = true)}
						/>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Security & access -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<span class="rounded-md bg-primary/10 p-2 text-primary">
					<HugeiconsIcon icon={ShieldUserIcon} size={18} strokeWidth={1.5} />
				</span>
				<div>
					<h2 class="text-base font-semibold text-foreground">Sicurezza & accessi</h2>
					<p class="text-xs text-muted-foreground">Policy di autenticazione e auditing.</p>
				</div>
			</div>

			<ul class="mt-5 space-y-3">
				<li class="flex items-center justify-between rounded-lg border border-border p-3">
					<div>
						<p class="text-sm font-medium text-foreground">SSO aziendale</p>
						<p class="mt-0.5 text-xs text-muted-foreground">Azure AD attivo per @svicom.it</p>
					</div>
					<span class="rounded-full border border-success/30 bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success">
						Attivo
					</span>
				</li>
				<li class="flex items-center justify-between rounded-lg border border-border p-3">
					<div>
						<p class="text-sm font-medium text-foreground">Autenticazione a 2 fattori</p>
						<p class="mt-0.5 text-xs text-muted-foreground">Richiesta per tutti i ruoli orchestrator.</p>
					</div>
					<span class="rounded-full border border-success/30 bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success">
						Obbligatoria
					</span>
				</li>
				<li class="flex items-center justify-between rounded-lg border border-border p-3">
					<div>
						<p class="text-sm font-medium text-foreground">Audit log</p>
						<p class="mt-0.5 text-xs text-muted-foreground">Retention 24 mesi · esportabile in CSV.</p>
					</div>
					<button
						type="button"
						onclick={() => (demoOpen = true)}
						class="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
					>
						<HugeiconsIcon icon={LinkSquare02Icon} size={12} strokeWidth={2} />
						Esporta
					</button>
				</li>
			</ul>

			<button
				type="button"
				onclick={() => (demoOpen = true)}
				class="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
			>
				<HugeiconsIcon icon={Key01Icon} size={14} strokeWidth={1.75} />
				Gestisci chiavi API
			</button>
		</section>
	</div>

	<!-- Integrations -->
	<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
		<div class="flex items-center gap-3">
			<span class="rounded-md bg-primary/10 p-2 text-primary">
				<HugeiconsIcon icon={PlugSocketIcon} size={18} strokeWidth={1.5} />
			</span>
			<div class="flex-1">
				<h2 class="text-base font-semibold text-foreground">Integrazioni</h2>
				<p class="text-xs text-muted-foreground">Sistemi esterni collegati al Living Hub.</p>
			</div>
			<button
				type="button"
				onclick={() => (demoOpen = true)}
				class="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
			>
				Aggiungi integrazione
			</button>
		</div>

		<div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each integrations as i}
				<article class="rounded-lg border border-border p-4">
					<div class="flex items-baseline justify-between gap-2">
						<p class="text-sm font-semibold text-foreground">{i.name}</p>
						<span class="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize {statusClass[i.status]}">
							{i.status}
						</span>
					</div>
					<p class="mt-2 text-xs text-muted-foreground">{i.detail}</p>
					<button
						type="button"
						onclick={() => (demoOpen = true)}
						class="mt-3 text-xs font-medium text-primary hover:underline"
					>
						Configura →
					</button>
				</article>
			{/each}
		</div>
	</section>

	<div class="rounded-xl border border-dashed border-border bg-muted/30 p-5">
		<div class="flex items-start gap-3">
			<HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={1.75} class="mt-0.5 text-primary" />
			<div>
				<p class="text-sm font-medium text-foreground">Servono modifiche tecniche più profonde?</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Per modifiche al modello commerciale, alle policy di compliance o ai connettori dati, scrivi al team
					prodotto: <span class="text-foreground">platform@svicom.it</span>.
				</p>
			</div>
		</div>
	</div>
</div>

<DemoDialog bind:open={demoOpen} />
