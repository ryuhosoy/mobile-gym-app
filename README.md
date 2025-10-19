# 🏋️ ジム検索アプリ

現在地周辺のジムを検索し、レビューを共有できるモバイルアプリケーションです。React NativeとExpoで構築され、リアルタイムの位置情報ベース検索、ユーザーレビュー、チャット機能を搭載しています。

## 📲 ダウンロード

**🎉 App Store で配信中！**

App Storeで「**ジム検索アプリ**」と検索するとインストールいただけます。

または下記のリンクから直接ダウンロード：
- 🍎 [App Storeでダウンロード](https://apps.apple.com/app/ジム検索アプリ/id6752111509) 
  <!-- リリース後にApp Store URLに置き換えてください -->

> **Note**: 現在iOS版のみ提供しています。Android版は準備中です。

## 📸 スクリーンショット

<!-- アプリのスクリーンショットをここに追加 -->
<!-- 例: -->
<!-- ![ホーム画面](./screenshots/home.png) -->
<!-- ![ジム検索](./screenshots/search.png) -->
<!-- ![ジム詳細](./screenshots/detail.png) -->
<!-- ![レビュー](./screenshots/reviews.png) -->

## 📱 主な機能

### コア機能
- **🔍 ジム検索**: Google Places APIを使用して現在地周辺のジムを検索
- **🗺️ マップ表示**: インタラクティブな地図上でジムの位置を可視化
- **⭐ レビューシステム**: ジムのレビューの閲覧と投稿
- **💬 チャットルーム**: ジム専用チャットルームの作成と参加
- **📍 位置情報ベース**: 自動距離計算とソート機能
- **🔐 ユーザー認証**: Firebaseによる安全なアカウント作成と管理

### ユーザーエクスペリエンス
- **ログイン不要**: アカウント作成なしでジムの閲覧が可能（App Store Guideline 5.1.1準拠）
- **アカウント機能**: レビュー、チャット、プロフィール管理のみログインが必要
- **アカウント削除**: 完全なアカウントとデータの削除機能（GDPR準拠）
- **フィルタリング＆ソート**: 評価、レビュー数、営業時間、24時間営業でフィルタリング
- **日本語UI**: 完全日本語対応

## 🛠️ 技術スタック

### フロントエンド
- **React Native** (0.81.4) - クロスプラットフォームモバイル開発
- **Expo** (54.0.13) - 開発プラットフォームとビルドツール
- **Expo Router** - ファイルベースナビゲーション
- **TypeScript** - 型安全な開発

### UI & アニメーション
- **React Native Maps** - インタラクティブマップビュー
- **React Native Reanimated** - スムーズなアニメーション
- **@expo/vector-icons** - アイコンライブラリ
- **React Navigation** - ナビゲーションフレームワーク

### バックエンド & サービス
- **Firebase Authentication** - ユーザー認証
- **Firebase Realtime Database** - リアルタイムデータ同期
- **Google Places API** - ジムの位置情報と詳細
- **Google Distance Matrix API** - 距離と移動時間の計算

### 状態管理
- **React Context API** - 位置情報コンテキスト管理
- **React Hooks** - コンポーネント状態管理

## 📋 必要な環境

以下がインストールされていることを確認してください：
- Node.js (v16以降)
- npm または yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) または Android Emulator
- 実機用のExpo Goアプリ（オプション）

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/gym-app.git
cd gym-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

ルートディレクトリに`.env`ファイルを作成：

```env
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=あなたのGoogle Places APIキー
EXPO_PUBLIC_FIREBASE_API_KEY=あなたのFirebase APIキー
```

