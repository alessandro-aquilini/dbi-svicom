<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import type { ResidentPaymentStatus } from './presentation';
	import PaymentStatusBadge from './PaymentStatusBadge.svelte';

	type PaymentCardFact = {
		label: string;
		value: string;
	};

	let {
		eyebrow,
		title,
		description,
		amountLabel,
		status,
		facts = [],
		chips = [],
		footerLabel,
		footerValue,
		href,
		ctaLabel = 'Apri dettaglio'
	}: {
		eyebrow: string;
		title: string;
		description: string;
		amountLabel: string;
		status: ResidentPaymentStatus;
		facts?: PaymentCardFact[];
		chips?: string[];
		footerLabel: string;
		footerValue: string;
		href?: string;
		ctaLabel?: string;
	} = $props();
</script>

<Card class="payment-card-shell">
	<CardHeader class="payment-card-shell__header">
		<div class="payment-card-shell__header-main">
			<p class="payment-card-shell__eyebrow">{eyebrow}</p>
			{#if href}
				<a href={href} class="payment-card-shell__title-link">
					<CardTitle class="payment-card-shell__title">{title}</CardTitle>
				</a>
			{:else}
				<CardTitle class="payment-card-shell__title">{title}</CardTitle>
			{/if}
		</div>

		<PaymentStatusBadge {status} />
	</CardHeader>

	<CardContent class="payment-card-shell__content">
		<p class="payment-card-shell__amount">{amountLabel}</p>
		<p class="payment-card-shell__description">{description}</p>

		{#if chips.length > 0}
			<div class="payment-card-shell__chips">
				{#each chips as chip}
					<span class="payment-card-shell__chip">{chip}</span>
				{/each}
			</div>
		{/if}

		{#if facts.length > 0}
			<div class="payment-card-shell__facts">
				{#each facts as fact}
					<div class="payment-card-shell__fact">
						<p class="payment-card-shell__fact-label">{fact.label}</p>
						<p class="payment-card-shell__fact-value">{fact.value}</p>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>

	<Separator class="payment-card-shell__separator" />

	<CardFooter class="payment-card-shell__footer">
		<div class="payment-card-shell__footer-copy">
			<p class="payment-card-shell__footer-label">{footerLabel}</p>
			<p class="payment-card-shell__footer-value">{footerValue}</p>
		</div>

		{#if href}
			<Button href={href} size="lg" class="payment-card-shell__button">
				{ctaLabel}
			</Button>
		{/if}
	</CardFooter>
</Card>
