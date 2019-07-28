// 配置参数
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// 连接数据库
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  console.log("数据库已创建!");
  db.close();
});

// 插入数据
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("bili");
    var myobj = { name: "菜鸟教程", url: "www.runoob" };

    dbo.collection("videoMsg").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("文档插入成功");
        db.close();
    });
});