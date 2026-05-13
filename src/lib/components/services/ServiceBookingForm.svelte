<script lang="ts">
    import { Calendar03Icon, Clock01Icon } from '@hugeicons/core-free-icons';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import type { Service } from '$lib/data/services';
    import { bookings, type Booking } from '$lib/data/ticket/booking';
    import { getCurrentUser } from '$lib/auth';

    interface Props {
        service: Service;
        onBook: (bookingData: any) => void;
        onCancel: () => void;
    }

    let { service, onBook, onCancel }: Props = $props();

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

<div class="space-y-6 py-2">
    <div>
        <h3 class="text-xl font-bold text-foreground">{service.name}</h3>
        <p class="text-sm text-muted-foreground">Compila i dettagli per richiedere la prenotazione</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-4">
        <div class="space-y-2">
            <label for="date" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data dell'intervento</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <HugeiconsIcon icon={Calendar03Icon} size={18} />
                </div>
                <input 
                    type="date" 
                    id="date"
                    required
                    bind:value={selectedDate}
                    class="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
                <label for="start" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ora Inizio</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                        <HugeiconsIcon icon={Clock01Icon} size={18} />
                    </div>
                    <input 
                        type="time" 
                        id="start"
                        required
                        bind:value={startTime}
                        class="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>
            <div class="space-y-2">
                <label for="end" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ora Fine</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                        <HugeiconsIcon icon={Clock01Icon} size={18} />
                    </div>
                    <input 
                        type="time" 
                        id="end"
                        required
                        bind:value={endTime}
                        class="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>
        </div>

        <div class="space-y-2">
            <label for="notes" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Note aggiuntive (opzionale)</label>
            <textarea 
                id="notes"
                bind:value={notes}
                placeholder="Indica eventuali dettagli utili per il fornitore..."
                rows="3"
                class="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            ></textarea>
        </div>

        <div class="flex gap-3 pt-4">
            <button 
                type="button" 
                onclick={onCancel}
                class="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
            >
                Annulla
            </button>
            <button 
                type="submit"
                class="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
                Conferma Prenotazione
            </button>
        </div>
    </form>
</div>
