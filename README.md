# trilece

C#のコードを入力するとIL2CPPの出力を表示してくれる。
Unityのプロジェクトを作ってコンパイルしていて、出力には早くても1分くらいかかる。

macでしか動かない。

# 準備

README.mdと同じ階層に `.env` というファイルを作って、以下のようにUnityのパスを書く必要がある。
代わりに `UNITY_PATH` という環境変数を作っても良い。

```
UNITY_PATH=/Applications/Unity/Hub/Editor/2020.3.26f1/Unity.app/
```

# スクショ

<img width="1680" alt="image" src="https://user-images.githubusercontent.com/4084715/160612877-e19c6beb-1723-45ef-9278-3c36a46150d9.png">

