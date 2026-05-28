<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowRight01Icon, CalendarCheckOut01Icon } from '@hugeicons/core-free-icons';
	import {
		formatMoney,
		formatPaymentDate,
		getPaymentFootnote,
		getResidentFeeBreakdown,
		getResidentLatestReceipt,
		getResidentPaymentReminder,
		getResidentPaymentStatus,
		getResidentPaymentsContext,
		ResidentPaymentCard
	} from '$lib/components/view-resident/payments';
	import {
		ResidentEmptyCard,
		ResidentPieChart
	} from '$lib/components/view-resident/resident';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const context = getResidentPaymentsContext(currentUser?.id);
	const paymentReminder = getResidentPaymentReminder(context);
	const latestReceipt = currentUser ? getResidentLatestReceipt(currentUser.id) : undefined;

	const personalPaidPayments = context.personalPayments.filter((payment) => Boolean(payment.paidAt));
	const totalPaidByResident = personalPaidPayments.reduce(
		(total, payment) => total + payment.amount,
		0
	);
	const outstandingResidentTotal = context.personalPayments
		.filter((payment) => !payment.paidAt)
		.reduce((total, payment) => total + payment.amount, 0);

	const currency = paymentReminder?.currency ?? context.personalPayments[0]?.currency ?? 'EUR';
	const monthlyFeeAmount =
		paymentReminder?.amount ??
		context.personalPayments[0]?.amount ??
		(personalPaidPayments.length > 0 ? totalPaidByResident / personalPaidPayments.length : 0);
	const monthlyFeeLabel = formatMoney(monthlyFeeAmount, currency);
	const breakdown = getResidentFeeBreakdown(monthlyFeeAmount);
	const breakdownChartItems = breakdown.map((item) => ({
		key: item.key,
		label: item.label,
		value: item.amount,
		color: item.color,
		copy: item.copy,
		valueLabel: `${formatMoney(item.amount, currency)} · ${item.percentLabel}`
	}));

	const reminderStatus = paymentReminder ? 'In scadenza' : 'Nessuna rata in scadenza';

	let breakdownSelectedKey = $state<string | null>(null);
	const visibleRecentProperty = context.propertyOperationalPayments.slice(0, 3);
</script>

