import { getBookingById, getBookingsByResidentId, type BookingStatus, inferBookingStatus, lastBookingEvent, bookings, type Booking, getBookingsBySupplierId } from '$lib/data/ticket/booking';
import { getCurrentUser } from '$lib/auth';
import { getResidentById } from '$lib/data/residents';
import { services } from '$lib/data/services';

export function getResidentBookings() {
    const user = getCurrentUser();
    if (!user) return [];
    const resident = getResidentById(user.id);
    if (!resident) return [];
    return getBookingsByResidentId(resident.id);
}

export function getActiveResidentBookings() {
    return getResidentBookings().filter(b => {
        const status = inferBookingStatus(b);
        return ['requested', 'confirmed'].includes(status);
    });
}

export function getPastResidentBookings() {
    return getResidentBookings().filter(b => {
        const status = inferBookingStatus(b);
        return ['cancelled', 'closed', 'declined'].includes(status);
    });
}

export function getServiceById(id: string) {
    return services.find(s => s.id === id);
}

export function getSupplierServices(supplierId: string) {
    return services.filter(s => s.supplierId === supplierId);
}

export function getSupplierBookings() {
    const user = getCurrentUser();
    if (!user) return [];
    return getBookingsBySupplierId(user.id);
}

export function getActiveSupplierBookings() {
    return getSupplierBookings().filter(b => {
        const status = inferBookingStatus(b);
        return ['requested', 'confirmed'].includes(status);
    });
}

export function getPastSupplierBookings() {
    return getSupplierBookings().filter(b => {
        const status = inferBookingStatus(b);
        return ['cancelled', 'closed', 'declined'].includes(status);
    });
}
