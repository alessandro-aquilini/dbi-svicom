<script lang="ts">
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';

	let { date, children } = $props<{
		date: Date;
		children: any;
	}>();
</script>

<div class="mb-4 mt-6 first:mt-2">
	<h3 class="px-1 text-sm font-bold text-foreground">
		{format(date, 'd MMMM yyyy', { locale: it })}
	</h3>
	<div class="mt-2 divide-y divide-border/40 border-t border-border/40">
		{@render children()}
	</div>
</div>
