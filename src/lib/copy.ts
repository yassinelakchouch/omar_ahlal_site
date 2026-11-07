// The site's own words. The admin has no screens for them yet (no board), so they live here; photos come from the database.
export const NAME = 'Omar Ahallal';
export const BRAND = 'pénte';
export const EMAIL = 'hello@pente.ma';
export const STATEMENT = 'Photographer & videographer in Morocco. Portraits, weddings, brands and nights, shot in natural light and kept honest.';

export const NOTES: Record<string, string> = {
	'natural-portrait': 'golden hour',
	'night-party': 'club light',
	'creative-portrait': 'earthy, moody',
	'uk-street': 'black and white',
	wedding: 'Morocco',
	cinematic: '35 mm',
	brand: 'branding'
};

export const SERVICES = [
	{ label: 'Brand photographer\n& videography', chapter: 'brand', text: 'Your brand’s heart and message, built into a shot list and mood board before the shoot.' },
	{ label: 'Branding\n& design', chapter: 'brand', text: 'From the identity to the guide that carries it into every advert.' },
	{ label: 'Personalized\ncreative shoots', chapter: 'creative-portrait', text: 'Location, styling and the idea, chosen together; you only have to show up.' },
	{ label: 'Wedding photography\n& videography', chapter: 'wedding', text: 'The whole day, from the henna to the last dance.' }
];

export const ABOUT = {
	text: 'Creative director and photographer. Five years behind the camera, since I was fifteen: food, landscape and portrait, then weddings, brands and nights.',
	facts: ['5 years', 'Since 15', 'Morocco']
};
