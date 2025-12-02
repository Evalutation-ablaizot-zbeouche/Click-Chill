import { API_KEY, BASE_URL } from "./config.js";

async function getRandomSeries() {
	const filters = {
		language: "fr-FR", // titres et synopsis en français
		sort_by: "popularity.desc", // tri par popularité
		"vote_average.gte": 6, // minimum note 6/10
		"first_air_date.gte": "2000-01-01", // séries récentes
		"first_air_date.lte": new Date().toISOString().split("T")[0],
		page: 1,
	};

	// Transforme les filtres en query string
	const queryString = new URLSearchParams({
		api_key: API_KEY,
		...filters,
	}).toString();

	// 1) Requête initiale pour obtenir total_pages
	const discoverRes = await fetch(`${BASE_URL}/discover/tv?${queryString}`);
	const discoverData = await discoverRes.json();

	const totalPages = discoverData.total_pages;
	const maxPages = Math.min(totalPages, 500);
	const randomPage = Math.floor(Math.random() * maxPages) + 1;

	// 2) Requête page aléatoire
	const queryStringPage = new URLSearchParams({
		api_key: API_KEY,
		...filters,
		page: randomPage,
	}).toString();
	const pageRes = await fetch(`${BASE_URL}/discover/tv?${queryStringPage}`);
	const pageData = await pageRes.json();

	const results = pageData.results;
	if (!results || results.length === 0)
		throw new Error("Aucune série trouvée");

	// 3) Tirage aléatoire dans la page
	const randomIndex = Math.floor(Math.random() * results.length);
	return results[randomIndex];
}

// Événement pour le bouton "Série"
document.getElementById("search-serie").addEventListener("click", async () => {
	try {
		const series = await getRandomSeries();

		// Sélection de la div info
		const infoDiv = document.querySelector(".info-serie");
		const img = infoDiv.querySelector("img");
		const title = infoDiv.querySelector("h3");
		const overview = infoDiv.querySelector("span");

		// Remplissage des infos
		img.src = series.poster_path
			? `https://image.tmdb.org/t/p/w300${series.poster_path}`
			: "https://via.placeholder.com/300x450?text=No+Image";
		img.alt = series.name;

		title.textContent = series.name;
		overview.textContent = series.overview || "Pas de synopsis disponible.";
	} catch (err) {
		console.error(err);
	}
});
