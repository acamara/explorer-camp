(function (window, undefined) {
    'use strict';

    var KEY_ENTER = 13, KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_PAUSE = 80, KEY_M = 77;

    var canvas = null;
    var ctx = null;
	
    var blockSize  = 32;
    var worldWidth = 0;
    var worldHeight = 0;
    var mapWidth = 0;
    var mapHeight = 0;
    var miniMapScale = 3;
	var mazeW = 16;
	var mazeH = 16;
	
	var lastUpdate = 0;
    var FPS = 0;
    var frames = 0;
    var acumDelta = 0;

    var lastKeyPress = null;
    var pressing = [];
    var pause = true;
    var gameover = false;
    var start = true;
	
	var mazeMap;
	var cam = null;
    var wall = [];
    var terrain = [];
    //var water = [];
    var box = null;
    var player = null;
    var dir = 0;
	
	var iPlayer = new Image();
    var iHedge = new Image();
    var iTerrain = new Image();
    var iWater = new Image();
    var iBox = new Image();
	
	var minimap = false;
    var showMiniMap = true;
    var showPopUp = false;
    var popUpTitle;
    var popUpMessage;	
	
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function Maze(w, h, nextCell, startX, startY) {
		this.w = (isNaN(w) || w < 5 || w > 999 ? 20 : w);
		this.h = (isNaN(h) || h < 5 || h > 999 ? 20 : h);
		this.map = new Array();
		
		for(var mh = 0; mh < h; ++mh) { 
			this.map[mh] = new Array(); 
			for(var mw = 0; mw < w; ++mw) { 
				this.map[mh][mw] = {'N':0,'S':0,'E':0,'W':0,'V':0}; 
			} 
		}

		this.nextCell = (typeof nextCell === 'undefined' || (nextCell != 'first' && nextCell != 'last' && nextCell != 'random') ? 'random' : nextCell);

		this.startX = (isNaN(startX) || startX < 0 || startX >= w ? 0 : startX);
		this.startY = (isNaN(startY) || startY < 0 || startY >= h ? 0 : startY);

		this.build();
	}

	Maze.prototype.toGrid = function() {
		var grid = new Array();
		
		for(var mh = 0; mh < (this.h * 3 + 1); ++mh) { 
			grid[mh] = new Array(); 
			
			for(var mw = 0; mw < (this.w * 3 + 1); ++mw) { 
				grid[mh][mw] = 0; 
			} 
		}

		for(var y = 0; y < this.h; ++y){
			var py = (y * 3) + 1;

			for(var x = 0; x < this.w; ++x){
				var px = (x * 3) + 1;

				grid[py][px] = 1;
				grid[py][px+1] = 1;
				grid[py+1][px] = 1;
				grid[py+1][px+1] = 1;
				
				if(this.map[y][x]['N'] === 1) { grid[(py-1)][px] = 1; grid[(py-1)][px+1] = 1;}
				if(this.map[y][x]['S'] === 1) { grid[(py+1)][px] = 1; grid[(py+1)][px+1] = 1;}
				if(this.map[y][x]['E'] === 1) { grid[py][(px+1)] = 1; grid[py+1][(px+1)] = 1;}
				if(this.map[y][x]['W'] === 1) { grid[py][(px-1)] = 1; grid[py+1][(px-1)] = 1;}
			}
		}

		this.gridMap = grid;
		this.gridW	= grid.length;
		this.gridH	= grid[0].length;
	};

	Maze.prototype.build = function(dir) {
		var cells = new Array();
		cells.push({x:this.startX, y:this.startY});
		this.map[this.startY][this.startX]['V'] = 1;

		var modDir = {
			'N' : { y : -1, x : 0, 	o : 'S' },
			'S' : { y : 1, 	x : 0, 	o : 'N' },
			'W' : { y : 0, 	x : -1, o : 'E' },
			'E' : { y : 0, 	x : 1, 	o : 'W' }
		};

		while(cells.length > 0){
			var i = (this.nextCell=='first' ? 0 : (this.nextCell=='last' ? cells.length-1 : Math.floor((Math.random()*10000)%cells.length)));
			var cell = cells[i];

			// Check for neighbours
			var n = new Array();
			
			if(cell.x>0 && this.map[cell.y][(cell.x-1)]['V']==0) { 
				n.push('W');
			}		
			if(cell.x<(this.w-1) && this.map[cell.y][(cell.x+1)]['V']==0) { 
				n.push('E');
			}
			if(cell.y>0 && this.map[(cell.y-1)][cell.x]['V']==0) {
				n.push('N');
			}
			if(cell.y<(this.h-1) && this.map[(cell.y+1)][cell.x]['V']==0) {
				n.push('S'); 
			}

			if(n.length === 0) { 
				cells.splice(i, 1); 
				continue;
			}

			var dir = n[Math.floor((Math.random()*10000)%n.length)];

			var destX = (cell.x + modDir[dir].x);
			var destY = (cell.y + modDir[dir].y);

			this.map[cell.y][cell.x][dir] = 1;
			this.map[destY][destX][modDir[dir].o] = 1;
			this.map[destY][destX]['V'] = 1;
			cells.push({x:destX, y:destY});
		}

		this.toGrid();
	};
	
	function Camera() {
        this.x = 0;
        this.y = 0;
    }

    Camera.prototype = {
        constructor: Camera,
        
        focus: function (x, y) {
            this.x = x - canvas.width / 2;
            this.y = y - canvas.height / 2;

            if (this.x < 0) {
                this.x = 0;
            } else if (this.x > worldWidth - canvas.width) {
                this.x = worldWidth - canvas.width;
            }
            if (this.y < 0) {
                this.y = 0;
            } else if (this.y > worldHeight - canvas.height) {
                this.y = worldHeight - canvas.height;
            }
        }
    };
    
    function Rect(x, y, width, height, createFromTopLeft, type) {
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height;
        if (createFromTopLeft) {
            this.left = (x === undefined) ? 0 : x;
            this.top = (y === undefined) ? 0 : y;
        } else {
            this.x = (x === undefined) ? 0 : x;
            this.y = (y === undefined) ? 0 : y;
        }
        this.t = (type === undefined) ? -1 : type;
    }
    
    Rect.prototype = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        
        get x() {
            return this.left + this.width / 2;
        },
        set x(value) {
            this.left = value - this.width / 2;
        },
        
        get y() {
            return this.top + this.height / 2;
        },
        set y(value) {
            this.top = value - this.height / 2;
        },
        
        get right() {
            return this.left + this.width;
        },
        set right(value) {
            this.left = value - this.width;
        },
        
        get bottom() {
            return this.top + this.height;
        },
        set bottom(value) {
            this.top = value - this.height;
        },
        
        intersects: function (rect) {
            if (rect !== undefined) {
                return (this.left < rect.right &&
                    this.right > rect.left &&
                    this.top < rect.bottom &&
                    this.bottom > rect.top);
            }
        },
    };
	
	function setMap() {
		var type;
        
		for(var col = 0; col < mazeMap.gridH; ++col){
			for(var row = 0; row < mazeMap.gridW; ++row){
                if(mazeMap.gridMap[col][row] === 1) { 
                    terrain.push(new Rect(col * blockSize, row * blockSize, blockSize, blockSize, true));
                }
                else{
					if(row === 0 && col === 0){
						type = 2;
					}
					else if(row === 0 && col === mazeMap.gridH-1){
						type = 3;
					}
					else if(row === mazeMap.gridW-1 && col === mazeMap.gridH-1){
						type = 4;
					}
					else if(row === mazeMap.gridW-1 && col === 0){
						type = 5;
					}
					else if(row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col][row-1] === 1 && mazeMap.gridMap[col][row+1] === 0 && mazeMap.gridMap[col-1][row] === 1 && mazeMap.gridMap[col+1][row] === 1){
						type = 6;
					}
					else if(row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col][row-1] === 0 && mazeMap.gridMap[col][row+1] === 1 && mazeMap.gridMap[col-1][row] === 1 && mazeMap.gridMap[col+1][row] === 1){
						type = 7;
					}
					else if(col > 1 && col < mazeMap.gridH-1 && mazeMap.gridMap[col-1][row] === 0 && mazeMap.gridMap[col+1][row] === 1 && mazeMap.gridMap[col][row+1] === 1 && mazeMap.gridMap[col][row-1] === 1) {
						type = 8;
					}
					else if(col > 1 && col < mazeMap.gridH-1 && mazeMap.gridMap[col-1][row] === 1 && mazeMap.gridMap[col+1][row] === 0 && mazeMap.gridMap[col][row+1] === 1 && mazeMap.gridMap[col][row-1] === 1) {
						type = 9;
					}
					else if(col > 1 && col < mazeMap.gridH-1 && row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col-1][row] === 1 && mazeMap.gridMap[col+1][row] === 0 && mazeMap.gridMap[col][row-1] === 1 && mazeMap.gridMap[col][row+1] === 0 ) {
						type = 2;
					}
					else if(col > 1 && col < mazeMap.gridH-1 && row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col-1][row] === 0 && mazeMap.gridMap[col+1][row] === 1 && mazeMap.gridMap[col][row-1] === 1 && mazeMap.gridMap[col][row+1] === 0 ) {
						type = 3;
					}
					else if(col > 1 && col < mazeMap.gridH-1 && row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col-1][row] === 0 && mazeMap.gridMap[col+1][row] === 1 && mazeMap.gridMap[col][row-1] === 0 && mazeMap.gridMap[col][row+1] === 1 ) {
						type = 4;
					}
					else if(col > 1 && col < mazeMap.gridH-1 && row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col-1][row] === 1 && mazeMap.gridMap[col+1][row] === 0 && mazeMap.gridMap[col][row-1] === 0 && mazeMap.gridMap[col][row+1] === 1 ) {
						type = 5;
					}
					else if(col > 1 && col < mazeMap.gridH-1 && row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col-1][row] === 0 && mazeMap.gridMap[col+1][row] === 0) {
						type = 1;
					}
					else if(row === 0 || row === mazeMap.gridW-1 || (row > 1 && row < mazeMap.gridW-1 && mazeMap.gridMap[col][row-1] === 1 && mazeMap.gridMap[col][row+1] === 1)){
						type = 1;
					}				
					else{
						type = 0;
					}
                    wall.push(new Rect(col * blockSize, row * blockSize, blockSize, blockSize, true, type));
                }
            }
        }
    
        worldWidth = mazeMap.gridH * blockSize;
        worldHeight = mazeMap.gridW * blockSize;
    }
	
	function drawStart(){
        ctx.fillStyle = '#000';
        ctx.fillRect(canvas.width/2-150, canvas.height/2-50, 290, 90);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.font = "26px Impact";
        ctx.fillText('Explorer Camp GAME', canvas.width/2, canvas.height/2); 
        ctx.font = "10px Verdana";
        ctx.fillText('Press "Enter" to start the game', canvas.width/2, canvas.height/2+20); 
    }

    function drawPause(){
        ctx.fillStyle = '#FFF';
        ctx.font = "20px Impact";
        ctx.fillText('PAUSE', canvas.width/2, canvas.height/2); 
        ctx.font = "12px Verdana";
        ctx.fillText('Press P to Unpause the game', canvas.width/2, canvas.height/2+20); 
    }

    function drawGameOver(){
        ctx.font = "20px Impact";
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2); 
        ctx.font = "10px Verdana";
        ctx.fillText('Press ESC to restart the game', canvas.width/2, canvas.height/2+20); 
    }

    function drawPopUp(){
        ctx.fillStyle = '#000';
        ctx.fillRect(canvas.width/2-145, 50, 290, 90);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.font = "16px Verdana";
        ctx.fillText(popUpTitle, canvas.width/2, 75); 

        ctx.font = "10px Verdana";
        ctx.fillText(popUpMessage, canvas.width/2, 105); 

        // Reset styles
        ctx.textAlign = 'left';
        ctx.font = "10px Verdana";
        ctx.fillStyle = '#FFF';
    }

    function drawGrid(){

        // Vertical lines
        for (var x = 0; x < canvas.width; x += blockSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }

        // Horitzontal lines
        for (var y = 0; y < canvas.height; y += blockSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    }
	
	function drawMaze() {

		for (var i = 0, l = wall.length; i < l; i += 1) {
            ctx.drawImage(iHedge, blockSize*(wall[i].t), 0, blockSize, blockSize, wall[i].left - cam.x, wall[i].top - cam.y, blockSize, blockSize);
        }

        for (var i = 0, l = terrain.length; i < l; i += 1) {
            ctx.drawImage(iTerrain, terrain[i].left-cam.x, terrain[i].top-cam.y);
        }
	}
	
	function drawMiniMap(){
		var miniMapBorder = 5;
		var miniMapLeft = 10;
		var miniMapTop = canvas.height-mazeMap.gridW*miniMapScale-10-miniMapBorder; 
		
		ctx.fillStyle="white";
		ctx.fillRect(miniMapLeft, miniMapTop, mazeMap.gridH * miniMapScale+10, mazeMap.gridW*miniMapScale+10);
		
		ctx.fillStyle="black";
		for (var i = 0, l = wall.length; i < l; i += 1) {
            ctx.fillRect((wall[i].left/blockSize)*miniMapScale+miniMapLeft+miniMapBorder, (wall[i].top/blockSize)*miniMapScale+miniMapTop+miniMapBorder, miniMapScale, miniMapScale);
        }
		
        ctx.fillStyle="red";
		ctx.beginPath();
		ctx.arc((player.left/blockSize)*miniMapScale+miniMapLeft+miniMapBorder+1, (player.top/blockSize)*miniMapScale+miniMapTop+miniMapBorder+1,2,0,2*Math.PI);
		ctx.fill();
		
		ctx.fillStyle="#FFF";
	}
	
	function draw() {
        // Draw background canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Terrain
        drawMaze();

        // Draw Player
        ctx.drawImage(iPlayer, blockSize*dir, 0, blockSize, 48, player.left - cam.x, player.top - cam.y, blockSize, 48);

        // Draw box
        ctx.drawImage(iBox, box.left-cam.x, box.top-cam.y);

        // Draw Pop Up Messages
        if(showPopUp){
            drawPopUp();
        }

        // Draw mini Map
        if(minimap && showMiniMap){
           drawMiniMap();
        }

        // Draw start/pause/gameover
        if (pause) {
            ctx.textAlign = 'center';
            if(start){
                drawStart();
            }
            else if (gameover) {
                drawGameOver();
            } else {
                drawPause();
            }
            ctx.textAlign = 'left';
        }

        // FOR DEBUG
        // Draw FPS
        ctx.fillStyle = '#FFF';
        ctx.fillText('FPS: ' + FPS, 10, 15);

        // Draw lastKeyPress
        ctx.fillStyle = '#FFF';
        ctx.fillText('LastKeyPress: ' + lastKeyPress, 10, 30);

        // Draw player position
        ctx.fillText('Player: (' + player.left +", "+ player.top + ")", 10, 45);
               
        //drawGrid();
    }
	
	function boxIntersectsWall() {
		for (var i = 0, l = wall.length; i < l; i += 1) {
            if (box.intersects(wall[i])) {
                return true;
            }
        }
		return false;
	}
	
	function miniMapIntersects(){
        if(!minimap){
            triggerPopUp("Well, Mini Map found!", "You can show/hide the Map pressing 'M'", 3000);
            minimap = true;
        }
    }
	
	function triggerPopUp(title, message, time){
        showPopUp = true;
        popUpTitle = title;
        popUpMessage = message;

        setTimeout(function(){ showPopUp = false; }, time);
    }
	
	function act(deltaTime) {
        var i = 0, l = 0;

        if (!pause) {
       
            // Move Player
            if (pressing[KEY_UP]) {
                dir = 2;
                player.top -= 120 * deltaTime;
                
                for (i = 0, l = wall.length; i < l; i += 1) {
                    if (player.intersects(wall[i])) {
                        player.top = wall[i].bottom;
                    }
                }
                
                if (player.intersects(box)) {
                    miniMapIntersects();
                    player.top = box.bottom;
                }
				/*
                for (i = 0, l = water.length; i < l; i += 1) {
                    if (player.intersects(water[i])) {
                        player.top = water[i].bottom;
                    }
                }
				*/
            }
            if (pressing[KEY_RIGHT]) {
                dir = 1;
                player.left += 120 * deltaTime;
                
                for (i = 0, l = wall.length; i < l; i += 1) {
                    if (player.intersects(wall[i])) {
                        player.right = wall[i].left;
                    }
                }
				
                if (player.intersects(box)) {
                    miniMapIntersects();
                    player.right = box.left;
                }
				/*
                for (i = 0, l = water.length; i < l; i += 1) {
                    if (player.intersects(water[i])) {
                        player.right = water[i].left;
                    }
                }
				*/
            }
            if (pressing[KEY_DOWN]) {
                dir = 0;
                player.top += 120 * deltaTime;
                
                for (i = 0, l = wall.length; i < l; i += 1) {
                    if (player.intersects(wall[i])) {
                        player.bottom = wall[i].top;
                    }
                }
				
                if (player.intersects(box)) {
                    miniMapIntersects();
                    player.bottom = box.top;
                }
				/*
                for (i = 0, l = water.length; i < l; i += 1) {
                    if (player.intersects(water[i])) {
                        player.bottom = water[i].top;
                    }
                }
				*/
            }
            if (pressing[KEY_LEFT]) {
                dir = 3;
                player.left -= 120 * deltaTime;
                
                for (i = 0, l = wall.length; i < l; i += 1) {
                    if (player.intersects(wall[i])) {
                        player.left = wall[i].right;
                    }
                }
				
                if (player.intersects(box)) {
                    miniMapIntersects();
                    player.left = box.right;
                }
				/*
                for (i = 0, l = water.length; i < l; i += 1) {
                    if (player.intersects(water[i])) {
                        player.left = water[i].right;
                    }
                }
				*/
            }

            // Focus player
            cam.focus(player.left, player.top);
        }
        
        // Pause/Unpause
        if (!start && lastKeyPress === KEY_PAUSE) {
            pause = !pause;
            lastKeyPress = null;
        }

        // Start
        if (lastKeyPress === KEY_ENTER) {
            pause = false;
            start = false;
            triggerPopUp("Instrucctions", "You should search a small wooden box", 3000);
        }

        // Show/hide Map
        if (lastKeyPress === KEY_M) {
            showMiniMap = !showMiniMap;
            lastKeyPress = null;
        }
    }

    function run() {
        window.requestAnimationFrame(run);

        var now = Date.now();
        var deltaTime = (now - lastUpdate) / 1000;
       
	   if (deltaTime > 1) {
            deltaTime = 0;
        }
      
        lastUpdate = now;

        frames += 1;
        acumDelta += deltaTime;
      
        if (acumDelta > 1) {
            FPS = frames;
            frames = 0;
            acumDelta -= 1;
        }

        act(deltaTime);
        draw(ctx);
    }

    function init() {
        // Get canvas and context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
	
		// Create maze
		mazeMap = new Maze(mazeW, mazeH, 'random', 1, 1);

        // Create player
        player = new Rect(32, 32, 32, 48, true);

        // Create camera
        cam = new Camera();
        
        // Load assets
        iPlayer.src = 'assets/player.png';
        iHedge.src = 'assets/hedge.png';
        iTerrain.src = 'assets/terrain.png';
        iBox.src = 'assets/box.png';
        iWater.src = 'assets/water.png';

        // Set initial map
        setMap();
		
		// Create box
		var x = blockSize;
		var y = getRandomInt(96, canvas.height-blockSize);
		box = new Rect(x, y, blockSize, blockSize, true);
		
		while(y%blockSize !== 0 || boxIntersectsWall()){
			y = getRandomInt(96, canvas.height-blockSize);
			box = new Rect(x, y, blockSize, blockSize, true);
		}
				        
        // Start game
        run();
    }
	
    window.addEventListener('load', init, false);

	window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());
	
    document.addEventListener('keydown', function (evt) {
        lastKeyPress = evt.which;
        pressing[evt.which] = true;
    }, false);

    document.addEventListener('keyup', function (evt) {
        pressing[evt.which] = false;
    }, false);

}(window));