// セットリストのファイル名リスト
const setlistFiles = [
    "25-01-18(WinterTour).json",
    "25-01-17(NewYearLive).json",
    "25-01-16(SpecialEvent).json"
];

// セットリストデータのキャッシュ
let setlistData = [];

// 頻繁に披露される曲を集計
function getFrequentSongs() {
    const songCount = {};
    setlistData.forEach(setlist => {
        setlist.songs.forEach(song => {
            songCount[song] = (songCount[song] || 0) + 1;
        });
    });

    return Object.entries(songCount)
        .sort((a, b) => b[1] - a[1])
        .map(([song, count]) => `${song}: ${count}回`);
}

// 披露された全曲の一覧を取得
function getAllSongs() {
    const allSongs = new Set();
    setlistData.forEach(setlist => {
        setlist.songs.forEach(song => allSongs.add(song));
    });
    return Array.from(allSongs).sort();
}

// メニュークリック時の表示切り替え
function displayResult(type) {
    const container = document.getElementById("result");

    if (type === "setlists") {
        container.innerHTML = "<h3>セットリスト一覧</h3><ul>";
        setlistFiles.forEach((file, index) => {
            const match = file.match(/^(\d{2}-\d{2}-\d{2})\((.+)\)\.json$/);
            if (match) {
                const [_, shortDate, eventName] = match;
                const fullDate = `20${shortDate.replace(/-/g, "-")}`;
                const item = document.createElement("li");
                const link = document.createElement("a");
                link.textContent = `${eventName} (${fullDate})`;
                link.href = "#";
                link.addEventListener("click", () => displaySetlistDetails(index));
                item.appendChild(link);
                container.appendChild(item);
            }
        });
        container.innerHTML += "</ul>";
    } else if (type === "frequent-songs") {
        const frequentSongs = getFrequentSongs();
        container.innerHTML = "<h3>頻繁に披露された曲</h3><ul>";
        frequentSongs.forEach(song => {
            container.innerHTML += `<li>${song}</li>`;
        });
        container.innerHTML += "</ul>";
    } else if (type === "all-songs") {
        const allSongs = getAllSongs();
        container.innerHTML = "<h3>これまでに披露された曲</h3><ul>";
        allSongs.forEach(song => {
            container.innerHTML += `<li>${song}</li>`;
        });
        container.innerHTML += "</ul>";
    }
}

// 特定のセットリストの詳細を表示
function displaySetlistDetails(index) {
    const container = document.getElementById("result");
    const setlist = setlistData[index];
    container.innerHTML = `
        <h3>曲リスト</h3>
        <ul>
            ${setlist.songs.map(song => `<li>${song}</li>`).join('')}
        </ul>
    `;
}

// 全セットリストを読み込む
function loadSetlists() {
    const promises = setlistFiles.map(file =>
        fetch(`setlists/${file}`).then(response => response.json())
    );

    Promise.all(promises)
        .then(data => {
            setlistData = data;
        })
        .catch(error => {
            console.error("Error loading setlists:", error);
        });
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
    loadSetlists();
    document.getElementById("view-setlists").addEventListener("click", () => displayResult("setlists"));
    document.getElementById("view-frequent-songs").addEventListener("click", () => displayResult("frequent-songs"));
    document.getElementById("view-all-songs").addEventListener("click", () => displayResult("all-songs"));
});
