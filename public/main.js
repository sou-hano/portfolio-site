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

// モーダル要素を取得
const modal = document.getElementById("image-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const modalClose = document.querySelector(".modal-close");
const modalPrev = document.getElementById("modal-prev");
const modalNext = document.getElementById("modal-next");

let currentIndex = 0;
let touchStartX = 0;
let targets = [];
let data = {};

// original.json を読み込んで画像を表示
fetch('signed_urls/original.json')
    .then(res => res.json())
    .then(json => {
        data = json; // グローバル変数に代入

        // 表示対象とする画像のpublic_id（拡張子なし）
        targets = [
            "portfolio_images/original/DearSeraph",
            "portfolio_images/original/ネコザメの卵",
            "portfolio_images/original/饕餮行脚万圣节",
            "portfolio_images/original/桜ねこ",
            "portfolio_images/original/海底撈月",
            "portfolio_images/original/Dilly-dally"
        ];

        // 表示領域のDOM要素を取得
        const container = document.getElementById('original');
        if (!container) {
            console.warn("original の表示エリアが見つかりませんでした");
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
                    const index = targets.indexOf(id);
                    showModal(index);
                });

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


// collab.json を読み込んで画像を表示
fetch('signed_urls/collaboration.json')
    .then(res => res.json())
    .then(json => {
        const collabTargets = [
            "portfolio_images/collaboration/部活動紹介冊子",
        ];

        const collabContainer = document.getElementById('collab');
        if (!collabContainer) {
            console.warn("collab の表示エリアが見つかりませんでした");
            return;
        }

        collabTargets.forEach(id => {
            const item = json[id];

            if (item && item.url) {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = item.title || id.split('/').pop();
                img.loading = "lazy";

                img.addEventListener("click", () => {
                    targets = collabTargets;
                    data = json;
                    const index = targets.indexOf(id);
                    showModal(index);
                });

                collabContainer.appendChild(img);
            }
            else {
                console.warn(`合作画像が見つかりませんでした: ${id}`);
            }
        });
    })
    .catch(err => {
        console.error("collab画像の読み込みに失敗しました:", err);
    });

// モーダルを表示し、画像＋テキスト切り替え
function showModal(index, direction = "right") {
    const id = targets[index];
    const item = data[id];
    if (!item) return;

    const wrapper = document.querySelector(".flip-wrapper");
    const frontImg = document.getElementById("modal-image-current");
    const caption = document.getElementById("modal-caption");

    // キャプション一時非表示
    modal.style.display = "block"; //modal表示
    caption.classList.remove("visible");

    // 初期化
    wrapper.style.transition = 'none';
    wrapper.style.transform = 'rotateY(0deg)';
    frontImg.style.transition = 'none';
    frontImg.style.transform = 'scaleX(1)';
    void wrapper.offsetWidth; // リフローを強制して再描画（transition再適用のため）

    // 回転スタート：元画像で90度まで（半分だけ）
    wrapper.style.transition = 'transform 0.4s ease';
    wrapper.style.transform = direction === "right" ? "rotateY(90deg)" : "rotateY(-90deg)";

    // 90度になったら新画像に切り替え、180度まで回転
    setTimeout(() => {
        frontImg.src = item.url;
        modalTitle.textContent = item.title || "";
        modalDesc.innerHTML = item.description || ""; // innerHTMLにして.json内の改行<br>を認識するようにする

        // アニメーション中だけ反転を適用
        frontImg.style.transition = 'transform 0.4s ease';
        frontImg.style.transform = 'scaleX(-1)';

        // 180度まで継続回転
        wrapper.style.transition = 'transform 0.4s ease';
        wrapper.style.transform = direction === "right" ? "rotateY(180deg)" : "rotateY(-180deg)";
    }, 400);

    // アニメーションを待ってから表画像を更新し、wrapperをリセット
    setTimeout(() => {
        wrapper.style.transition = 'none';
        wrapper.style.transform = "rotateY(0deg)";
        // 画像反転リセット 
        frontImg.style.transition = 'none';
        frontImg.style.transform = 'scaleX(1)';

        caption.classList.add("visible");
        currentIndex = index;
    }, 800);
}

// < >ボタンで画像切り替え、最初と末尾はループ
modalPrev.addEventListener("click", () => {
    const prevIndex = (currentIndex - 1 + targets.length) % targets.length;
    showModal(prevIndex, "left");
});

modalNext.addEventListener("click", () => {
    const nextIndex = (currentIndex + 1) % targets.length;
    showModal(nextIndex, "right");
});

// モバイル向けスワイプ切り替え操作
modal.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
});

