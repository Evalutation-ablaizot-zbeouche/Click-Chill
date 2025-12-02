import { API_KEY, BASE_URL } from './config.js';

async function getRandomMovie() {
	const filters = {
		language: "fr-FR", // langue française
		sort_by: "popularity.desc",
		"vote_average.gte": 6, // minimum note 6/10
		"primary_release_date.gte": "2000-01-01",
		"primary_release_date.lte": new Date().toISOString().split("T")[0], // aujourd'hui
		with_original_language: "fr", // films en français
		page: 1,
	};

	const queryString = new URLSearchParams({
		api_key: API_KEY,
		...filters,
	}).toString();

	// 1) Requête initiale pour obtenir total_pages
	const discoverRes = await fetch(
		`${BASE_URL}/discover/movie?${queryString}`
	);
	const discoverData = await discoverRes.json();

	const totalPages = discoverData.total_pages;
	const maxPages = Math.min(totalPages, 500);
	const randomPage = Math.floor(Math.random() * maxPages) + 1;

	// 2) Requête page aléatoire avec mêmes filtres
	const queryStringPage = new URLSearchParams({
		api_key: API_KEY,
		...filters,
		page: randomPage,
	}).toString();
	const pageRes = await fetch(
		`${BASE_URL}/discover/movie?${queryStringPage}`
	);
	const pageData = await pageRes.json();

	const results = pageData.results;
	if (!results || results.length === 0) throw new Error("Aucun film trouvé");

	// 3) Tirage aléatoire dans la page
	const randomIndex = Math.floor(Math.random() * results.length);
	return results[randomIndex];
}

document.getElementById("search-movie").addEventListener("click", async () => {
	try {
		const movie = await getRandomMovie();

		// Sélection de la div et de ses éléments enfants
		const infoDiv = document.querySelector(".info-movie");
		const img = infoDiv.querySelector("img");
		const title = infoDiv.querySelector("h3");
		const overview = infoDiv.querySelector("span");

		// Remplissage des infos
		// TMDb : les images doivent être complétées avec l'URL de base
		img.src = movie.poster_path
			? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
			: "https://via.placeholder.com/300x450?text=No+Image";
		img.alt = movie.title;

		title.textContent = movie.title;
		overview.textContent = movie.overview || "Pas de synopsis disponible.";
	} catch (err) {
		console.error(err);
	}
});
