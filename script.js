// セットリストのファイル名リスト（`index.json` から読み込む）
let setlistFiles = [];
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
        setlistData.forEach((setlist, index) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `${setlist.event} (${setlist.date})`;
            link.href = "#";
            link.addEventListener("click", (e) => {
                e.preventDefault(); // デフォルトのリンク動作を無効化
                displaySetlistDetails(index);
            });
            item.appendChild(link);
            container.appendChild(item);
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
    if (setlist) {
        container.innerHTML = `
            <h3>${setlist.event} (${setlist.date})</h3>
            <ul>
                ${setlist.songs.map(song => `<li>${song}</li>`).join('')}
            </ul>
        `;
    } else {
        container.innerHTML = "<p>指定されたセットリストが見つかりません。</p>";
    }
}

// `index.json` を読み込んでセットリストデータを取得
function loadSetlists() {
    fetch("setlists/index.json")
        .then(response => response.json())
        .then(files => {
            setlistFiles = files;

            // 各セットリストファイルを読み込む
            const promises = setlistFiles.map(file =>
                fetch(`setlists/${file}`).then(response => response.json())
            );

            return Promise.all(promises);
        })
        .then(data => {
            setlistData = data;
            console.log("Setlist data loaded:", setlistData); // デバッグ用
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