modal.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].screenX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            const prevIndex = (currentIndex - 1 + targets.length) % targets.length;
            showModal(prevIndex, "left");
        } else {
            const nextIndex = (currentIndex + 1) % targets.length;
            showModal(nextIndex, "right");
        }
    }
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

// ポケモン背景表示判定
document.addEventListener('DOMContentLoaded', () => {
  const background = document.querySelector('.pokemon-background-global');
  const pokemonSection = document.querySelector('.pokemon-section'); // classで取得

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        background.classList.add('visible');
      } else {
        background.classList.remove('visible');
      }
    });
  }, {
    root: null,
    threshold: 0.3  // ~%以上表示されたら可視とみなす
  });

  if (pokemonSection) {
    observer.observe(pokemonSection);
  }
});

// 二次創作
fetch('signed_urls/fanart.json')
    .then(res => res.json())
    .then(json => {
        const allEntries = Object.entries(json);

        // 背景画像（200枚）
        const backgroundImages = allEntries.filter(([id]) =>
            id.includes('/fanart/Pokemon_background/')
        ).slice(0, 200);

        const backgroundGrid = document.getElementById('pokemon-background-grid');

        let bgIndex = 0;
        const scrollDuration = 50000; // 50,000秒

        // タイルグループ生成関数
        function createTileGroup(images) {
            const tileGroup = document.createElement('div');
            tileGroup.className = 'tile-group';

            images.forEach(([id, item]) => {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = item.title || "";
                img.loading = "lazy";
                tileGroup.appendChild(img);
            });

            return tileGroup;
        }

        // 次の画像グループ取得（120枚）
        const groupSize = 120;
        function getNextImageSlice() {
            const slice = backgroundImages.slice(bgIndex, bgIndex + groupSize);
            bgIndex = (bgIndex + groupSize) % backgroundImages.length;
            return slice.length < groupSize
                ? slice.concat(backgroundImages.slice(0, groupSize - slice.length))
                : slice;
        }

        // 初期2グループ配置
        backgroundGrid.appendChild(createTileGroup(getNextImageSlice()));
        backgroundGrid.appendChild(createTileGroup(getNextImageSlice()));

        function shiftAndLoop(duration) {
            // アニメーション後に最初の tile-group を消して、最後に追加して滑らかにつなぐ
            const firstGroup = backgroundGrid.firstElementChild;
            const newGroup = createTileGroup(getNextImageSlice());

            backgroundGrid.appendChild(newGroup);
            backgroundGrid.removeChild(firstGroup);

            // リセットトリガー用にアニメーションを強制再適用（CSS以外でスクロールするなら不要）
            backgroundGrid.style.transition = 'none';
            backgroundGrid.style.transform = 'translateX(0)';
            void backgroundGrid.offsetWidth;

            backgroundGrid.style.transition = `transform ${duration}ms linear`;
            backgroundGrid.style.transform = 'translateX(-50%)';
        }

        // 初回スクロール開始
        backgroundGrid.style.transition = `transform ${scrollDuration}ms linear`;
        backgroundGrid.style.transform = 'translateX(-50%)';

        // ループでスクロールと更新を続ける
        setInterval(() => {
            shiftAndLoop(scrollDuration);
        }, scrollDuration);

        // 以下は前景画像の処理（Pokemon, King'sRaid, その他）
        const overlay = document.getElementById('pokemon-overlay');
        const kingsContainer = document.getElementById('kingsraid');
        const otherContainer = document.getElementById('otherfanart');

        // 前面：Pokemon フォルダのみ
        const pokemonImages = allEntries.filter(([id]) =>
            id.includes('/fanart/Pokemon/')
        );

        // King's Raid は public_id で判定
        const kingsraid = allEntries.filter(([id]) =>
            id.includes("King'sRaid_")
        );

        // その他
        const others = allEntries.filter(([id, item]) =>
            !backgroundImages.some(([bgId]) => bgId === id) &&
            !pokemonImages.some(([fgId]) => fgId === id) &&
            !id.includes("King'sRaid_")
        );

        // 前景画像表示処理
        const displayGroup = (entries, container) => {
            const groupTargets = entries.map(([id]) => id);
            entries.forEach(([id, item]) => {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = item.title || id.split('/').pop();
                img.loading = "lazy";

                img.addEventListener("click", () => {
                    targets = groupTargets;
                    data = json;
                    currentIndex = targets.indexOf(id);
                    showModal(currentIndex);
                });

                container.appendChild(img);
            });
        };

        displayGroup(pokemonImages, overlay);
        displayGroup(kingsraid, kingsContainer);
        displayGroup(others, otherContainer);
    })
    .catch(err => {
        console.error("fanart画像の読み込みに失敗しました:", err);
    });