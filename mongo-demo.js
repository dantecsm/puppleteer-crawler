// 配置参数
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// 连接数据库
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  console.log("mongoDB 数据库已连接!");
  db.close();
});

// 插入数据
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("bili");
    var myobj = { name: "xxxx", url: "yyyy" };

    dbo.collection("videoMsg").insertOne(myobj, function(err, res) {
        if (err) throw err;
        db.close();
    });
});