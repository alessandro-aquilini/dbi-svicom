<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowRight01Icon,
		DropletIcon,
		LightbulbOffIcon,
		SparklesIcon,
		Wrench01Icon
	} from '@hugeicons/core-free-icons';
	import { ResidentEmptyCard } from '$lib/components/resident';
	import {
		buildResidentTicketAttachmentSummary,
		buildResidentTicketAiDraft,
		createResidentLocalTicketWithPresentation,
		getResidentTicketCategoryOption,
		getResidentTicketDynamicFields,
		getResidentTicketPriorityOption,
		residentTicketCategoryOptions,
		residentTicketPriorityOptions,
		sanitizeResidentTicketPriority,
		ticketStatusLabels,
		type ResidentTicketFieldAnswer
	} from '$lib/components/reports';
	import { InfoTip } from '$lib/components/shared';
	import { getCurrentUser } from '$lib/auth';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	type ReportFormState = {
		title: string;
		category: string;
		priority: string;
		description: string;
	};

	type ReportFormErrors = Partial<Record<keyof ReportFormState, string>>;

	type AiExample = {
		icon: typeof SparklesIcon;
		label: string;
		text: string;
	};

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);

	let form = $state<ReportFormState>({
		title: '',
		category: residentTicketCategoryOptions[0]?.value ?? '',
		priority: 'media',
		description: ''
	});
	let dynamicAnswers = $state<Record<string, string>>({});
	let errors = $state<ReportFormErrors>({});
	let dynamicFieldErrors = $state<Record<string, string>>({});
	let attachmentSummaries = $state<ReturnType<typeof buildResidentTicketAttachmentSummary>>([]);
	let isSubmitting = $state(false);
	let aiPrompt = $state('');
	let aiPanelOpen = $state(false);
	let isAiApplying = $state(false);
	let aiApplied = $state(false);

	const aiExamples: AiExample[] = [
		{
			icon: DropletIcon,
			label: "Perdita d'acqua",
			text: "C'è una perdita d'acqua nel locale caldaia della scala B e da stamattina si sente odore di umido."
		},
		{
			icon: LightbulbOffIcon,
			label: 'Luce non funzionante',
			text: 'La lampadina del pianerottolo al secondo piano e spenta da ieri sera e la zona resta buia.'
		},
		{
			icon: Wrench01Icon,
			label: 'Portone da sistemare',
			text: "Il portone d'ingresso principale non chiude bene e rimane spesso socchiuso."
		}
	];

	const selectedCategory = $derived(getResidentTicketCategoryOption(form.category));
	const selectedPriority = $derived(getResidentTicketPriorityOption(form.priority));
	const dynamicFields = $derived(getResidentTicketDynamicFields(form.category));
	const prefilledFacts = $derived(
		currentUser && resident && property
			? [
					{ label: 'Residente', value: currentUser.name, copy: 'Profilo che inviera la segnalazione.' },
					{ label: 'Condominio', value: property.name, copy: property.address.street },
					{ label: 'Unita abitativa', value: resident.apartment, copy: 'Dato collegato al profilo residente.' },
					{ label: 'Stato iniziale', value: ticketStatusLabels['nuova'], copy: 'La pratica parte come nuova segnalazione.' }
				]
			: []
	);

	function setField<K extends keyof ReportFormState>(field: K, value: ReportFormState[K]) {
		form[field] = value;

		if (errors[field]) {
			errors = { ...errors, [field]: undefined };
		}
	}

	function setDynamicAnswer(fieldId: string, value: string) {
		dynamicAnswers[fieldId] = value;
		if (dynamicFieldErrors[fieldId]) {
			const { [fieldId]: _removed, ...rest } = dynamicFieldErrors;
			dynamicFieldErrors = rest;
		}
	}

	function handleAttachmentsChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		attachmentSummaries = input.files ? buildResidentTicketAttachmentSummary(input.files) : [];
	}

	function toggleAiPanel() {
		aiPanelOpen = !aiPanelOpen;
	}

	function useAiExample(text: string) {
		aiPrompt = text;
		aiPanelOpen = true;
	}

	async function handleAiFill() {
		if (!aiPrompt.trim()) return;

		isAiApplying = true;
		await new Promise((resolve) => setTimeout(resolve, 650));

		const aiDraft = buildResidentTicketAiDraft(aiPrompt);
		form = {
			title: aiDraft.title,
			category: aiDraft.category,
			priority: aiDraft.priority,
			description: aiDraft.description
		};
		dynamicAnswers = { ...aiDraft.dynamicAnswers };
		errors = {};
		dynamicFieldErrors = {};
		aiApplied = true;
		aiPanelOpen = false;
		isAiApplying = false;
	}

	function validateForm(): boolean {
		const nextErrors: ReportFormErrors = {};
		const nextDynamicFieldErrors: Record<string, string> = {};

		if (form.title.trim().length < 6) {
			nextErrors.title = 'Inserisci un titolo di almeno 6 caratteri.';
		}

		if (!form.category) {
			nextErrors.category = 'Seleziona una categoria disponibile.';
		}

		if (!form.priority) {
			nextErrors.priority = 'Seleziona una priorita.';
		}

		if (form.description.trim().length < 20) {
			nextErrors.description = 'Aggiungi una descrizione di almeno 20 caratteri.';
		}

		for (const field of dynamicFields) {
			if (!dynamicAnswers[field.id]?.trim()) {
				nextDynamicFieldErrors[field.id] = 'Completa questo campo prima di inviare la segnalazione.';
			}
		}

		errors = nextErrors;
		dynamicFieldErrors = nextDynamicFieldErrors;
		return Object.keys(nextErrors).length === 0 && Object.keys(nextDynamicFieldErrors).length === 0;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!currentUser || !resident || !property || !validateForm()) {
			return;
		}

		isSubmitting = true;
		await new Promise((resolve) => setTimeout(resolve, 650));

		const fieldAnswers: ResidentTicketFieldAnswer[] = dynamicFields.map((field) => ({
			id: field.id,
			label: field.label,
			value: dynamicAnswers[field.id]?.trim() ?? ''
		}));

		const ticket = createResidentLocalTicketWithPresentation(
			{
				title: form.title,
				description: form.description,
				priority: sanitizeResidentTicketPriority(form.priority),
				category: form.category,
				reportedById: currentUser.id,
				propertyId: property.id
			},
			{
				attachments: attachmentSummaries,
				fieldAnswers
			}
		);

		await goto(`/resident/reports?created=1&report=${ticket.id}`);
	}
