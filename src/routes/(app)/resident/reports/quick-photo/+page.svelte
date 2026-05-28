<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		Camera01Icon,
		CheckmarkCircle02Icon,
		Image01Icon,
		SentIcon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import { getCurrentUser } from '$lib/auth';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import {
		buildResidentTicketAttachmentSummary,
		createResidentLocalTicketWithPresentation,
		residentTicketCategoryOptions
	} from '$lib/components/view-resident/reports';
	import { quickReport } from '$lib/state/quick-report.svelte';

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);

	let confirmOpen = $state(false);
	let isSubmitting = $state(false);
	let retakeInputEl: HTMLInputElement | null = $state(null);

	const photoSizeLabel = $derived.by(() => {
		const size = quickReport.photo?.size ?? 0;
		if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
		if (size >= 1024) return `${Math.round(size / 1024)} KB`;
		return `${size} B`;
	});

	onMount(() => {
		if (!quickReport.photo) {
			goto('/resident', { replaceState: true });
		}
	});

	function discardAndBack() {
		quickReport.clear();
		goto('/resident');
	}

	function openRetakePicker() {
		retakeInputEl?.click();
	}

	function handleRetake(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		quickReport.setPhoto(file);
		input.value = '';
	}

	function handleSend() {
		if (!quickReport.photo || !currentUser || !resident || !property) return;
		confirmOpen = true;
	}

	async function handleConfirm() {
		if (!quickReport.photo || !currentUser || !resident || !property || isSubmitting) return;
		isSubmitting = true;

		const fakeFile = {
			name: quickReport.photo.name,
			size: quickReport.photo.size,
			type: quickReport.photo.type
		};
		const attachments = buildResidentTicketAttachmentSummary([fakeFile]);

		const ticket = createResidentLocalTicketWithPresentation(
			{
				title: 'Segnalazione rapida con foto',
				description: 'Segnalazione inviata dalla home con una foto del problema.',
				priority: 'media',
				category: residentTicketCategoryOptions[0]?.value ?? 'altro',
				reportedById: currentUser.id,
				propertyId: property.id
			},
			{
				attachments,
				fieldAnswers: []
			}
		);

		quickReport.clear();
		confirmOpen = false;
		await goto(`/resident/reports?created=1&report=${ticket.id}`);
	}
</script>

<svelte:head>
	<title>Nuova segnalazione - Foto - Svicom Living Hub</title>
</svelte:head>

<div class="quick-photo-page">
	{#if !currentUser || !resident || !property}
		<ResidentEmptyCard
			title="Profilo residente non disponibile"
			copy="Non e possibile creare una segnalazione senza un profilo residente attivo."
		/>
	{:else if quickReport.photo}
		<header class="quick-photo-page__header">
			<button
				type="button"
				class="quick-photo-page__back"
				onclick={discardAndBack}
				aria-label="Annulla e torna alla home"
			>
				<HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.85} />
			</button>
			<div class="quick-photo-page__heading">
				<p class="quick-photo-page__eyebrow">Nuova segnalazione</p>
				<h1 class="quick-photo-page__title">Conferma la foto</h1>
			</div>
			<button
				type="button"
				class="quick-photo-page__retake"
				onclick={openRetakePicker}
				aria-label="Sostituisci foto"
			>
				<HugeiconsIcon icon={Camera01Icon} size={16} strokeWidth={1.85} />
				<span>Sostituisci</span>
			</button>
		</header>

		<figure class="quick-photo-page__preview">
			<img src={quickReport.photo.url} alt="Anteprima foto segnalazione" />
			<figcaption class="quick-photo-page__caption">
				<span class="quick-photo-page__caption-icon" aria-hidden="true">
					<HugeiconsIcon icon={Image01Icon} size={14} strokeWidth={1.85} />
				</span>
				<span class="quick-photo-page__caption-name">{quickReport.photo.name}</span>
				<span class="quick-photo-page__caption-meta">{photoSizeLabel}</span>
			</figcaption>
		</figure>

		<p class="quick-photo-page__hint">
			La foto arriverà all'amministratore di {property.name}. Aggiungerà subito una nuova pratica nelle tue segnalazioni.
		</p>

		<div class="quick-photo-page__actions">
			<Button
				type="button"
				size="lg"
				class="quick-photo-page__submit"
				disabled={isSubmitting}
				onclick={handleSend}
			>
				<HugeiconsIcon icon={SentIcon} size={18} strokeWidth={1.85} />
				Invia segnalazione
			</Button>
		</div>
	{/if}
</div>

<input
	bind:this={retakeInputEl}
	type="file"
	accept="image/*"
	capture="environment"
	class="quick-photo-page__file"
	onchange={handleRetake}
/>

<Dialog bind:open={confirmOpen}>
	<DialogContent class="quick-photo-confirm">
		<div class="quick-photo-confirm__icon" aria-hidden="true">
			<HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} strokeWidth={1.85} />
		</div>
		<DialogHeader>
			<DialogTitle>Confermi l'invio?</DialogTitle>
			<DialogDescription>
				La foto verrà allegata a una nuova segnalazione e inviata all'amministratore di {property?.name ?? ''}.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter class="quick-photo-confirm__footer">
			<Button
				type="button"
				variant="ghost"
				onclick={() => (confirmOpen = false)}
				disabled={isSubmitting}
			>
				Torna all'anteprima
			</Button>
			<Button type="button" onclick={handleConfirm} disabled={isSubmitting}>
				Invia segnalazione
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
