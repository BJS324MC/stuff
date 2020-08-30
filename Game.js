const options=()=>
    game.functionTimer(
        [20,120,300,500,200,1200,1000,1000],
        [
        ()=>game.spawnEntity('Bullet'),
        ()=>game.spawnEntity('Homer'),
        ()=>game.spawnEntity('Line'),
        ()=>game.spawnEntity('Crusher'),
        ()=>{
            let d=game.spawnEntity('Bomb'); 
            /*d.onExplode=()=>{
                for(let i in range(8)){
                    pat2(d.x,d.y,'Bomb',1+i*45);
                };
            };*/
            d.onExplode=()=>pat(d.x,d.y,'Bullet',8);
            d.timer=50;
            d.maxSize=2;
            d.spdtimer=5;
            },
        ()=>game.spawnEntity('Bomb'),
        ()=>game.spawnEntity('Ball'),
        ()=>game.spawnEntity('HealLine')
        ]
    );
start();
alert(game);
setInterval(options,0);
