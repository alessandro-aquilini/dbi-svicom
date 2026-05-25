<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getServiceById } from '$lib/data/services';
	import { getUserById } from '$lib/data/users';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { getCurrentUser } from '$lib/auth';
	import { createBooking, type Booking } from '$lib/data/ticket/booking';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		StarIcon, 
		ArrowLeft02Icon, 
		Calendar03Icon, 
		Clock01Icon, 
		InformationCircleIcon,
		Tick02Icon
	} from '@hugeicons/core-free-icons';

	const serviceId = page.params.id || '';
	const service = getServiceById(serviceId);
	const supplier = service ? getUserById(service.supplierId) : null;
	const currentUser = getCurrentUser();

	let selectedDate = $state('');
	let startTime = $state('09:00');
	let endTime = $state('10:00');
	let notes = $state('');
	let isBooking = $state(false);
	let bookingSuccess = $state(false);
	let bookingError = $state('');

	function handleBack() {
		window.history.back();
	}

	function handleBook(e: Event) {
		e.preventDefault();
		if (!service || !currentUser) {
			bookingError = 'Impossibile inviare la richiesta. Riprova.';
			return;
		}

		bookingError = '';
		isBooking = true;
		
		// Simulate a bit of delay for the "premium" feel
		setTimeout(() => {
			const bookingId = `bkg-new-${Math.random().toString(36).slice(2, 7)}`;
			
			const newBooking: Booking = {
				id: bookingId,
				residentId: currentUser.id,
				serviceId: service.id,
				supplierId: service.supplierId,
				timeline: [
					{
						id: `${bookingId}-e1`,
						kind: 'booking_created',
						authorId: currentUser.id,
						at: new Date().toISOString(),
						slot: { 
							start: `${selectedDate}T${startTime}:00`, 
							end: `${selectedDate}T${endTime}:00` 
						},
						place: 'Il mio appartamento',
						description: notes,
						propertyId: propertySelection.selectedId ?? undefined
					}
				],
				messageTimeline: [
					{
						id: `msg-${bookingId}-1`,
						senderId: currentUser.id,
						text: `Richiesta prenotazione per ${service.name}. Note: ${notes || 'Nessuna nota'}`,
						timestamp: new Date().toISOString()
					}
				]
			};

			// Push to local data
			createBooking(newBooking);
			
			bookingSuccess = true;
			isBooking = false;

			setTimeout(() => {
				// Navigate to supplier booking board so the request is visible to the vendor.
				goto(`/resident/services`);
			}, 1500);
		}, 1000);
	}

	if (!service) {
		// Handle 404
	}
</script>

<svelte:head>
	<title>{service?.name || 'Dettaglio Servizio'} — Svicom</title>
</svelte:head>

{#if service}
	<div class="mx-auto max-w-xl pb-24">
		<!-- Mobile Header -->
		<div class="sticky top-0 z-20 flex items-center justify-between bg-background/80 px-4 py-4 backdrop-blur-md">
			<button 
				type="button" 
				onclick={handleBack}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-foreground transition-transform active:scale-90"
			>
				<HugeiconsIcon icon={ArrowLeft02Icon} size={20} />
			</button>
			<h2 class="text-sm font-black uppercase tracking-[0.2em] text-foreground/50">Dettaglio Servizio</h2>
			<div class="w-10"></div>
		</div>

		<div class="px-4">
			<!-- Hero Info -->
			<div class="mt-4 space-y-6">
				<div class="space-y-2">
					<div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
						{service.category.replace('-', ' ')}
					</div>
					<h1 class="text-3xl font-black tracking-tight text-foreground leading-tight">{service.name}</h1>
				</div>

				<div class="flex items-center gap-4 border-y border-border/40 py-6">
					<div class="h-12 w-12 shrink-0 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
						<!-- Placeholder for supplier logo -->
						<span class="text-lg font-black text-primary/40">{supplier?.name?.[0]}</span>
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Fornito da</p>
						<p class="text-base font-bold text-foreground truncate">{supplier?.name}</p>
					</div>
					<div class="flex flex-col items-end gap-1">
						<div class="flex items-center gap-1 text-amber-500">
							<HugeiconsIcon icon={StarIcon} size={16} class="fill-current" />
							<span class="text-lg font-black text-foreground">{service.rating.toFixed(1)}</span>
						</div>
						<p class="text-[10px] font-bold text-muted-foreground uppercase">{service.comments.length} recensioni</p>
					</div>
				</div>

				<div class="space-y-4">
					<h3 class="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Descrizione</h3>
					<p class="text-[17px] leading-relaxed text-foreground/80">
						{service.description}
					</p>
				</div>

				<!-- Info Cards -->
				<div class="grid grid-cols-2 gap-3">
					<div class="rounded-3xl border border-border bg-muted/20 p-5">
						<p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Prezzo</p>
						<p class="text-xl font-black text-primary">{service.pricing}</p>
					</div>
					<div class="rounded-3xl border border-border bg-muted/20 p-5">
						<p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Disponibilità</p>
						<p class="text-xs font-bold leading-tight text-foreground">{service.availabilityText || 'Su richiesta'}</p>
					</div>
				</div>

				<!-- Booking Form -->
				<div class="mt-10 space-y-6 pt-6 border-t border-border/40">
					<div class="flex items-center gap-2">
						<HugeiconsIcon icon={InformationCircleIcon} size={20} class="text-primary" />
						<h3 class="text-xl font-black tracking-tight text-foreground">Prenota ora</h3>
					</div>

					<form onsubmit={handleBook} class="space-y-5">
						<div class="space-y-2">
							<label for="date" class="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Quando?</label>
							<div class="relative group">
								<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
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
								<div class="relative">
									<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
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
								<div class="relative">
									<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
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

						{#if bookingError}
							<div class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
								{bookingError}
							</div>
						{/if}

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

				<!-- Reviews (Optional Preview) -->
				{#if service.comments.length > 0}
					<div class="mt-12 space-y-6 pt-10 border-t border-border/40">
						<h3 class="text-xl font-black tracking-tight text-foreground">Cosa dicono gli altri</h3>
						<div class="space-y-4">
							{#each service.comments as comment}
								{@const author = getUserById(comment.authorId)}
								<div class="rounded-3xl bg-muted/10 p-5 border border-border/30">
									<div class="flex items-center justify-between mb-3">
										<p class="text-sm font-bold">{author?.name || 'Residente'}</p>
										<p class="text-[10px] font-bold text-muted-foreground uppercase">{new Date(comment.date).toLocaleDateString()}</p>
									</div>
									<p class="text-[15px] leading-relaxed text-foreground/70 italic">"{comment.text}"</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="flex h-screen flex-col items-center justify-center p-4 text-center">
		<h1 class="text-2xl font-black">Servizio non trovato</h1>
		<p class="mt-2 text-muted-foreground">Il servizio che stai cercando non sembra esistere.</p>
		<button onclick={handleBack} class="mt-6 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground">Torna indietro</button>
	</div>
{/if}
