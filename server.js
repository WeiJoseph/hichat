var http=require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var io=require("socket.io").listen(server);
var users = [];
app.use("/",express.static(__dirname+"/www"));
server.listen(8080);
console.log("server startde on localhost:8080...");
io.on('connection', function(socket) {
    socket.on('login', function(data) {
        if(users.indexOf(data) > -1){
			socket.emit("nickExisted");
		}else{
			socket.userIndex = users.length;
			socket.nickname = data;
			users.push(data);
			socket.emit("loginSuccess");
			io.sockets.emit("system",data,users.length,"login");
		}
    });
	socket.on("disconnect",function(){
		users.splice(socket.userIndex,1);
		socket.broadcast.emit("system",socket.nickname,users.length,"logout");
	});
	socket.on("postMsg",function(msg){
		socket.broadcast.emit("newMsg",socket.nickname,msg);
	});
	socket.on("img",function(msg){
		socket.broadcast.emit("newImg",socket.nickname,msg);
	})
});