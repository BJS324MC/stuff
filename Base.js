// Created By Boay.JS
var users,db,usRf,nRf,nObj,num=0,movespd=2,isTouching=true,maxDis=55,FD=20,messages=[],msgRf,lastnum, usernames=["barmpot","bumps","weirdo","striving","booger","journals","geezer","pie","flairhead","crunchy","pish","discovery","nerfhearder","dauphine","idiotlucy","witch","grinding","cheatersplashing","fannybinking","divvyunderline","poxclient","nobody","asbestos","oinker","agency","lardas","sinning","blighter","augustus","codge","raldus","dingleberry","renter","ninny","transform","flanges","cunken","redneck","advertising","biddy","folksong","dufus","droning","fink","titch","dumbo","hesitation","dweeb","muffin","pillock","bangham","gorilla","auriga","ruffian","winter","mutant","grettle","geek","sediment","dingaling","greenhouse","tosser","freemason","alcoholic","yoyo","pansy","swampland","shyster","oval","meatheadro","tisserie","gasbag","football","junkie","dough","psycho","langered","nerd","device","wuss","accountant","swine","frumpy","poop","juggle","jerk","church","chill","muppet","engaged","loudmouth","raffle","scabrival","fardage","homer","banana","head"],
	tuX=(window.innerWidth*4)/5,tX=tuX,
	tuY=(window.innerHeight*4)/5,tY=tuY,
	canvas,joyvas,ctx,cx;
