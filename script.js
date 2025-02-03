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
            displayDateList(files); // 月ごとのセットリスト一覧を表示
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

// 3. 月ごとに分類してファイル名リストを表示
function displayDateList(files) {
    console.log("ファイルリスト:", files); // デバッグ用

    const container = document.getElementById("result");
    container.innerHTML = "<h3>セットリスト一覧</h3><ul id='month-list'></ul>";

    const monthList = document.getElementById("month-list");
    const monthGroups = {};

    files.forEach(file => {
        console.log("処理中のファイル:", file); // デバッグ用

        const match = file.match(/^(\d{4})-(\d{2})-\d{2}_(.+)\.json$/);
        if (match) {
            const [_, year, month, eventName] = match;
            const monthKey = `${year}-${month}`;

            if (!monthGroups[monthKey]) {
                monthGroups[monthKey] = [];
            }
            monthGroups[monthKey].push({ file, eventName });
        } else {
            console.warn("正規表現にマッチしなかったファイル:", file);
        }
    });

    console.log("分類されたデータ:", monthGroups); // デバッグ用

    // 月の一覧を作成（降順にソート）
    Object.keys(monthGroups)
        .sort((a, b) => b.localeCompare(a)) // 新しい順に表示
        .forEach(monthKey => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = monthKey;
            link.href = "#";
            link.addEventListener("click", () => {
                console.log(`クリックされた月: ${monthKey}`); // デバッグ用
                displaySetlistsForMonth(monthKey, monthGroups[monthKey]);
            });
            item.appendChild(link);
            monthList.appendChild(item);
        });
}

// 4. 選択した月のセットリストを表示
function displaySetlistsForMonth(month, setlists) {
    console.log(`表示するセットリスト（月: ${month}）`, setlists); // デバッグ用

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
            link.addEventListener("click", () => {
                console.log(`クリックされたセットリスト: ${file}`); // デバッグ用
                loadSetlistDetails(file);
            });
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
        console.log("戻るボタンがクリックされました"); // デバッグ用
        displayDateList(setlistFiles);
    });

    container.appendChild(backButton);
}

// 5. セットリストの詳細を読み込む
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