<svelte:head>
	<title>Pagamenti - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="payments-stack">
		<header class="payments-header">
			<p class="payments-header__eyebrow">Area economica</p>
			<h1 class="payments-header__title">I tuoi pagamenti</h1>
			<p class="payments-header__copy">
				La tua rata, le ricevute e i movimenti del condominio in un solo posto.
			</p>
		</header>

		{#if !context.resident || !context.property}
			<ResidentEmptyCard
				title="Profilo residente non disponibile"
				copy="Collega un profilo residente al tuo account per vedere quote e movimenti."
			/>
		{:else}
			<!-- 1. Hero rata corrente -->
			<section class="payments-hero">
				<div class="payments-hero__top">
					<p class="payments-hero__eyebrow">Prossima rata</p>
					<span class="payments-hero__status">{reminderStatus}</span>
				</div>
				<p class="payments-hero__amount">{monthlyFeeLabel}</p>
				{#if paymentReminder}
					<p class="payments-hero__period">
						{paymentReminder.title} · scadenza {formatPaymentDate(paymentReminder.dueDate)}
					</p>
				{:else}
					<p class="payments-hero__period">
						Tutte le rate disponibili sono state registrate.
					</p>
				{/if}
				<div class="payments-hero__actions">
					{#if paymentReminder}
						<Button href="/resident/payments/checkout" size="lg" class="payments-hero__cta">
							Paga ora
						</Button>
					{/if}
					{#if latestReceipt}
						<Button
							href={`/resident/payments/receipt?reference=${latestReceipt.reference}`}
							variant="outline"
							size="lg"
							class="payments-hero__cta-secondary"
						>
							Ultima ricevuta
						</Button>
					{/if}
				</div>
			</section>

			<!-- 2. Breakdown rata - elemento centrale -->
			<section class="payments-section">
				<div class="payments-section__heading">
					<h2 class="payments-section__title">Come è composta la tua rata</h2>
					<p class="payments-section__copy">
						Ecco dove vanno {monthlyFeeLabel} ogni mese. Tocca una voce per scoprire di più.
					</p>
				</div>

				<Card class="payments-breakdown-card">
					<CardContent class="payments-breakdown-card__content">
						<ResidentPieChart
							items={breakdownChartItems}
							bind:selectedKey={breakdownSelectedKey}
							totalLabel="Rata mensile"
							totalCopy="Costo medio mensile suddiviso fra le voci principali di spesa del condominio."
							formatValue={(value) => formatMoney(value, currency)}
							showLegend={false}
						/>
					</CardContent>
				</Card>

				<ul class="payments-breakdown-grid" aria-label="Voci di spesa">
					{#each breakdown as item}
						<li>
							<button
								type="button"
								class="payments-breakdown-cell"
								class:payments-breakdown-cell--active={breakdownSelectedKey === item.key}
								aria-pressed={breakdownSelectedKey === item.key}
								onclick={() =>
									(breakdownSelectedKey = breakdownSelectedKey === item.key ? null : item.key)}
							>
								<span
									class="payments-breakdown-cell__icon"
									style={`background:color-mix(in oklch,${item.color} 18%,transparent);color:${item.color};`}
									aria-hidden="true"
								>
									<HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.85} />
								</span>
								<div class="payments-breakdown-cell__main">
									<p class="payments-breakdown-cell__label">{item.label}</p>
									<p class="payments-breakdown-cell__meta">{item.percentLabel} della rata</p>
								</div>
								<p class="payments-breakdown-cell__amount">{formatMoney(item.amount, currency)}</p>
							</button>
						</li>
					{/each}
				</ul>
			</section>

			<!-- 3. Stats compatte -->
			<section class="payments-stats">
				<div class="payments-stats__item">
					<p class="payments-stats__label">Versato a oggi</p>
					<p class="payments-stats__value">{formatMoney(totalPaidByResident, currency)}</p>
					<p class="payments-stats__meta">{personalPaidPayments.length} rate registrate</p>
				</div>
				<div class="payments-stats__divider" aria-hidden="true"></div>
				<div class="payments-stats__item">
					<p class="payments-stats__label">Da saldare</p>
					<p class="payments-stats__value">{formatMoney(outstandingResidentTotal, currency)}</p>
					<p class="payments-stats__meta">
						{context.personalPayments.length - personalPaidPayments.length} in attesa
					</p>
				</div>
			</section>

			<!-- 4. Storico personale -->
			<section class="payments-section">
				<div class="payments-section__heading">
					<h2 class="payments-section__title">Le tue ricevute</h2>
					<p class="payments-section__copy">Le quote collegate al tuo profilo residente.</p>
				</div>

				{#if context.personalPayments.length > 0}
					<div class="payment-cards-stack">
						{#each context.personalPayments as payment}
							{@const footnote = getPaymentFootnote(payment)}
							<ResidentPaymentCard
								eyebrow="Quota residente"
								title={payment.description}
								description={`Operazione prevista per ${formatPaymentDate(payment.paidAt ?? payment.createdAt)}.`}
								amountLabel={formatMoney(payment.amount, payment.currency)}
								status={getResidentPaymentStatus(payment)}
								facts={[
									{ label: 'Da', value: context.currentUser?.name ?? 'Residente' },
									{ label: 'Verso', value: context.admin?.name ?? 'Svicom' }
								]}
								chips={[payment.id]}
								footerLabel={footnote.label}
								footerValue={footnote.value}
								href={`/resident/payments/${payment.id}`}
							/>
						{/each}
					</div>
				{:else}
					<ResidentEmptyCard
						title="Nessuna ricevuta"
						copy="Quando saranno disponibili nuovi movimenti, li troverai qui."
					/>
				{/if}
			</section>

			<!-- 5. Movimenti del condominio -->
			{#if visibleRecentProperty.length > 0}
				<section class="payments-section">
					<div class="payments-section__heading payments-section__heading--row">
						<div>
							<h2 class="payments-section__title">Movimenti del condominio</h2>
							<p class="payments-section__copy">
								Spese operative recenti per dare contesto alle tue quote.
							</p>
						</div>
						{#if context.propertyOperationalPayments.length > visibleRecentProperty.length}
							<span class="payments-section__link" aria-hidden="true">
								{context.propertyOperationalPayments.length} totali
								<HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={1.85} />
							</span>
						{/if}
					</div>

					<ul class="payments-property-list">
						{#each visibleRecentProperty as payment}
							{@const footnote = getPaymentFootnote(payment)}
							<li>
								<a href={`/resident/payments/${payment.id}`} class="payments-property-list__item">
									<span class="payments-property-list__icon" aria-hidden="true">
										<HugeiconsIcon icon={CalendarCheckOut01Icon} size={16} strokeWidth={1.85} />
									</span>
									<div class="payments-property-list__main">
										<p class="payments-property-list__title">{payment.description}</p>
										<p class="payments-property-list__meta">{footnote.label} {footnote.value}</p>
									</div>
									<p class="payments-property-list__amount">
										{formatMoney(payment.amount, payment.currency)}
									</p>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<!-- 6. Contatti amministratore -->
			<Card class="payments-admin-card">
				<CardHeader>
					<CardTitle class="payments-admin-card__title">Amministrazione</CardTitle>
					<CardDescription class="payments-admin-card__copy">
						Il referente per quote, ricevute e ripartizioni del tuo stabile.
					</CardDescription>
				</CardHeader>
				<CardContent class="payments-admin-card__content">
					<dl class="payments-admin-card__facts">
						<div>
							<dt>Amministratore</dt>
							<dd>{context.admin?.name ?? 'Operatore Svicom'}</dd>
						</div>
						<div>
							<dt>Email</dt>
							<dd>{context.admin?.email ?? 'Non disponibile'}</dd>
						</div>
						<div>
							<dt>Telefono</dt>
							<dd>{context.admin?.phone ?? 'Non disponibile'}</dd>
						</div>
					</dl>
					<Button href="/resident/chat" size="lg" class="payments-admin-card__button">
						Contatta amministrazione
					</Button>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
