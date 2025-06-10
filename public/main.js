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
                img.classList.add('hover-zoom');
                img.src = item.url;
                img.alt = item.title || id.split('/').pop(); // ファイル名だけaltに設定
                img.loading = "lazy"; // 必要に応じてlazy属性付与

                img.addEventListener("click", () => {
                    const index = targets.indexOf(id);
                    showModal(index, "right", targets, data);
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
                img.classList.add('hover-zoom');
                img.src = item.url;
                img.alt = item.title || id.split('/').pop();
                img.loading = "lazy";

                img.addEventListener("click", () => {
                    const index = collabTargets.indexOf(id);
                    showModal(index, "right", collabTargets, json);
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

// モーダル用現在のセクション保持変数
let currentTargets = [];
let currentData = {};

// モーダルを表示し、画像＋テキスト切り替え
function showModal(index, direction = "right", activeTargets = targets, activeData = data) {
    // 現在の表示対象を記録
    currentTargets = activeTargets;
    currentData = activeData;

    const id = activeTargets[index];
    const item = activeData[id];

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
    const prevIndex = (currentIndex - 1 + currentTargets.length) % currentTargets.length;
    showModal(prevIndex, "left", currentTargets, currentData);
});

modalNext.addEventListener("click", () => {
    const nextIndex = (currentIndex + 1) % currentTargets.length;
    showModal(nextIndex, "right", currentTargets, currentData);
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
            const prevIndex = (currentIndex - 1 + currentTargets.length) % currentTargets.length;
            showModal(prevIndex, "left", currentTargets, currentData);
        } else {
            const nextIndex = (currentIndex + 1) % currentTargets.length;
            showModal(nextIndex, "right", currentTargets, currentData);
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


// タイルグループ生成関数
function createTileGroup(images) {
    const tileGroup = document.createElement('div');
    tileGroup.className = 'tile-group';

    images.forEach(([id, item]) => {
        const img = document.createElement('img');
        img.classList.add('hover-zoom');
        img.src = item.url;
        img.alt = item.title || "";
        tileGroup.appendChild(img);
    });
    return tileGroup;
}

const scrollDuration = 50000; // 50,000秒ごとにループ
// ポケモン背景表示判定
document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.pokemon-background-global');
    const pokemonSection = document.querySelector('.pokemon-section'); // classで取得

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                background.classList.add('visible');

                // 表示領域ならアニメーション再開
                if (!animationTimer) {
                    animationTimer = setInterval(() => {
                        shiftAndLoop(scrollDuration);
                    }, scrollDuration);
                }
            } else {
                background.classList.remove('visible');

                // アニメーション停止
                if (animationTimer) {
                    clearInterval(animationTimer);
                    animationTimer = null;
                }
            }
        });
    }, {
        root: null,
        threshold: 0.2
    });

    if (pokemonSection) {
        observer.observe(pokemonSection);
    }
});

const groupSize = 120;
let bgIndex = 0;
let backgroundGrid;
let backgroundImages = [];
let isBackgroundInitialized = false;
let animationTimer = null;

// 初回のみ背景画像の初期化処理
const initPokemonBackground = () => {
    if (isBackgroundInitialized) return;
    isBackgroundInitialized = true;

    backgroundGrid = document.getElementById('pokemon-background-grid');

    // 背景画像初期2グループ生成
    backgroundGrid.appendChild(createTileGroup(getNextImageSlice()));
    backgroundGrid.appendChild(createTileGroup(getNextImageSlice()));

    // 初回スクロール開始
    backgroundGrid.style.transition = `transform ${scrollDuration}ms linear`;
    backgroundGrid.style.transform = 'translateX(-50%)';

    // ループアニメーション
    animationTimer = setInterval(() => {
        shiftAndLoop(scrollDuration);
    }, scrollDuration);
};

// 次の画像グループ取得（groupSize枚）
function getNextImageSlice() {
    const slice = backgroundImages.slice(bgIndex, bgIndex + groupSize);
    bgIndex = (bgIndex + groupSize) % backgroundImages.length;
    return slice.length < groupSize
        ? slice.concat(backgroundImages.slice(0, groupSize - slice.length))
        : slice;
}

function shiftAndLoop(duration) {
    // アニメーション後に最初の tile-group を消して、最後に追加して滑らかにつなぐ
    const firstGroup = backgroundGrid.firstElementChild;
    if (!firstGroup) return;

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

// 二次創作
fetch('signed_urls/fanart.json')
    .then(res => res.json())
    .then(json => {
        const allEntries = Object.entries(json);

        // 背景画像（200枚）
        backgroundImages = allEntries.filter(([id]) =>
            id.includes('/fanart/Pokemon_background/')
        ).slice(0, 200);


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
                img.classList.add('hover-zoom');
                img.src = item.url;
                img.alt = item.title || id.split('/').pop();
                img.loading = "lazy";

                img.addEventListener("click", () => {
                    const index = groupTargets.indexOf(id);
                    showModal(index, "right", groupTargets, json);
                });

                container.appendChild(img);
            });
        };

        displayGroup(pokemonImages, overlay);
        displayGroup(kingsraid, kingsContainer);
        displayGroup(others, otherContainer);

        // 背景画像の初期化（すでに backgroundImages は設定済み）
        initPokemonBackground();
        document.querySelector('.pokemon-background-global').classList.add('visible');
    })
    .catch(err => {
        console.error("fanart画像の読み込みに失敗しました:", err);
    });

// モバイル端末の場合カーソル処理切り替え
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// カーソル本体（PCのみ表示）
const cursorRing = document.createElement('div');
cursorRing.classList.add('cursor-ring');
if (!isTouchDevice) {
    document.body.appendChild(cursorRing);
}

// カーソル位置追従
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    if (!isTouchDevice) {
        cursorRing.style.left = `${cursorX}px`;
        cursorRing.style.top = `${cursorY}px`;
    }
});

document.addEventListener('touchstart', e => {
    cursorX = e.touches[0].clientX;
    cursorY = e.touches[0].clientY;
});

// 波紋エフェクト
document.addEventListener('mousedown', () => {
    if (!isTouchDevice) showRipples();
});
document.addEventListener('touchstart', () => {
    showRipples();
});

function showRipples() {
    for (let i = 0; i < 2; i++) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        ripple.style.left = `${cursorX}px`;
        ripple.style.top = `${cursorY}px`;
        ripple.style.animationDelay = `${i * 0.2}s`;
        document.body.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }
}

// 三角パーティクル表示（PC：常時、モバイル：タップ中のみ）
let allowParticles = !isTouchDevice;
if (isTouchDevice) {
    document.addEventListener('touchstart', () => {
        allowParticles = true;
        setTimeout(() => {
            allowParticles = false;
        }, 300); // タップ直後0.3秒だけ表示
    });
}

// 三角パーティクルをランダム方向に散らす
setInterval(() => {
    if (!allowParticles) return;

    const particle = document.createElement('div');
    particle.classList.add('particle');
    const angle = Math.random() * 360;
    const offsetX = Math.cos(angle) * 15;
    const offsetY = Math.sin(angle) * 15;

    particle.style.left = `${cursorX + offsetX}px`;
    particle.style.top = `${cursorY + offsetY}px`;
    particle.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;

    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
}, 150); // 100msごとでパーティクルを発生