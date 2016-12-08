var port = 8282;

var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(port, function(){
  console.log("Server running on " + port);
})