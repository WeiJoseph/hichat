window.onload = function(){
	var Hichat = new hichat();
	Hichat.init();
	
}
hichat = function(){
	this.socket = null;
}
hichat.prototype = {
	init : function(){
		var that = this;
		this.socket = io.connect();
		this.socket.on("connect",function(){
			$("#info").text("get yourself a nickname :)");
			$("#nickWrapper").css("display","block");
			$("#nicknameInput").focus();
		});
		$("#loginBtn").click(function(){
			var nickname=$("#nicknameInput").val();
			if(nickname.trim().length != 0){
				that.socket.emit("login",nickname);
			}else{
				$("#nicknameInput").focus();
			}
		});
		$("#nicknameInput").keyup(function(e){
			if(e.keyCode == 13){
				$("#loginBtn").click();
			}
			
		})
		this.socket.on("nickExisted",function(){
			$("#info").text("nickname is existed!");
		});
		this.socket.on("loginSuccess",function(){
			$("title").html("hichat | "+$("#nicknameInput").val());
			$("#loginWrapper").css("display","none");
			$('#messageInput').focus();
		});
		this.socket.on("system",function(nickname,userCount,type){
			var msg = nickname + (type == "login" ? " joined" : " left");
			that.newMsg("system",msg,"#44c9c1");
			$("#status").text(userCount + (userCount > 1 ? " users" : " user") + " online");
		});
		$("#sendBtn").click(function(){
			var msg = $("#messageInput").val();
			var color = $("#colorStyle").val();
			$("#messageInput").val("");
			$("#messageInput").focus();
			if(msg.trim().length != 0){
				that.socket.emit("postMsg",msg,color);
				that.newMsg("me",msg,color);
			}
			
		});
		$("#messageInput").keyup(function(e){
			if(e.ctrlKey && e.keyCode == 13){
				$("#sendBtn").click();
			}
			
		});
		this.socket.on("newMsg",function(nickname,msg,color){
			that.newMsg(nickname,msg,color);
		});
		$("#sendImage").change(function(){
			if($(this).prop("files").length != 0){
				var file = $(this).prop("files")[0];
				var reader = new FileReader();
				if(!reader){
					that.newMsg("system","你的浏览器不能读取文件");
					$(this).val("");
					return;
				}
				
				reader.onload = function(e){
					$(this).val("");
					that.socket.emit("img",e.target.result);
					that.newImage("me",e.target.result);
				}
				reader.readAsDataURL(file);
			}
		});
		this.socket.on("newImg",function(user,img){
			that.newImage(user,img);
		});
		that.emoji();
		$("#emoji").click(function(){
			if($("#emojiWrapper").css("display")=="none"){
				$("#emojiWrapper").css("display","block");
			}else{
				$("#emojiWrapper").css("display","none");
			}
			
		});
		$("body").click(function(e){
			var _con = $("#emoji,#emojiWrapper");
			if(!_con.is(e.target) && _con.has(e.target).length == 0 ){
				$("#emojiWrapper").css("display","none");
			}
		});
		$("#emojiWrapper img").click(function(){
			var title=$(this).attr("title");
			$("#messageInput").focus();
			$("#messageInput").val($("#messageInput").val()+"[emoji:"+title+"]");
		});
		$("#clearBtn").click(function(){
			$("#messageInput").val("");
		})
		
	},
	newMsg : function(user,msg,color){
		msg=this.showEmoji(msg);
		var date = new Date().toTimeString().substr(0,8);
		var spantext = user + "<span class='timespan'>("+date+"):</span>"+msg;
		var choseColor = color || "#000"; 
		var ptext = "<p style='color:"+choseColor+"'>"+spantext+"</p>";
		
		$("#historyMsg").append(ptext);
		$("#historyMsg").scrollTop($("#historyMsg")[0].scrollHeight);
	},
	newImage : function(user,src,color){
		var date = new Date().toTimeString().substr(0,8);
		var spantext = user + '<span class="timespan">('+date+'):</span></br><img src="'+src+'" width="200" style="margin:20px">'
		var choseColor = color || "#000"; 
		var ptext = "<p style='color:"+choseColor+"'>"+spantext+"</p>";
		$("#historyMsg").append(ptext);
		$("#historyMsg").scrollTop($("#historyMsg")[0].scrollHeight);
	},
	emoji : function(){
		for(var i=1;i<31;i++){
			var img = '<img src="../content/emoji/'+i+'.gif" title="'+i+'">';
			$("#emojiWrapper").append(img);
		}
	},
	showEmoji : function(msg){
		var reg=/\[emoji:\d+\]/g;
		var str,result=msg;
		var index;
		while(str = reg.exec(msg)){
			index = str[0].slice(7,-1);
			result = result.replace(str[0],'<img class="emoji" src="../content/emoji/'+index+'.gif">')
		}
		
		//console.log(str);
		return result;
	}
}