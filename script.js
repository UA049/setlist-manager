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
            loadSetlistData(files); // セットリストデータをロード
        })
        .catch(error => {
            console.error("Error fetching file list:", error);
        });
}

// 2. セットリストデータをロード
function loadSetlistData(files) {
    const promises = files.map(file =>
        fetch(`setlists/${file}`)
            .then(response => response.json())
            .then(data => {
                // ファイル名から日付とイベント名を抽出
                const match = file.match(/^(\d{2}-\d{2}-\d{2})_(.+)\.json$/);
                if (match) {
                    data.date = `20${match[1]}`; // YY-MM-DD → 20YY-MM-DD に変換
                    data.event = match[2].replace(/_/g, " "); // イベント名のアンダースコアをスペースに変換
                } else {
                    console.warn("ファイル名の形式が不正:", file);
                }
                return data;
            })
            .catch(error => {
                console.error("セットリストデータの読み込みエラー:", file, error);
                return null;
            })
    );

    Promise.all(promises)
        .then(data => {
            setlistData = data.filter(d => d !== null); // nullデータを除外
            console.log("ロードされたセットリストデータ:", setlistData); // デバッグ用
            displayDateList(setlistFiles); // データロード後に一覧を表示
        })
        .catch(error => {
            console.error("セットリストデータの読み込みに失敗しました:", error);
        });
}

// 3. 月ごとに分類してファイル名リストを表示
function displayDateList(files) {
    const container = document.getElementById("result");
    container.innerHTML = "<h3>セットリスト一覧</h3><ul id='month-list'></ul>";

    const monthList = document.getElementById("month-list");
    const monthGroups = {};

    files.forEach(file => {
        const match = file.match(/^(\d{2}-\d{2})-\d{2}_(.+)\.json$/);
        if (match) {
            const [_, monthKey, eventName] = match; // YY-MM を取得

            if (!monthGroups[monthKey]) {
                monthGroups[monthKey] = [];
            }
            monthGroups[monthKey].push({ file, eventName });
        } else {
            console.warn("正規表現にマッチしなかったファイル:", file);
        }
    });

    Object.keys(monthGroups)
        .sort((a, b) => b.localeCompare(a)) // 新しい順に表示
        .forEach(monthKey => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `20${monthKey}`; // "20YY-MM" の形で表示
            link.href = "#";
            link.addEventListener("click", () => {
                displaySetlistsForMonth(monthKey, monthGroups[monthKey]);
            });
            item.appendChild(link);
            monthList.appendChild(item);
        });
}

// 4. 選択した月のセットリストを表示
function displaySetlistsForMonth(month, setlists) {
    const container = document.getElementById("result");
    container.innerHTML = `<h3>20${month} のセットリスト</h3><ul id='setlist-${month}'></ul>`;

    const setlistContainer = document.getElementById(`setlist-${month}`);

    setlists.forEach(({ file, eventName }) => {
        const match = file.match(/^([\d-]+)_(.+)\.json$/);
        if (match) {
            const [_, date, eventName] = match;
            
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `${eventName.replace(/_/g, " ")} (${date})`;
            link.href = "#";
            link.addEventListener("click", () => {
                loadSetlistDetails(file);
            });
            item.appendChild(link);
            setlistContainer.appendChild(item);
        }
    });

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

// 6. セットリストの詳細を読み込む
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
                <a href="#" id="back-to-list">一覧に戻る</a>
            `;

            document.getElementById("back-to-list").addEventListener("click", (e) => {
                e.preventDefault();
                displayDateList(setlistFiles);
            });
        })
        .catch(error => {
            container.innerHTML = `<p>セットリストの読み込み中にエラーが発生しました。</p>`;
            console.error("Error loading setlist:", error);
        });
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
    fetchFileList(); // ファイルリストを取得

    document.getElementById("view-setlists").addEventListener("click", () => {
        displayDateList(setlistFiles);
    });
    document.getElementById("view-frequent-songs").addEventListener("click", displayFrequentSongs);
});
