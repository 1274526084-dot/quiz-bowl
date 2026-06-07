// 部署到 Render.com 即可使用
// 学生做题: https://你的域名/
// 教师大屏: https://你的域名/display
var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = process.env.PORT || 3000;
var students = [];

var server = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // API: 提交成绩
  if (req.method === 'POST' && req.url === '/api/submit') {
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      try {
        var data = JSON.parse(body);
        data.time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
        var idx = students.findIndex(function(s) { return s.name === data.name; });
        if (idx >= 0) students[idx] = data; else students.push(data);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ok:true, count: students.length}));
      } catch(e) {
        res.writeHead(400);
        res.end(JSON.stringify({ok:false, error: e.message}));
      }
    });
    return;
  }

  // API: 获取成绩列表
  if (req.method === 'GET' && req.url === '/api/students') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(students.slice().reverse()));
    return;
  }

  // API: 清除
  if (req.method === 'POST' && req.url === '/api/clear') {
    students = [];
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:true}));
    return;
  }

  // /display 重定向为显示模式
  if (req.url === '/display' || req.url === '/display/') {
    res.writeHead(302, {'Location':'/?display'});
    res.end();
    return;
  }

  // 静态文件
  var filePath = req.url === '/' || req.url === '/?display' ? '/task4-listening.html' : req.url;
  filePath = path.join(__dirname, filePath.split('?')[0]);

  var extMap = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.wav':'audio/wav','.json':'application/json'};
  var ext = path.extname(filePath);

  fs.readFile(filePath, function(err, data) {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, {'Content-Type': extMap[ext] || 'text/plain'});
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', function() {
  console.log('Task 4 Listening server running on port ' + PORT);
});
