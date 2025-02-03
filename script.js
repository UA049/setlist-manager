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

// 3. ファイル名リストからリンクを表示
function displayDateList(files) {
    const container = document.getElementById("result");

    container.innerHTML = "<h3>セットリスト一覧</h3><ul id='date-list'></ul>";
    const dateList = document.getElementById("date-list");

    files.forEach(file => {
        const match = file.match(/^([\d-]+)_(.+)\.json$/);
        if (match) {
            const [_, date, eventName] = match;

            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `${eventName.replace(/_/g, " ")} (${date})`; // "_" をスペースに置換
            link.href = "#";
            link.addEventListener("click", () => loadSetlistDetails(file));
            item.appendChild(link);
            dateList.appendChild(item);
        }
    });
}

// 3. 月ごとに分類してファイル名リストを表示
function displayDateList(files) {
    const container = document.getElementById("result");
    container.innerHTML = "<h3>セットリスト一覧</h3><ul id='month-list'></ul>";

    const monthList = document.getElementById("month-list");
    const monthGroups = {};

    files.forEach(file => {
        const match = file.match(/^(\d{4})-(\d{2})-\d{2}_(.+)\.json$/);
        if (match) {
            const [_, year, month, eventName] = match;
            const monthKey = `${year}-${month}`;

            if (!monthGroups[monthKey]) {
                monthGroups[monthKey] = [];
            }
            monthGroups[monthKey].push({ file, eventName });
        }
    });

    // 月の一覧を作成（降順にソート）
    Object.keys(monthGroups)
        .sort((a, b) => b.localeCompare(a)) // 新しい順に表示
        .forEach(monthKey => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = monthKey;
            link.href = "#";
            link.addEventListener("click", () => displaySetlistsForMonth(monthKey, monthGroups[monthKey]));
            item.appendChild(link);
            monthList.appendChild(item);
        });
}

// 4. 選択した月のセットリストを表示
function displaySetlistsForMonth(month, setlists) {
    const container = document.getElementById("result");
    container.innerHTML = `<h3>${month} のセットリスト</h3><ul id='setlist-${month}'></ul>`;

    const setlistContainer = document.getElementById(`setlist-${month}`);

    setlists.forEach(({ file, eventName }) => {
        const match = file.match(/^([\d-]+)_(.+)\.json$/);
        if (match) {
            const [_, date, eventName] = match;
            
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `${eventName.replace(/_/g, " ")} (${date})`;
            link.href = "#";
            link.addEventListener("click", () => loadSetlistDetails(file));
            item.appendChild(link);
            setlistContainer.appendChild(item);
        }
    });

    // 戻るボタンを追加
    const backButton = document.createElement("a");
    backButton.href = "#";
    backButton.textContent = "一覧に戻る";
    backButton.style.display = "block";
    backButton.style.marginTop = "10px";
    backButton.addEventListener("click", (e) => {
        e.preventDefault();
        displayDateList(setlistFiles);
    });

    container.appendChild(backButton);
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
