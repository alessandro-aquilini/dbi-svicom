<script lang="ts">
	import { Calendar03Icon, Clock01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import type { Service } from '$lib/data/services';

	interface Props {
		service: Service;
		onBook: (bookingData: any) => void;
		isBooking?: boolean;
		bookingSuccess?: boolean;
	}

	let { service, onBook, isBooking = false, bookingSuccess = false }: Props = $props();

	let selectedDate = $state('');
	let startTime = $state('09:00');
	let endTime = $state('10:00');
	let notes = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();

		const bookingData = {
			serviceId: service.id,
			date: selectedDate,
			startTime,
			endTime,
			notes
		};

		onBook(bookingData);
	}
</script>

<div class="space-y-6">
	<form onsubmit={handleSubmit} class="space-y-5">
		<div class="space-y-2">
			<label for="date" class="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Quando?</label>
			<div class="relative group">
				<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground transition-colors group-focus-within:text-primary">
					<HugeiconsIcon icon={Calendar03Icon} size={18} />
				</div>
				<input
					type="date"
					id="date"
					required
					bind:value={selectedDate}
					class="w-full h-14 bg-muted/30 border-2 border-transparent rounded-2xl pl-12 pr-4 text-[15px] font-semibold focus:outline-none focus:bg-background focus:border-primary/20 transition-all"
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<label for="start" class="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Dalle</label>
				<div class="relative group">
					<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground transition-colors group-focus-within:text-primary">
						<HugeiconsIcon icon={Clock01Icon} size={18} />
					</div>
					<input
						type="time"
						id="start"
						required
						bind:value={startTime}
						class="w-full h-14 bg-muted/30 border-2 border-transparent rounded-2xl pl-12 pr-4 text-[15px] font-semibold focus:outline-none focus:bg-background focus:border-primary/20 transition-all"
					/>
				</div>
			</div>
			<div class="space-y-2">
				<label for="end" class="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Alle</label>
				<div class="relative group">
					<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground transition-colors group-focus-within:text-primary">
						<HugeiconsIcon icon={Clock01Icon} size={18} />
					</div>
					<input
						type="time"
						id="end"
						required
						bind:value={endTime}
						class="w-full h-14 bg-muted/30 border-2 border-transparent rounded-2xl pl-12 pr-4 text-[15px] font-semibold focus:outline-none focus:bg-background focus:border-primary/20 transition-all"
					/>
				</div>
			</div>
		</div>

		<div class="space-y-2">
			<label for="notes" class="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Note (opzionale)</label>
			<textarea
				id="notes"
				bind:value={notes}
				placeholder="Hai richieste particolari?"
				rows="3"
				class="w-full bg-muted/30 border-2 border-transparent rounded-3xl p-5 text-[15px] font-semibold focus:outline-none focus:bg-background focus:border-primary/20 transition-all resize-none"
			></textarea>
		</div>

		<div class="pt-4">
			<button
				type="submit"
				disabled={isBooking || bookingSuccess}
				class="relative w-full h-16 rounded-3xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-80 flex items-center justify-center overflow-hidden"
			>
				{#if bookingSuccess}
					<div class="flex items-center gap-2">
						<HugeiconsIcon icon={Tick02Icon} size={24} strokeWidth={3} />
						<span>Richiesta Inviata!</span>
					</div>
				{:else if isBooking}
					<div class="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
				{:else}
					<span>Invia Richiesta</span>
				{/if}
			</button>
		</div>
	</form>
</div>
