<script lang="ts">
	import { getCurrentUserId } from '$lib/auth';
	import { SupplierCalendar } from '$lib/components/supplier/calendar';
</script>

<div class="flex-1 flex flex-col min-h-0 pb-20 md:pb-0">
	<SupplierCalendar />
</div>
