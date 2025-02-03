// グローバル変数
let setlistFiles = [];
let setlistData = []; // セットリストデータをキャッシュ

// 1. ファイルリストを取得して表示
function fetchFileList() {
    const fileIndexUrl = "setlists/index.json"; // ファイルリストが格納されたJSON

    fetch(fileIndexUrl)
        .then(response => response.json())
        .then(files => {
            setlistFiles = files; // グローバル変数に保存
            loadSetlistData(files); // セットリストのデータをロード
            displayDateList(files); // セットリスト一覧を表示
        })
        .catch(error => {
            console.error("Error fetching file list:", error);
        });
}

// 2. セットリストデータをロード
function loadSetlistData(files) {
    const promises = files.map(file =>
        fetch(`setlists/${file}`).then(response => response.json())
    );

    Promise.all(promises)
        .then(data => {
            setlistData = data; // グローバル変数にキャッシュ
        })
        .catch(error => {
            console.error("Error loading setlist data:", error);
        });
}

function displayDateList(files, selectedMonth = "all") {
    const container = document.getElementById("result");
    container.innerHTML = "<h3>セットリスト一覧</h3><ul id='date-list'></ul>";
    const dateList = document.getElementById("date-list");

    files.forEach(file => {
        const match = file.match(/^([\d-]+)_(.+)\.json$/);
        if (match) {
            const [_, date, eventName] = match;
            const yearMonth = date.slice(0, 7);

            // 月が選択されている場合、フィルタリング
            if (selectedMonth !== "all" && yearMonth !== selectedMonth) return;

            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `${eventName.replace(/_/g, " ")} (${date})`;
            link.href = "#";
            link.addEventListener("click", () => loadSetlistDetails(file));
            item.appendChild(link);
            dateList.appendChild(item);
        }
    });
}

// 4. セットリストの詳細を読み込む
function loadSetlistDetails(file) {
    const container = document.getElementById("result");

    fetch(`setlists/${file}`)
        .then(response => response.json())
        .then(setlist => {
            container.innerHTML = `
                <h3>${setlist.event} (${setlist.date})</h3>
                <ul>
                    ${setlist.songs.map(song => `<li>${song}</li>`).join('')}
                </ul>
            `;
        })
        .catch(error => {
            container.innerHTML = `<p>セットリストの読み込み中にエラーが発生しました。</p>`;
            console.error("Error loading setlist:", error);
        });
}

// 5. 頻繁に披露される曲を表示
function displayFrequentSongs() {
    const container = document.getElementById("result");

    if (setlistData.length === 0) {
        container.innerHTML = "<p>データがまだ読み込まれていません。</p>";
        return;
    }

    const songCount = {};
    setlistData.forEach(setlist => {
        setlist.songs.forEach(song => {
            songCount[song] = (songCount[song] || 0) + 1;
        });
    });

    const sortedSongs = Object.entries(songCount)
        .sort((a, b) => b[1] - a[1])
        .map(([song, count]) => `${song}: ${count}回`);

    container.innerHTML = "<h3>頻繁に披露された曲</h3><ul>";
    sortedSongs.forEach(song => {
        container.innerHTML += `<li>${song}</li>`;
    });
    container.innerHTML += "</ul>";
}

// 6. これまでに披露された曲を表示
function displayAllSongs() {
    const container = document.getElementById("result");

    if (setlistData.length === 0) {
        container.innerHTML = "<p>データがまだ読み込まれていません。</p>";
        return;
    }

    const songMap = getSongsWithEvents(); // 曲と公演情報を取得
    const allSongs = Object.keys(songMap).sort(); // 曲名をソート

    container.innerHTML = "<h3>これまでに披露された曲</h3><ul id='song-list'></ul>";
    const songList = document.getElementById("song-list");

    allSongs.forEach(song => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = song;
        link.href = "#";
        link.addEventListener("click", () => displayEventsForSong(songMap[song], song));
        item.appendChild(link);
        songList.appendChild(item);
    });
}

// 曲ごとに公演情報を収集
function getSongsWithEvents() {
    const songMap = {};

    setlistData.forEach(setlist => {
        setlist.songs.forEach(song => {
            if (!songMap[song]) {
                songMap[song] = [];
            }
            songMap[song].push({
                date: setlist.date,
                event: setlist.event
            });
        });
    });

    return songMap;
}

// 特定の曲に対応する公演一覧を表示
function displayEventsForSong(events, song) {
    const container = document.getElementById("result");

    container.innerHTML = `
        <h3>${song} が披露された公演</h3>
        <ul>
            ${events
                .map(event => `<li>${event.event} (${event.date})</li>`)
                .join("")}
        </ul>
        <a href="#" id="back-to-all-songs">曲一覧に戻る</a>
    `;

    document.getElementById("back-to-all-songs").addEventListener("click", (e) => {
        e.preventDefault();
        displayAllSongs();
    });
}

// 月一覧を作成してクリックで選択できるようにする
function createMonthLinks(files) {
    const monthSet = new Set();
    files.forEach(file => {
        const match = file.match(/^([\d-]+)_(.+)\.json$/);
        if (match) {
            const [date] = match;
            const yearMonth = date.slice(0, 7); // YYYY-MM を取得
            monthSet.add(yearMonth);
        }
    });

    const monthSelection = document.getElementById("month-selection");
    monthSet.forEach(month => {
        const link = document.createElement("a");
        link.href = "#";
        link.className = "month-link";
        link.textContent = month;
        link.addEventListener("click", () => displayDateList(setlistFiles, month));
        monthSelection.appendChild(link);
        monthSelection.appendChild(document.createTextNode(" | "));
    });

    // 「すべての月」をクリックすると全件表示
    document.getElementById("all-months").addEventListener("click", () => displayDateList(setlistFiles, "all"));
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
    fetchFileList(); // ファイルリストを取得

    // メニュークリックイベントの設定
    document.getElementById("view-setlists").addEventListener("click", () => {
        displayDateList(setlistFiles);
    });

    document.getElementById("view-frequent-songs").addEventListener("click", displayFrequentSongs);
    document.getElementById("view-all-songs").addEventListener("click", displayAllSongs);
});

