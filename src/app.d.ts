// Every page has the site read from the database at build (the root layout's server load).
declare global {
	namespace App {
		interface PageData {
			site: import('./lib/site').Site;
		}
	}
}

export {};
