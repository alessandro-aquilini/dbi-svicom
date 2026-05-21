<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	let {
		title,
		copy
	}: {
		title: string;
		copy: string;
	} = $props();
</script>

<Card class="resident-empty-card">
	<CardHeader class="resident-empty-card__header">
		<CardTitle class="resident-empty-card__title">{title}</CardTitle>
	</CardHeader>
	<CardContent class="resident-empty-card__content">
		<p class="resident-empty-card__copy">{copy}</p>
	</CardContent>
</Card>
