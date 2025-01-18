// セットリストファイルリストを格納するグローバル変数
let setlistFiles = [];
// セットリストデータをキャッシュするグローバル変数
let setlistData = [];

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
        const match = file.match(/^(\d{2}-\d{2}-\d{2})\((.+)\)\.json$/);
        if (match) {
            const [_, shortDate, eventName] = match;
            const fullDate = `20${shortDate.replace(/-/g, "-")}`;

            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `${eventName} (${fullDate})`;
            link.href = "#";
            link.addEventListener("click", (e) => {
                e.preventDefault(); // リンクのデフォルト動作を無効化
                loadSetlistDetails(file);
            });
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

// 初期化
document.addEventListener("DOMContentLoaded", () => {
    fetchFileList();
});
