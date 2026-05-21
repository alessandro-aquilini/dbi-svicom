<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	type AccessFact = {
		label: string;
		value: string;
	};

	let {
		eyebrow,
		title,
		copy,
		sessionCode,
		previewUrl,
		buttonLabel,
		href,
		buttonVariant = 'default',
		target,
		rel,
		facts = []
	}: {
		eyebrow: string;
		title: string;
		copy: string;
		sessionCode: string;
		previewUrl: string;
		buttonLabel: string;
		href: string;
		buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
		target?: string;
		rel?: string;
		facts?: AccessFact[];
	} = $props();
</script>

<Card class="assembly-access-card">
	<CardHeader class="assembly-access-card__header">
		<div class="assembly-access-card__heading">
			<p class="assembly-access-card__eyebrow">{eyebrow}</p>
			<CardTitle class="assembly-access-card__title">{title}</CardTitle>
			<CardDescription class="assembly-access-card__copy">{copy}</CardDescription>
		</div>

		<Badge variant="outline" class="assembly-access-card__session">{sessionCode}</Badge>
	</CardHeader>

	<CardContent class="assembly-access-card__content">
		<div class="assembly-access-card__facts">
			{#each facts as fact}
				<div class="assembly-access-card__fact">
					<p class="assembly-access-card__fact-label">{fact.label}</p>
					<p class="assembly-access-card__fact-value">{fact.value}</p>
				</div>
			{/each}

			<div class="assembly-access-card__fact assembly-access-card__fact--full">
				<p class="assembly-access-card__fact-label">Endpoint</p>
				<p class="assembly-access-card__fact-value assembly-access-card__fact-value--mono">
					{previewUrl}
				</p>
			</div>
		</div>

		<Button
			{href}
			variant={buttonVariant}
			size="lg"
			{target}
			{rel}
			class="assembly-access-card__button"
		>
			{buttonLabel}
		</Button>
	</CardContent>
</Card>
