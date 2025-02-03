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
            displayDateList(files); // 月ごとのセットリスト一覧を表示
        })
        .catch(error => {
            console.error("Error fetching file list:", error);
        });
}

// 2. 月ごとに分類してファイル名リストを表示
function displayDateList(files) {
    console.log("ファイルリスト:", files); // デバッグ用

    const container = document.getElementById("result");
    container.innerHTML = "<h3>セットリスト一覧</h3><ul id='month-list'></ul>";

    const monthList = document.getElementById("month-list");

    // YY-MM.json 形式のファイルをリストに追加
    files.sort((a, b) => b.localeCompare(a)) // 新しい順に並べる
         .forEach(file => {
        const match = file.match(/^(\d{2}-\d{2})\.json$/);
        if (match) {
            const monthKey = match[1]; // YY-MM

            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `20${monthKey}`; // "20YY-MM" の形で表示
            link.href = "#";
            link.addEventListener("click", () => {
                console.log(`クリックされた月: ${monthKey}`); // デバッグ用
                loadSetlistDetails(file);
            });
            item.appendChild(link);
            monthList.appendChild(item);
        } else {
            console.warn("正規表現にマッチしなかったファイル:", file);
        }
    });
}

// 3. 選択した月のセットリストを表示
function loadSetlistDetails(file) {
    console.log(`表示するセットリスト: ${file}`); // デバッグ用

    const container = document.getElementById("result");

    fetch(`setlists/${file}`)
        .then(response => response.json())
        .then(setlist => {
            container.innerHTML = `
                <h3>セットリスト (${file.replace(".json", "")})</h3>
                <ul>
                    ${setlist.songs.map(song => `<li>${song}</li>`).join('')}
                </ul>
                <a href="#" id="back-to-list">一覧に戻る</a>
            `;

            document.getElementById("back-to-list").addEventListener("click", (e) => {
                e.preventDefault();
                console.log("一覧に戻るボタンがクリックされました"); // デバッグ用
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

    // メニュークリックイベントの設定
    document.getElementById("view-setlists").addEventListener("click", () => {
        displayDateList(setlistFiles);
    });
});
