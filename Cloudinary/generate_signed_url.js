const fs = require('fs');                       // 署名付きURL出力先ファイル操作用モジュール
const cloudinary = require('cloudinary').v2;    // Cloudinary SDK
const path = require('path');                   // 出力ファイルのパス操作用

// Cloudinaryアカウント情報
cloudinary.config({
    cloud_name: 'dihjz2opk',
    api_key: '431651465559666',
    api_secret: 'tTjVKEUOdBeW8Nt_t2UGThyP6LM',
});

// コマンドラインから署名を付けるCloudinaryのベースフォルダ名を取得
const folderName = process.argv[2];
if (!folderName) {
    console.error('Cloudinary上のフォルダ名を指定してください: node generate_signed_urls_from_folder.js <Cloudinaryフォルダ名>');
    process.exit(1);
}

// 認証期間（秒数換算で大まかに指定）
const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30 * 18); // 現在から約18か月

// サブフォルダ単位で分類して.jsonに格納する
const genreUrlMap = {};

// 指定フォルダ内の画像のpublic IDを取得（非同期）
// next_cursor によって複数ページにまたがる結果もすべて取得する
const getResourcesInFolder = async (folder, nextCursor = null, results = []) => {
    const options =
    {
        type: 'authenticated',
        prefix: folder + '/',   // 指定フォルダ以下のpublic_idのみ
        max_results: 100,       // 最大件数
    };
    if (nextCursor) {
        options.next_cursor = nextCursor; // 2ページ目以上の取得に使用
    }

    // APIで画像リストを取得
    const response = await cloudinary.api.resources(options);
    results.push(...response.resources);

    if (response.next_cursor) {
        // 次のページがある場合は再帰的に取得 (自身を再度実行)
        return getResourcesInFolder(folder, response.next_cursor, results);
    }
    else {
        return results;
    }
};

// async () => { ... }：非同期の無名関数
// 無名関数を()でくくって関数式として定義し、末尾の括弧( ... )();で定義直後に即実行(即時実行関数：IIFE)
// Node.js ではトップレベル (関数外) で基本的にawaitを使えないためこの形で即時に実行 
(async () => {
    try {
        const resources = await getResourcesInFolder(folderName);

        if (resources.length === 0) {
            console.log(`フォルダ "${folderName}" に画像が見つかりませんでした。`);
            return;
        }

        // 画像ごとにジャンルを判定し、署名付きURLをマッピング
        for (const res of resources) {
            const publicId = res.public_id;  // 例: portfolio_images/original/cat
            const pathParts = publicId.replace(`${folderName}/`, '').split('/'); // /で区切る ['original', 'cat']
            const genre = pathParts[0]; // サブフォルダ名をジャンル名に

            if (!genreUrlMap[genre]) genreUrlMap[genre] = {};

            // 署名付きURL生成 (非同期)
            const signedUrl = cloudinary.url(publicId, {
                type: 'authenticated',
                sign_url: true,
                expires_at: expiresAt,
                transformation: [
                    { quality: "auto", fetch_format: "auto" } // 表示環境に応じて画質・拡張子を最適化
                ]
            });

            genreUrlMap[genre][publicId] = signedUrl;
            console.log(`${publicId} -> ${genre} に分類`);
        }

        // 出力フォルダがなければ作成
        const outputDir = path.resolve(`./public/signed_urls`);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        // ジャンルごとに .json 出力
        for (const [genre, urlMap] of Object.entries(genreUrlMap)) {
            const outputPath = path.join(outputDir, `${genre}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(urlMap, null, 2), 'utf-8');
            console.log(`${genre}.json に ${Object.keys(urlMap).length} 件出力`);
        }

        console.log(`\n完了：${Object.keys(genreUrlMap).length} ジャンルのURLを出力しました。`);


    } catch (error) {
        console.error("エラー:", error.message);
    }
})();