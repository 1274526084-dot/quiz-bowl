// 教师电脑运行: node server.js
// 然后在浏览器打开 http://你的IP:3000/display 投屏
// 学生手机打开 http://你的IP:3000 做题
var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');

var PORT = 3000;
var students = [];

// 找本机局域网IP
function getIP() {
  var ifaces = os.networkInterfaces();
  for (var key in ifaces) {
    for (var i = 0; i < ifaces[key].length; i++) {
      var addr = ifaces[key][i];
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return '127.0.0.1';
}

var HOST = getIP();

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
        // 同名覆盖
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
  console.log('');
  console.log('========================================');
  console.log('  Task 4 听力任务 · 本地服务器');
  console.log('========================================');
  console.log('');
  console.log('  学生做题: http://' + HOST + ':' + PORT);
  console.log('  教师大屏: http://' + HOST + ':' + PORT + '/display');
  console.log('');
  console.log('  按 Ctrl+C 停止');
  console.log('========================================');
});
