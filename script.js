// 1. ファイルリストを取得して表示
function fetchFileList() {
    const fileIndexUrl = "setlists/index.json"; // ファイルリストが格納されたJSON

    fetch(fileIndexUrl)
        .then(response => response.json())
        .then(files => {
            displayDateList(files);
        })
        .catch(error => {
            console.error("Error fetching file list:", error);
        });
}

// 2. ファイル名リストからリンクを生成して表示
function displayDateList() {
    const container = document.getElementById("date-list");

    setlistFiles.forEach(file => {
        // ファイル名から日付とイベント名を抽出
        const match = file.match(/^(\d{2}-\d{2}-\d{2})\((.+)\)\.json$/);
        if (match) {
            const [_, shortDate, eventName] = match;
            const fullDate = `20${shortDate.replace(/-/g, "-")}`;

            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = `${eventName} (${fullDate})`;
            link.href = "#";
            link.addEventListener("click", () => loadSetlistDetails(file));
            item.appendChild(link);
            container.appendChild(item);
        }
    });
}

// 3. JSONファイルから曲リストを読み込んで表示
function loadSetlistDetails(file) {
    const container = document.getElementById("setlist-details");

    fetch(`setlists/${file}`)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = `
                <ul>
                    ${data.songs.map(song => `<li>${song}</li>`).join('')}
                </ul>
            `;
        })
        .catch(error => {
            container.innerHTML = `<p>セットリストの読み込み中にエラーが発生しました。</p>`;
            console.error("Error loading setlist:", error);
        });
}

// 初期化
document.addEventListener("DOMContentLoaded", displayDateList);
