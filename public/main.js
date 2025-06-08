// タイトルロゴ画像を common.json から読み込んで挿入
fetch('signed_urls/common.json')
    .then(res => res.json())
    .then(data => {
        const logoData = data["portfolio_images/common/TitleLogo"];
        if (logoData && logoData.url) {
            const logoImg = document.createElement('img');
            logoImg.src = logoData.url;
            logoImg.alt = "Title Logo";
            document.getElementById('site-logo').appendChild(logoImg);
        }
        else {
            console.warn("TitleLogo のURLが見つかりませんでした");
        }
    })
    .catch(err => {
        console.error("ロゴ画像の読み込みに失敗しました:", err);
    });

// 関数：モーダルを開いて表示内容を更新
function showModal(item) {
  modal.style.display = "block";
  modalImg.src = item.url;
  modalTitle.textContent = item.title || "";
  modalDesc.innerHTML = item.description || ""; //innerHTMLにして、.json内に記述した改行コード<br>を認識するようにする
}

// モーダル要素を取得
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const modalClose = document.querySelector(".modal-close");

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
            const item = data[id];

            if (item && item.url) {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = item.title || id.split('/').pop(); // ファイル名だけaltに設定
                img.loading = "lazy"; // 必要に応じてlazy属性付与

                img.addEventListener("click", () => {
                    showModal(item);
                });
                // スマホ用
                /*
                img.addEventListener("touchstart", e => {
                    e.preventDefault();
                    showModal(item);
                }, { passive: false });
                */
                container.appendChild(img);
            }
            else {
                console.warn(`画像が見つかりませんでした: ${id}`);
            }
        });
    })
    .catch(err => {
        console.error("original画像の読み込みに失敗しました:", err);
    });

// モーダルを閉じる処理
modalClose.onclick = () => {
    modal.style.display = "none";
};
modal.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
