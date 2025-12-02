function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeFetch(url, retries = 3) {
	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (err) {
		if (err.message.includes("429") && retries > 0) {
			console.warn("Rate limit reached, retrying in 2s...");
			await wait(2000);
			return safeFetch(url, retries - 1);
		}
		throw err;
	}
}

async function getRandomAnime() {
	// 1) Récupération initiale pour connaître le nombre de pages
	const dataFirst = await safeFetch(
		"https://api.jikan.moe/v4/anime?order_by=score&sort=desc"
	);

	const totalPages = dataFirst.pagination?.last_visible_page || 1;
	const maxPages = Math.min(totalPages, 100);
	const randomPage = Math.floor(Math.random() * maxPages) + 1;

	// 2) Tirage page aléatoire
	const dataPage = await safeFetch(
		`https://api.jikan.moe/v4/anime?order_by=score&sort=desc&page=${randomPage}`
	);

	const results = dataPage.data;
	if (!results || results.length === 0) return getRandomAnime(); // retry simple

	const randomIndex = Math.floor(Math.random() * results.length);
	return results[randomIndex];
}

// Exemple d'utilisation pour bouton "Animé"
document.getElementById("search-anime").addEventListener("click", async () => {
	try {
		const anime = await getRandomAnime();

		const infoDiv = document.querySelector(".info-anime");
		const img = infoDiv.querySelector("img");
		const title = infoDiv.querySelector("h3");
		const overview = infoDiv.querySelector("span");

		img.src =
			anime.images.jpg.image_url ||
			"https://via.placeholder.com/300x450?text=No+Image";
		img.alt = anime.title;

		title.textContent = anime.title;
		overview.textContent = anime.synopsis || "Pas de synopsis disponible.";
	} catch (err) {
		console.error(err);
	}
});
