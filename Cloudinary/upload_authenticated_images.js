const fs = require('fs');                     // 署名付きURL出力先ファイル操作用モジュール
const path = require('path');
const glob = require('glob');
const cloudinary = require('cloudinary').v2;  // Cloudinary SDK

// Cloudinary設定
cloudinary.config({
  cloud_name: 'dihjz2opk',
  api_key: '431651465559666',
  api_secret: 'tTjVKEUOdBeW8Nt_t2UGThyP6LM'
});

// コマンドライン引数からフォルダパスとCloudinaryフォルダ名を取得
const inputDir = process.argv[2];
const targetFolder = process.argv[3];

if (!inputDir) {
  console.error('画像フォルダパスを指定してください: node upload_authenticated_images.js <画像フォルダパス> <Cloudinaryフォルダ名>');
  process.exit(1);
}
const folderPath = path.resolve(inputDir);

const supportedExts = ['png', 'jpg', 'jpeg', 'webp'];

// .PNG（大文字）を .png にリネーム
// .PNGでもアップロードはできるが、署名付きURLを取得した際にアクセスできなくなる
// サブフォルダを含めて再帰的に捜索：**/*.ext
const upperPngFiles = glob.sync(`${folderPath}/**/*.PNG`);
upperPngFiles.forEach(file => {
  const newPath = file.replace(/\.PNG$/, '.png');
  if (file !== newPath) {
    fs.renameSync(file, newPath);
    console.log(`リネーム: ${path.basename(file)} → ${path.basename(newPath)}`);
  }
});

//  サポート形式の画像だけをアップロード対象に指定（.png, .jpg, .jpeg, .webp）
const uploadedFiles = glob.sync(`${folderPath}/**/*.{png,jpg,jpeg,webp}`);

// 非対応形式のファイルがある場合警告
const allFiles = glob.sync(`${folderPath}/**/*.*`);
const unsupportedFiles = allFiles.filter(f => {
  const ext = path.extname(f).toLowerCase().slice(1);
  return !supportedExts.includes(ext);
});
unsupportedFiles.forEach(f => {
  console.warn(`対応外拡張子: ${path.basename(f)} はスキップされました。`);
});

if (uploadedFiles.length === 0) {
  console.log('アップロード対象の画像が見つかりませんでした。');
  process.exit(1);
}

console.log(`\nアップロード対象: ${uploadedFiles.length} 枚`);
console.log(`Cloudinaryフォルダ: ${targetFolder}\n`);


// 各ファイルをauthenticated typeでアップロード
uploadedFiles.forEach(filePath => {
  const ext = path.extname(filePath);
  const relativePath = path.relative(folderPath, filePath).replace(/\\/g, '/'); // Windowsのファイル階層\を/に強制変換
  const pathWithoutExt = relativePath.replace(ext, '');                         // 拡張子を削除

  const fullParts = pathWithoutExt.split('/');                                  // /で分割 ex) ['animals', 'cat']
  const fileName = fullParts.pop();                                             // 末尾の文字列を取得 'cat'
  const subFolder = fullParts.join('/');                                        // サブフォルダ名の文字列を取得

  const uploadFolder = subFolder ? `${targetFolder}/${subFolder}` : targetFolder;

  cloudinary.uploader.upload(filePath, {
    public_id: fileName,
    type: 'authenticated',
    folder: uploadFolder
  })
    .then(result => {
      console.log(`アップロード成功: ${result.public_id}`);
    })
    .catch(error => {
      console.error(`アップロード失敗 (${relativePublicId}):`, error.message);
    });
});