const arrrand=arr=>arr[Math.floor(Math.random()*arr.length-1)+1]+arr[Math.floor(Math.random()*arr.length-1)+1],randnum=(s=0,e=2)=>Math.floor(Math.random()*e)+s,randrgb=()=>`rgb(${randnum(0,254)},${randnum(0,254)},${randnum(0,254)})`;
var player = {
	name:arrrand(usernames),
	color:randrgb(),
	speed:0,
	toX:0,
	toY:0,
	x:Math.random()*(window.innerWidth+20)-40,
	y:Math.random()*(window.innerHeight+20)-40
};
Object.values=obj=>{
	let arr=[];
	for(let i in obj)arr.push(obj[i]);
	return arr;
};
const message=(msg,key)=>{
	if(key.key=='Enter' && msg.replace(/ /g,'')!=''){
		msgRf.once("value").then(snap=>{
			if(snap.val()){
				msgRf.update({[Object.keys(snap.val()).length]:{[player.name]:msg}});
			}else{
				msgRf.update({0:{[player.name]:msg}})
			};
		});
		document.getElementById('message').value="";
		document.getElementById('message').blur();
		joyvas.focus();
	};
};
const readUser = (U,x,p=null) => {
	for(let n=0;n<U.length;n++) if(U[n]){
		if(U[n][x]==undefined){
			return `${p} cannot be found.`;
		}else if(p==null){
			return U[n][x];
		};
		return U[n][x][p];
		};
};
const draw = (obj) => {
	ctx.beginPath();
	ctx.arc(obj.x,obj.y,obj.diameter,0,Math.PI*2);
	ctx.fillStyle=obj.color ? obj.color:'#999999';
	ctx.fill();
	ctx.font="20px Open Sans Condensed";
	ctx.textAlign="center";
	ctx.fillText(obj.name,obj.x,obj.y+25);
};
const ui = () => {
	cx.clearRect(0,0,window.innerWidth,window.innerHeight);
	cx.beginPath();
	cx.fillStyle='rgb(233,233,233)';
	cx.arc(tuX,tuY,50,0,Math.PI*2);
	cx.fill();
	cx.beginPath();
	cx.fillStyle='#dddddd';
	cx.arc(tX,tY,25,0,Math.PI*2);
	cx.fill();
	cx.font="20px Open Sans Condensed";
	cx.fillStyle="black";
	for(let n in messages)cx.fillText(`${Object.keys(messages[n])[0]}: ${Object.values(messages[n])[0]}`,joyvas.width/100,joyvas.height-((messages.length-1-n)*30)-50);
};
const initApp = () => {
	const config = {
		apiKey: "AIzaSyBU6t9PHhDlLa9Sr5_LI7d4Z_7rs2oy2KE",
		authDomain: "autopoint-0123.firebaseapp.com",
		databaseURL: "https://autopoint-0123.firebaseio.com",
		projectId: "autopoint-0123",
		storageBucket: "autopoint-0123.appspot.com",
		messagingSenderId: "215752019180",
		appId: "1:215752019180:web:1bac07cd614dda2b1629c9",
		measurementId: "G-CTNB45FKT2"
	};
	firebase.initializeApp(config);
	firebase.database.INTERNAL.forceWebSockets();
	db = firebase.database();
	usRf = db.ref('users');
	msgRf=db.ref("messages");
	startController();
	canvas=document.getElementById('c1');
	joyvas=document.getElementById('c2');
	ctx=canvas.getContext('2d');
	cx=joyvas.getContext('2d');
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	joyvas.width=window.innerWidth;
	joyvas.height=window.innerHeight;
	setInterval(ui,0);
	pRf=usRf.push();
	pRf.set({
		name:player.name,
		color:player.color,
		diameter:10,
		x:player.x,
		y:player.y
	}).then(()=>{
	player.key=pRf.key;player.move=()=>{player.x+=player.toX*5;player.y-=player.toY*5;usRf.child(player.key).update({x:player.x,y:player.y});};setInterval(()=>player.move(),FD)}).catch(err=>console.log(err));
	usRf.on('value',qsnap=>{
		ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
		for(let OBJ of Object.values(qsnap.val())){
			draw(OBJ);
		};
    });
	msgRf.once('value').then(msgsnap=>lastnum=msgsnap.val() ? Object.keys(msgsnap.val()).length-1:-1);
	msgRf.on('value',msgsnap=>{
		messages=[];
		if(msgsnap.val())for(let i of Object.keys(msgsnap.val()))if(i>lastnum)messages.push(msgsnap.val()[i]);
    });
	window.addEventListener('unload',()=>usRf.child(player.key).remove());
};
const CONTROLS = new Map([['w',1],['d',10],['s',-1],['a',-10],['arrowup',1],['arrowright',10],['arrowdown',-1],['arrowleft',-10]]);
class Controller{
	static presskey(pressedKey){
		if(CONTROLS.has(pressedKey.key.toLowerCase())){
			let C = CONTROLS.get(pressedKey.key.toLowerCase());
			if(Math.abs(C)/10==1){player.toX=C/10}else{player.toY=C};
			player.speed=movespd;
		};
	};
	static upkey(keyout){
		if(['w','s','arrowup','arrowdown'].includes(keyout.key.toLowerCase())){
			player.speed=0;player.toY=0;
		}else if(['a','d','arrowleft','arrowright'].includes(keyout.key.toLowerCase())){
			player.speed=0;player.toX=0;
		};
	};
	static starttouch(touched){
		let t = [touched.touches[0].clientX,touched.touches[0].clientY];
		let sDis = Math.hypot(tuX-t[0],tuY-t[1]);
		if(sDis>maxDis){isTouching=false}else{isTouching=true};
	}
	static touch(touched){
		let t = [touched.touches[0].clientX,touched.touches[0].clientY],
			tAngle = Math.atan2(tuY-t[1],tuX-t[0]),
			tDis = Math.hypot(tuX-t[0],tuY-t[1]);
		let vx=0,vy=0;
		if(tDis>55){tDis=55};
		vx = Math.sin(-tAngle-Math.PI/2)*tDis,
		vy = Math.cos(-tAngle-Math.PI/2)*tDis;
		if(isTouching){
			tX=tuX+vx;
			tY=tuY+vy;
			maxDis=1000;
			let dAngle=(tAngle*(180/Math.PI)+360)%360;
			if(dAngle>=337.5 || dAngle<22.5){
				player.speed=movespd;player.toX=-1;player.toY=0;
			}else if(dAngle>=22.5 && dAngle<67.5){
				player.speed=movespd;player.toY=1;player.toX=-1;
			}else if(dAngle>=67.5 && dAngle<112.5){
				player.speed=movespd;player.toY=1;player.toX=0;
			}else if(dAngle>=112.5 && dAngle<157.5){
				player.speed=movespd;player.toY=1;player.toX=1;
			}else if(dAngle>=157.5 && dAngle<202.5){
				player.speed=movespd;player.toY=0;player.toX=1;
			}else if(dAngle>=202.5 && dAngle<247.5){
				player.speed=movespd;player.toY=-1;player.toX=1;
			}else if(dAngle>=247.5 && dAngle<292.5){
				player.speed=movespd;player.toY=-1;player.toX=0;
			}else if(dAngle>=292.5 && dAngle<337.5){
				player.speed=movespd;player.toY=-1;player.toX=-1;
			}; 
		};
	};
	static touchstop(touched){
		if(touched.touches.length==0){
			player.speed=movespd;player.toX=0;player.toY=0;tX=tuX;tY=tuY;maxDis=55;
		};
	};
};
const startController = () => {
	window.addEventListener('keydown',Controller.presskey);
	window.addEventListener('keyup',Controller.upkey);
	window.addEventListener('touchstart',Controller.starttouch);
	window.addEventListener('touchmove',Controller.touch);
	window.addEventListener('touchend',Controller.touchstop);
	window.addEventListener('keydown',key=>message(document.getElementById('message').value,key));
	document.getElementById('message').addEventListener('focus',()=>{
		window.removeEventListener('keydown',Controller.presskey);
		window.removeEventListener('keyup',Controller.upkey);
	});
	document.getElementById('message').addEventListener('blur',()=>{
		window.addEventListener('keydown',Controller.presskey);
		window.addEventListener('keyup',Controller.upkey);
	});
};
window.onload=initApp;
