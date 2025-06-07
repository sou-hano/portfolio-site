// タイトルロゴ画像を common.json から読み込んで挿入
fetch('signed_urls/common.json')
  .then(res => res.json())
  .then(data => {
    const logoUrl = data["portfolio_images/common/TitleLogo"];
    if (logoUrl) {
      const logoImg = document.createElement('img');
      logoImg.src = logoUrl;
      logoImg.alt = "Title Logo";
      document.getElementById('site-logo').appendChild(logoImg);
    } else {
      console.warn("TitleLogo のURLが見つかりませんでした");
    }
  })
  .catch(err => {
    console.error("ロゴ画像の読み込みに失敗しました:", err);
  });


// original.json を読み込んで画像を表示
fetch('signed_urls/original.json')
  .then(res => res.json())
  .then(data => {
    // 表示対象とする画像のpublic_id（拡張子なし）
    const targets = [
      "portfolio_images/original/DearSeraph",
      "portfolio_images/original/ネコザメの卵",
      "portfolio_images/original/饕餮行脚万圣节",
      "portfolio_images/original/桜ねこ",
      "portfolio_images/original/海底撈月",
      "portfolio_images/original/Dilly-dally"
    ];

    // 表示領域のDOM要素を取得
    const container = document.getElementById('original-image-test');

    if (!container) {
      console.warn("original-image-test の表示エリアが見つかりませんでした");
      return;
    }

    // 対象画像を順次追加
    targets.forEach(id => {
      const url = data[id];
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = id.split('/').pop(); // ファイル名だけaltに設定
        img.loading = "lazy"; // 必要に応じてlazy属性付与
        container.appendChild(img);
      } else {
        console.warn(`画像が見つかりませんでした: ${id}`);
      }
    });
  })
  .catch(err => {
    console.error("original画像の読み込みに失敗しました:", err);
  });
