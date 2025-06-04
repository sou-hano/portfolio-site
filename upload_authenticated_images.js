//const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cloudinary = require('cloudinary').v2;

// Cloudinary設定
cloudinary.config({
  cloud_name: 'dihjz2opk',
  api_key: '431651465559666',
  api_secret: 'tTjVKEUOdBeW8Nt_t2UGThyP6LM'
});

// コマンドライン引数からフォルダパスとCloudinaryフォルダ名を取得
const inputDir = process.argv[2];
const targetFolder = process.argv[3];

if (!inputDir)
{
  console.error('画像フォルダパスを指定してください: node upload_authenticated_images.js <画像フォルダパス> <Cloudinaryフォルダ名>');
  process.exit(1);
}
const folderPath = path.resolve(inputDir);

// 対象画像ファイル（.png）のリスト取得
const files = glob.sync(`${folderPath}/*.png`);
if (files.length === 0)
{
  console.log('指定フォルダ内に .png ファイルが見つかりませんでした。');
  process.exit(1);
}

console.log(`アップロード対象: ${files.length}枚\n`);
console.log(`Cloudinaryフォルダ: ${targetFolder}\n`);

// 各ファイルをauthenticated typeでアップロード
files.forEach(filePath => {
  const fileName = path.basename(filePath, '.png'); // 拡張子を除いたファイル名

  cloudinary.uploader.upload(filePath, {
    public_id: fileName,
    type: 'authenticated',
    folder: targetFolder
  })
  .then(result => {
    console.log(`アップロード成功: ${result.public_id}`);
  })
  .catch(error => {
    console.error(`アップロード失敗 (${fileName}):`, error.message);
  });
});