**必要なAPIキー:**
- **Google Places APIキー**: [Google Cloud Console](https://console.cloud.google.com/)から取得
  - 有効化が必要: Places API, Distance Matrix API, Maps SDK
- **Firebase設定**: [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
  - 有効化が必要: Authentication（メール/パスワード）、Realtime Database

### 4. Firebaseの設定

`app/config/firebase.ts`をFirebaseプロジェクトの設定で更新：

```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
};
```

### 5. アプリケーションの起動

```bash
# 開発サーバーの起動
npm start

# iOSシミュレーターで実行
npm run ios

# Androidエミュレーターで実行
npm run android
```

## 📁 プロジェクト構造

```
gym-app/
├── app/
│   ├── (tabs)/              # タブナビゲーション画面
│   │   ├── home.tsx         # ホーム画面（ジムカテゴリー）
│   │   ├── gymSearch.tsx    # ジム検索とフィルタリング
│   │   ├── profile.tsx      # ユーザープロフィール管理
│   │   └── messages.tsx     # チャットルーム一覧
│   ├── auth/
│   │   ├── login.tsx        # ログイン/サインアップ画面
│   │   └── LogoutButton.tsx # ログアウトコンポーネント
│   ├── chat/
│   │   └── [id].tsx         # チャットルーム詳細
│   ├── gym/
│   │   └── [id].tsx         # ジム詳細ページ
│   ├── components/          # 再利用可能なコンポーネント
│   ├── contexts/            # Reactコンテキスト
│   ├── config/              # 設定ファイル
│   └── types/               # TypeScript型定義
├── assets/                  # 画像とフォント
├── app.json                 # Expo設定
├── package.json             # 依存関係
└── README.md               # このファイル
```

## 🎯 主要機能の実装

### 1. 位置情報ベース検索
`expo-location`を使用してユーザーの現在位置を取得し、Haversine公式を使用して近くのジムまでの距離を計算します。

### 2. Google Places統合
- **周辺検索**: 指定半径内のジムを検索
- **テキスト検索**: ジム名や場所で検索
- **詳細情報**: 営業時間、評価、写真などの詳細情報を取得

### 3. Firebase Realtime Databaseの構造
```
{
  "users": {
    "userId": {
      "name": "ユーザー名",
      "email": "user@example.com",
      "gender": "男性",
      // ... その他のプロフィールデータ
    }
  },
  "reviews": {
    "placeId": {
      "reviewId": {
        "userId": "userId",
        "rating": 5,
        "comment": "素晴らしいジムです！",
        "timestamp": 1234567890
      }
    }
  },
  "chats": {
    "roomId": {
      "gymId": "placeId",
      "gymName": "ジム名",
      "lastMessage": "こんにちは",
      "lastMessageTime": 1234567890
    }
  },
  "messages": {
    "roomId": {
      "messageId": {
        "text": "こんにちは",
        "senderId": "userId",
        "timestamp": 1234567890
      }
    }
  }
}
```

### 4. App Storeガイドライン準拠
- ✅ **5.1.1 - プライバシー**: ログインなしでコア機能にアクセス可能
- ✅ **5.1.1(v) - アカウント削除**: 完全なアカウント削除機能を実装
- ✅ **2.1 - パフォーマンス**: 適切なエラーハンドリングとクラッシュ防止

## 🔧 開発

### テストの実行

```bash
npm run lint
```

### 本番用ビルド

#### iOS
```bash
# EAS Buildを使用（推奨）
eas build --platform ios

# ローカルビルド（macOSとXcodeが必要）
expo prebuild
cd ios && pod install
open gym-app.xcworkspace
```

#### Android
```bash
# EAS Buildを使用
eas build --platform android

# ローカルビルド
expo prebuild
cd android && ./gradlew assembleRelease
```

### EAS Buildでの環境変数

EASにシークレットを追加：
```bash
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "あなたのキー"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "あなたのキー"
```

## 📱 App Store情報

### リリース情報
- **アプリ名**: ジム検索アプリ
- **Bundle Identifier**: `com.ryuhosoy.gym-app`
- **現在のバージョン**: `1.0.1`
- **ステータス**: ✅ **配信中**
- **対応OS**: iOS 13.0以降

### App Storeでの検索方法
1. App Storeアプリを開く
2. 検索タブをタップ
3. 「**ジム検索アプリ**」と入力
4. アプリをダウンロード

### 審査通過済みチェックリスト
- [x] Bundle Identifier: `com.ryuhosoy.gym-app`
- [x] プライバシーポリシー（位置情報使用説明）
- [x] アカウント削除機能（Guideline 5.1.1(v)準拠）
- [x] コア機能でのログイン強制なし（Guideline 5.1.1準拠）
- [x] 適切なエラーハンドリング（Guideline 2.1準拠）
- [x] スクリーンショット準備（必要サイズ）
- [x] アプリアイコン（1024x1024）
- [x] App Store審査承認

## 🐛 トラブルシューティング

### よくある問題

**問題: "Native part of Worklets doesn't seem to be initialized"**
```bash
# キャッシュをクリアして再起動
npx expo start --clear
```

**問題: Google Places APIが動作しない**
- `.env`のAPIキーが正しいか確認
- Google Cloud ConsoleでPlaces APIが有効化されているか確認
- Googleクラウドプロジェクトで課金が有効化されているか確認

**問題: Firebase接続エラー**
- `app/config/firebase.ts`の`firebaseConfig`を確認
- Firebase Realtime Databaseのルールが正しく設定されているか確認
- Firebase ConsoleでAuthenticationが有効化されているか確認

**問題: iOSでビルドが失敗する**
```bash
# クリーンして再ビルド
cd ios
pod deintegrate
pod install
cd ..
npx expo prebuild --clean
```

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順に従ってください：

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細はLICENSEファイルを参照してください。

## 👤 作成者

**Ryuho Soy**

- GitHub: [@ryuhosoy](https://github.com/ryuhosoy)
- Email: ryuhosoy@yahoo.co.jp

## 🙏 謝辞

- [Expo](https://expo.dev/) - React Native開発プラットフォーム
- [Firebase](https://firebase.google.com/) - バックエンドサービス
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service) - 位置情報データ
- [React Native Maps](https://github.com/react-native-maps/react-native-maps) - マップコンポーネント

## 📊 プロジェクトステータス

- ✅ 開発: 完了
- ✅ テスト: 完了
- ✅ App Store審査: 承認済み
- 🚀 本番リリース: **配信中**（App Storeで「ジム検索アプリ」で検索）

## 🔮 今後の機能拡張

- [ ] お気に入りジム機能
- [ ] ジム比較機能
- [ ] ワークアウト追跡統合
- [ ] 新着メッセージのプッシュ通知
- [ ] ソーシャル共有機能
- [ ] 多言語サポート（英語、日本語など）
- [ ] ダークモード対応
- [ ] オフラインモード対応

---

React NativeとExpoで❤️を込めて作成
