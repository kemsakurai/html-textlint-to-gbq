# html-textlint-to-gbq                

指定したURLのHTMLに対して textlint によるチェックを実施し、       
結果を SQLite に保存、保存した結果をGoogle BigQuery に登録するツールです。     

------------------------
## 使い方                

* git clone
```console
git clone https://github.com/kemsakurai/html-textlint-to-gbq.git
```

* ディレクトリ移動
```console
cd html-textlint-to-gbq/
```

* インストール    
```console
npm install
```

* ローカルデータベースの初期化   
```console
node cli.js init
```
```console
Executing (default): DROP TABLE IF EXISTS `sitemaps`;
Executing (default): DROP TABLE IF EXISTS `textlint_messages`;
Executing (default): CREATE TABLE IF NOT EXISTS `sitemaps` (`loc` VARCHAR(255) PRIMARY KEY, `domain` VARCHAR(255), `path` VARCHAR(255), `lastmod` DATETIME, `status` TEXT, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
Executing (default): CREATE TABLE IF NOT EXISTS `textlint_messages` (`loc` VARCHAR(255) NOT NULL, `type` VARCHAR(255) NOT NULL, `ruleId` VARCHAR(255) NOT NULL, `message` VARCHAR(255), `data` TEXT, `line` INTEGER, `column` INTEGER, `index` INTEGER NOT NULL, `severity` INTEGER, `fix_text` VARCHAR(255), `fix_range_start` INTEGER, `fix_range_end` INTEGER, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`loc`, `type`, `ruleId`, `index`));
Executing (default): PRAGMA INDEX_LIST(`sitemaps`)
Executing (default): PRAGMA INDEX_LIST(`textlint_messages`)
Executing (default): PRAGMA INDEX_INFO(`sqlite_autoindex_sitemaps_1`)
Executing (default): PRAGMA INDEX_INFO(`sqlite_autoindex_textlint_messages_1`)
Executing (default): CREATE INDEX `textlint_messages_loc` ON `textlint_messages` (`loc`)
```

----------------
## ツールの実行      

ツールには以下、コマンドを定義しています。    
```console
Usage: cli [options] [command]

Options:
  -h, --help                                                     display help for command

Commands:
  init                                                           Initialize a sqlite database.
  saveSitemap <url>                                              Save Sitemap specified by argument to database.
  htmlLintFromSitemap                                            Lint HTML from saved sitemap's data.
  htmlLintFromUrl <url>                                          Lint HTML specified by argument.
  dumpHtmlLintMessages                                           Dump json HTML lint messages.
  uploadDataToGcs [options] <bucketName>                         Upload HTML lint messages json to Google CLoud Storage.
  loadDataToGbq <bucketName> <filename>> <datasetId>> <tableId>  Load HTML lint messages json to Google BigQuery.
  help [command]                                                 display help for command
```

### 前提     

1. Google Big Query と、Google Cloud Storage を使用可能な状態にして、
Google Big Query の データソース、Google Cloud Storageのバケットを作成しておく必要があります。       
 
2. Google Big Queryにテーブル作成の権限を持つサービスアカウントとサービス アカウントキーが必要です。      

3. Google Cloud Storage にファイルアップロード権限を持つサービスアカウントとサービス アカウントキーが必要です。   

----    
### 実行順序　　　　

1. サイトマップの URL の記録     
```console
node cli.js saveSitemap https://www.monotalk.xyz/sitemap.xml
```

2. 記録した URL に対して、textlint を実行         
```console
node cli.js htmlLintFromSitemap
```

3. textlint の実行結果を、NEWLINE_DELIMITED_JSON 形式で取得  
```console
node cli.js dumpHtmlLintMessages
```

4. NEWLINE_DELIMITED_JSON 形式で取得したデータを Google Cloud Storage にアップロード     
```console
node cli.js uploadDataToGcs monotalk.appspot.com \
-- -d "Document Statistics/textlint_messages.json"
```

5. Google Cloud Storage のデータを Goolge Big Query にロードする          
```console
npm start loadDataToGbq monotalk.appspot.com \
"Document Statistics/textlint_messages.json" \
Document_Statistics textlint_messages
```

