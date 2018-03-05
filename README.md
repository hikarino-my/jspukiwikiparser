# jspukiwikiparser
TypeScript pukiwiki parser
未完成
pukiwikiのlib/convert_html.phpをJavaScript(TypeScript)に翻訳した
ところどころ機能を削っている
pluginは未実装
phpの可変変数や可変関数はevalで解決してるのでさっさとどうにかする。
convert_html(["-list","*Hello World"," const a = 10;", "hello"])
のように一行ごとに配列にして使用
