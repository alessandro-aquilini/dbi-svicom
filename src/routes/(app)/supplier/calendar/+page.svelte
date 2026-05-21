<script lang="ts">
	import { getCurrentUserId } from '$lib/auth';
	import { SupplierCalendar } from '$lib/components/view-supplier/calendar';
</script>

<div class="h-full flex flex-col min-h-0 pb-20 md:pb-0">
	<SupplierCalendar />
</div>
