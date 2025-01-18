// セットリストデータ
const setlists = [
    { date: "2025-01-18", event: "Winter Tour", songs: ["Song D", "Song E", "Song F"] },
    { date: "2025-01-17", event: "New Year Live", songs: ["Song A", "Song B", "Song C"] },
    { date: "2025-01-16", event: "Special Event", songs: ["Song A", "Song D", "Song E"] },
];

// 1. 日付ごとに整列
function displaySortedSetlists() {
    const sortedSetlists = setlists.sort((a, b) => new Date(b.date) - new Date(a.date));
    const container = document.getElementById("sorted-setlists");

    sortedSetlists.forEach(setlist => {
        const section = document.createElement("div");
        section.innerHTML = `
            <h3>${setlist.event} (${setlist.date})</h3>
            <ul>
                ${setlist.songs.map(song => `<li>${song}</li>`).join('')}
            </ul>
        `;
        container.appendChild(section);
    });
}

// 2. 披露回数が多い曲を表示
function displayFrequentSongs() {
    const songCount = {};
    setlists.forEach(setlist => {
        setlist.songs.forEach(song => {
            songCount[song] = (songCount[song] || 0) + 1;
        });
    });

    const sortedSongs = Object.entries(songCount).sort((a, b) => b[1] - a[1]);
    const container = document.getElementById("frequent-songs");

    sortedSongs.forEach(([song, count]) => {
        const item = document.createElement("p");
        item.textContent = `${song}: ${count}回`;
        container.appendChild(item);
    });
}

// 3. 披露された全曲の一覧を表示
function displayAllSongs() {
    const allSongs = new Set();
    setlists.forEach(setlist => {
        setlist.songs.forEach(song => allSongs.add(song));
    });

    const container = document.getElementById("all-songs");
    Array.from(allSongs).sort().forEach(song => {
        const item = document.createElement("li");
        item.textContent = song;
        container.appendChild(item);
    });
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
    displaySortedSetlists();
    displayFrequentSongs();
    displayAllSongs();
});
