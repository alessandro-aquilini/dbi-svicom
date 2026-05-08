import type { Announcement } from '$lib/data/announcements';
import type { Assembly } from '$lib/data/events/assemblies';

export function getResidentVisibleAnnouncements(
	announcements: Announcement[],
	assemblies: Assembly[]
): Announcement[] {
	const latestAssemblyYear = assemblies.reduce((latestYear, assembly) => {
		const year = new Date(assembly.scheduledAt).getFullYear();
		return Number.isNaN(year) ? latestYear : Math.max(latestYear, year);
	}, 0);

	return announcements.filter((announcement) => {
		const lowerTitle = announcement.title.toLowerCase();
		const lowerContent = announcement.content.toLowerCase();
		const mentionsAssembly =
			lowerTitle.includes('assemblea') || lowerContent.includes('assemblea');

		if (!mentionsAssembly || latestAssemblyYear === 0) {
			return true;
		}

		const createdYear = new Date(announcement.createdAt).getFullYear();
		return Number.isNaN(createdYear) || createdYear >= latestAssemblyYear;
	});
}
