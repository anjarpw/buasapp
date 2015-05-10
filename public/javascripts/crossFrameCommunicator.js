var FunctionDictionary=function(){
	return {
		dictionary:[],
		set:function(key,func){
			this.dictionary[key]=func;
		},
		get:function(key){
			return this.dictionary[key];
		}
	};
};
var MessageBasedSender=function(){
	return {
		toMessage:function(methodName,args){
			return {
				methodName:methodName,
				args:args
			}
		},
		sendMessage:function(message,callback){

		},
		invoke : function(methodName, args, callback){
			var message=this.toMessage(methodName,args);
			this.sendMessage(message,callback);
		}
	};
};
var MessageBasedReceiver=function(){
	return {
		functionDictionary:FunctionDictionary(),
		setHandler:function(methodName, handler){
			this.functionDictionary.set(methodName,handler);		
		},
		handle:function(methodName, args,evt){
			var func=this.functionDictionary.get(methodName);
			if(func){
				return func(args,evt);
			}
			return null;
		},
		onMessageReceived:function(evt){
			var message=this.messageExtractor(evt);
			if(!message){
				return;
			}
			var returnValue=this.handle(message.methodName,message.args,evt);
			if(returnValue){
				this.replyMessage(evt,returnValue);
			}
		},
		messageExtractor:function(evt){

		},
		replyMessage:function(evt,returnValue){

		}
	};
};


var CrossFrameSender=function(currentWindow,targetWindow,targetUrl){
	var sender=new MessageBasedSender();
	sender.targetWindow=targetWindow;
	sender.targetUrl=targetUrl;
	sender.currentWindow=currentWindow;
	sender.requestCallbackDictionary = FunctionDictionary();
	

	sender.currentWindow.addEventListener('message',function(evt){
		var callback=sender.requestCallbackDictionary.get(event.data.requestId);
		if(callback){
			callback(event.data.returnValue);
		}
	});	
	sender.requestIdCount=0;
	sender.sendMessage = function(message, callback){
		this.requestIdCount++;
		message.requestId=this.requestIdCount;
		this.requestCallbackDictionary.set(this.requestIdCount,callback);
		this.targetWindow.postMessage(message,this.targetUrl);		
	};

	return sender;
};
var CrossFrameReceiver=function(currentWindow){
	var receiver=new MessageBasedReceiver();
	receiver.currentWindow=currentWindow;
	receiver.messageExtractor=function(evt){
		var methodName=evt.data.methodName;
		var args=evt.data.args;
		return {
			methodName:methodName,
			args:args
		};
	};
	receiver.replyMessage=function(evt,returnValue){
		evt.source.postMessage({
			isCallback:true,
			returnValue:returnValue,
			requestId:evt.data.requestId
		},evt.origin);
	};
	receiver.currentWindow.addEventListener('message',function(evt){
		receiver.onMessageReceived(evt);
	});	
	return receiver;
};
