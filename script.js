<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setlist Manager</title>
    <script defer src="script.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        h1, h2 {
            color: #333;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        li {
            margin: 5px 0;
        }
        a {
            text-decoration: none;
            color: #007BFF;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>Setlist Manager</h1>

    <section>
        <h2>1. セットリスト（日付ごと）</h2>
        <ul id="date-list"></ul>
    </section>

    <section>
        <h2>セットリスト詳細</h2>
        <div id="setlist-details">
            <p>表示するセットリストをクリックしてください。</p>
        </div>
    </section>
</body>
</html>