</script>

<svelte:head>
	<title>Nuova segnalazione - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="reports-page reports-page--detail">
	<Button href="/resident/reports" variant="link" class="report-back-button">
		&lt; Tutte le segnalazioni
	</Button>

	{#if !currentUser || !resident || !property}
		<ResidentEmptyCard
			title="Profilo residente non disponibile"
			copy="Non e possibile creare una segnalazione senza un profilo residente attivo."
		/>
	{:else}
		<div class="report-detail-stack">
			<Card class="report-hero-card">
				<CardHeader class="report-hero-card__header">
					<div class="report-hero-card__heading">
						<p class="report-hero-card__eyebrow">Nuova pratica</p>
						<CardTitle class="report-hero-card__title">Crea una segnalazione</CardTitle>
					</div>
				</CardHeader>

				<CardContent class="report-hero-card__content">
					<p class="report-hero-card__copy">
						Compila i campi richiesti, aggiungi eventuali foto e invia una nuova segnalazione dal tuo profilo residente.
					</p>

					<div class="report-create-prefill">
						{#each prefilledFacts as fact}
							<div class="report-create-prefill__item">
								<p class="report-create-prefill__label">{fact.label}</p>
								<p class="report-create-prefill__value">{fact.value}</p>
								<p class="report-create-prefill__copy">{fact.copy}</p>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<Card class="report-form-card">
				<CardHeader class="report-section-card__header">
					<div class="report-form-card__header-row">
						<div>
							<CardTitle class="report-section-card__title">Dettagli della segnalazione</CardTitle>
							<CardDescription class="report-section-card__copy">
								Inserisci le informazioni che il residente puo valorizzare in fase di apertura segnalazione.
							</CardDescription>
						</div>

						<div class="report-ai-trigger">
							<Button
								type="button"
								variant="outline"
								size="sm"
								class="report-ai-trigger__button"
								onclick={toggleAiPanel}
							>
								<HugeiconsIcon icon={SparklesIcon} size={15} strokeWidth={2} />
								<span>Compila con AI</span>
							</Button>
							<InfoTip text="Scrivi liberamente il problema: il sistema compila titolo, categoria, priorita, descrizione e campi specifici da rivedere prima dell invio." />
						</div>
					</div>
				</CardHeader>

				<CardContent class="report-form-card__content">
					<form class="report-form" onsubmit={handleSubmit}>
						{#if aiPanelOpen}
							<div class="report-ai-panel">
								<div class="report-ai-panel__header">
									<div>
										<p class="report-ai-panel__eyebrow">Assistente compilazione</p>
										<p class="report-ai-panel__title">Racconta il problema in linguaggio naturale</p>
									</div>
									<p class="report-ai-panel__copy">
										Descrivi liberamente cosa succede, dove succede e da quando: i campi sotto verranno precompilati.
									</p>
								</div>

								<div class="report-ai-examples">
									<p class="report-ai-examples__label">Esempi rapidi</p>
									<div class="report-ai-examples__list">
										{#each aiExamples as example}
											<Button
												type="button"
												variant="outline"
												size="sm"
												class="report-ai-examples__button"
												onclick={() => useAiExample(example.text)}
											>
												<span class="report-ai-examples__icon" aria-hidden="true">
													<HugeiconsIcon icon={example.icon} size={14} strokeWidth={1.85} />
												</span>
												<span class="report-ai-examples__text">{example.label}</span>
											</Button>
										{/each}
									</div>
								</div>

								<Textarea
									rows={5}
									placeholder="Es. C'è una perdita nel locale caldaia della scala B, da stamattina si vede acqua a terra e manca acqua calda in alcuni appartamenti."
									value={aiPrompt}
									oninput={(event: Event) => (aiPrompt = (event.currentTarget as HTMLTextAreaElement).value)}
									class="report-ai-panel__textarea"
								/>

								<div class="report-ai-panel__actions">
									<Button
										type="button"
										size="lg"
										class="report-ai-panel__submit"
										disabled={isAiApplying || !aiPrompt.trim()}
										onclick={handleAiFill}
									>
										{#if isAiApplying}
											Compilazione in corso...
										{:else}
											<HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.2} />
											<span>Compila i campi</span>
										{/if}
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="lg"
										class="report-ai-panel__dismiss"
										disabled={isAiApplying}
										onclick={() => (aiPanelOpen = false)}
									>
										Chiudi
									</Button>
								</div>
							</div>
						{/if}

						{#if aiApplied}
							<div class="report-ai-result">
								<p class="report-ai-result__title">Campi precompilati</p>
								<p class="report-ai-result__copy">
									I campi sono stati riempiti. Ora controlla il contenuto, fai eventuali correzioni e invia la segnalazione.
								</p>
							</div>
						{/if}

						<div class="report-form__field">
							<Label for="report-title">Titolo</Label>
							<Input
								id="report-title"
								name="title"
								placeholder="Es. Ascensore scala B fermo"
								value={form.title}
								oninput={(event: Event) =>
									setField('title', (event.currentTarget as HTMLInputElement).value)}
								aria-invalid={errors.title ? 'true' : undefined}
								class="report-form__input"
							/>
							{#if errors.title}
								<p class="report-form__error">{errors.title}</p>
							{/if}
						</div>

						<div class="report-form__grid">
							<div class="report-form__field">
								<Label for="report-category-trigger">Categoria</Label>
								<Select type="single" bind:value={form.category}>
									<SelectTrigger
										id="report-category-trigger"
										class="report-form__select-trigger"
										aria-invalid={errors.category ? 'true' : undefined}
									>
										{selectedCategory?.label ?? 'Seleziona categoria'}
									</SelectTrigger>
									<SelectContent>
										{#each residentTicketCategoryOptions as option}
											<SelectItem value={option.value} label={option.label} />
										{/each}
									</SelectContent>
								</Select>
								<p class="report-form__hint">{selectedCategory?.copy}</p>
								{#if errors.category}
									<p class="report-form__error">{errors.category}</p>
								{/if}
							</div>

							<div class="report-form__field">
								<Label for="report-priority-trigger">Priorita</Label>
								<Select type="single" bind:value={form.priority}>
									<SelectTrigger
										id="report-priority-trigger"
										class="report-form__select-trigger"
										aria-invalid={errors.priority ? 'true' : undefined}
									>
										{selectedPriority?.label ?? 'Seleziona priorita'}
									</SelectTrigger>
									<SelectContent>
										{#each residentTicketPriorityOptions as option}
											<SelectItem value={option.value} label={option.label} />
										{/each}
									</SelectContent>
								</Select>
								<p class="report-form__hint">{selectedPriority?.copy}</p>
								{#if errors.priority}
									<p class="report-form__error">{errors.priority}</p>
								{/if}
							</div>
						</div>

						{#if dynamicFields.length > 0}
							<div class="report-dynamic-grid">
								{#each dynamicFields as field}
									<div class="report-form__field">
										<Label for={`dynamic-${field.id}`}>{field.label}</Label>
										{#if field.input === 'textarea'}
											<Textarea
												id={`dynamic-${field.id}`}
												rows={4}
												placeholder={field.placeholder}
												value={dynamicAnswers[field.id] ?? ''}
												oninput={(event: Event) =>
													setDynamicAnswer(field.id, (event.currentTarget as HTMLTextAreaElement).value)}
												aria-invalid={dynamicFieldErrors[field.id] ? 'true' : undefined}
												class="report-form__textarea"
											/>
										{:else}
											<Input
												id={`dynamic-${field.id}`}
												placeholder={field.placeholder}
												value={dynamicAnswers[field.id] ?? ''}
												oninput={(event: Event) =>
													setDynamicAnswer(field.id, (event.currentTarget as HTMLInputElement).value)}
												aria-invalid={dynamicFieldErrors[field.id] ? 'true' : undefined}
												class="report-form__input"
											/>
										{/if}
										<p class="report-form__hint">{field.copy}</p>
										{#if dynamicFieldErrors[field.id]}
											<p class="report-form__error">{dynamicFieldErrors[field.id]}</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						<div class="report-form__field">
							<Label for="report-description">Descrizione</Label>
							<Textarea
								id="report-description"
								name="description"
								rows={6}
								placeholder="Descrivi il problema, quando si presenta e che impatto ha nella vita quotidiana."
								value={form.description}
								oninput={(event: Event) =>
									setField('description', (event.currentTarget as HTMLTextAreaElement).value)}
								aria-invalid={errors.description ? 'true' : undefined}
								class="report-form__textarea"
							/>
							{#if errors.description}
								<p class="report-form__error">{errors.description}</p>
							{/if}
						</div>

						<div class="report-form__field">
							<Label for="report-attachments">Foto e allegati</Label>
							<Input
								id="report-attachments"
								type="file"
								accept="image/*"
								multiple
								onchange={handleAttachmentsChange}
								class="report-form__input"
							/>
							<p class="report-form__hint">
								Puoi allegare foto del problema per dare piu contesto alla segnalazione.
							</p>
							{#if attachmentSummaries.length > 0}
								<div class="report-attachments">
									{#each attachmentSummaries as attachment}
										<div class="report-attachments__item">
											<p class="report-attachments__name">{attachment.name}</p>
											<p class="report-attachments__meta">{attachment.typeLabel} · {attachment.sizeLabel}</p>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<div class="report-form__actions">
							<Button
								type="submit"
								size="lg"
								class="report-form__submit"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Invio in corso...' : 'Invia segnalazione'}
							</Button>
							<Button
								href="/resident/reports"
								variant="outline"
								size="lg"
								class="report-form__cancel"
								disabled={isSubmitting}
							>
								Annulla
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
