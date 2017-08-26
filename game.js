(function (window, undefined) {
    'use strict';

    var KEY_ENTER = 13, KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_PAUSE = 80, KEY_M = 77;

    var canvas = null;
    var ctx = null;

    var WIDTH;
    var HEIGHT;
    var blockSize  = 32;
    var worldWidth = 0;
    var worldHeight = 0;
    var mapWidth = 0;
    var mapHeight = 0;
    var miniMapScale = 2;

    var lastUpdate = 0;
    var FPS = 0;
    var frames = 0;
    var acumDelta = 0;

    var lastKeyPress = null;
    var pressing = [];
    var pause = true;
    var gameover = false;
    var score = 0;

    var cam = null;
    var wall = [];
    var terrain = [];
    var box = null;
    var player = null;
    var dir = 0;

    var iPlayer = new Image();
    var iHedge = new Image();
    var iTerrain = new Image();
    var iBox = new Image();
    var iMap = new Image();
    var iMapImageData;

    var start = true;
    var pause = true;
    var minimap = false;
    var showMiniMap = true;
    var showPopUp = false;
    var popUpTitle;
    var popUpMessage;

    var map = [
                [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 10, 2, 2, 2, 2, 2, 4, 0, 0, 1, 0, 0, 3, 2, 2, 4, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 4, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 7, 0, 0, 10, 2, 2, 1, 0, 0, 0, 0, 0, 8, 0, 0, 1],
                [1, 2, 2, 2, 2, 2, 4, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 7, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 7, 0, 0, 1, 0, 0, 1, 2, 2, 4, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 7, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 8, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 8, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 3, 2, 2, 5, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 6, 2, 2, 4, 0, 0, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 6, 2, 2, 4, 0, 0, 1, 0, 0, 0, 0, 0, 10, 2, 2, 2, 2, 2, 2, 2, 9, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 3, 2, 9, 0, 0, 0, 10, 2, 4, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 8, 0, 0, 1, 0, 0, 3, 2, 2, 5, 0, 0, 1, 0, 0, 1, 0, 0, 8, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 10, 2, 2, 2, 2, 2, 4, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 12, 0, 12, 0, 0, 0, 0, 0, 3, 2, 2, 5, 0, 0, 1, 0, 0, 3, 2, 2, 5, 0, 0, 1, 2, 2, 9, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 3, 2, 2, 1, 0, 0, 10, 2, 2, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 6, 2, 9, 0, 0, 0, 10, 2, 5, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 10, 2, 2, 4, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 8, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 2, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 7, 0, 0, 1],
                [1, 0, 0, 7, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 10, 2, 2, 2, 2, 2, 2, 1, 0, 0, 7, 0, 0, 0, 6, 2, 2, 5, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 6, 2, 2, 2, 2, 2, 2, 9, 0, 0, 8, 0, 0, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 0, 0, 8, 0, 0, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 0, 0, 1, 0, 0, 1, 2, 2, 5, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 8, 0, 0, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 0, 0, 8, 0, 0, 7, 0, 0, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 8, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5]
              ];

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());

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

    function setPixel(imageData, x, y, r, g, b, a) {
        var i = ((x * (imageData.width * 4)) + (y * 4));
        imageData.data[i+0]= r;
        imageData.data[i+1]= b;
        imageData.data[i+2]= b;
        imageData.data[i+3]= a;
    }

    function setMap() {
        var col = 0, row = 0, columns = 0, rows = 0;  wall.length = 0;

        mapWidth = map[0].length;
        mapHeight = map.length;

        // create a new pixel array
        iMapImageData = ctx.createImageData(mapWidth, mapHeight);

        for (row = 0, rows = map.length; row < rows; row += 1) {
            for (col = 0, columns = map[row].length; col < columns; col += 1) {
                if (map[row][col] === 0) {
                    terrain.push(new Rect(col * blockSize, row * blockSize, blockSize, blockSize, true, 0));
                    setPixel(iMapImageData, row, col, 255, 255, 255, 255);
                }
                else{
                    wall.push(new Rect(col * blockSize, row * blockSize, blockSize, blockSize, true, map[row][col]));
                    setPixel(iMapImageData, row, col, 0, 0, 0, 255);
                }
            }
        }
    
        worldWidth = columns * blockSize;
        worldHeight = rows * blockSize;

        // create a temporary canvas
        var tempCanvas = document.createElement("canvas");
        var tempCtx = tempCanvas.getContext("2d");

        // set the temp canvas size == the canvas size
        tempCanvas.width=WIDTH;
        tempCanvas.height=HEIGHT;

        // put the modified pixels on the temp canvas
        tempCtx.putImageData(iMapImageData,0,0);

        // use the tempCanvas.toDataURL to create an img object
        iMap.src = tempCanvas.toDataURL();
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
        for (var x = 0; x < WIDTH; x += blockSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, HEIGHT);
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }

        // Horitzontal lines
        for (var y = 0; y < HEIGHT; y += blockSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(WIDTH, y);
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    }

    function drawTerrain(){
        var i = 0, l = 0;
       
        for (i = 0, l = wall.length; i < l; i += 1) {
            ctx.drawImage(iHedge, blockSize*(wall[i].t -1), 0, blockSize, blockSize, wall[i].left - cam.x, wall[i].top - cam.y, blockSize, blockSize);
        }

        for (i = 0, l = terrain.length; i < l; i += 1) {
            ctx.drawImage(iTerrain, terrain[i].left-cam.x, terrain[i].top-cam.y);
        }
    }

    function draw() {
        // Draw background canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Terrain
        drawTerrain();

        // Draw player
        ctx.drawImage(iPlayer, blockSize*dir, 0, blockSize, 48, player.left - cam.x, player.top - cam.y, blockSize, 48);

        // Draw box
        ctx.drawImage(iBox, box.left-cam.x, box.top-cam.y);

        // Draw Pop Up Messages
        if(showPopUp){
            drawPopUp();
        }

        // Draw mini Map
        if(minimap && showMiniMap){
            ctx.drawImage(iMap, 0, 0, mapWidth, mapHeight, 10, HEIGHT-mapHeight*miniMapScale-10, mapWidth*miniMapScale, mapHeight*miniMapScale);
            ctx.fillStyle="red";
            //console.log(player.left/blockSize + ", "+ player.top/blockSize)
            ctx.fillRect(10 + (player.left/blockSize)*miniMapScale, (HEIGHT-mapHeight*miniMapScale-10)+(player.top/blockSize)*miniMapScale, 4, 4); // fill in the pixel at (10,10)
            ctx.fillStyle="#FFF";
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
                    if (player.intersects(box)) {
                        if(!minimap){
                            triggerPopUp("Well, Mini Map found!", "You can show/hide the Map pressing 'M'", 3000);
                            minimap = true;
                        }
                        player.top = box.bottom;
                    }
                }
            }
            if (pressing[KEY_RIGHT]) {
                dir = 1;
                player.left += 120 * deltaTime;
                for (i = 0, l = wall.length; i < l; i += 1) {
                    if (player.intersects(wall[i])) {
                        player.right = wall[i].left;
                    }
                    if (player.intersects(box)) {
                        if(!minimap){
                            triggerPopUp("Well, Mini Map found!", "You can show/hide the Map pressing 'M'", 3000);
                        }
                        player.right = box.left;
                    }
                }
            }
            if (pressing[KEY_DOWN]) {
                dir = 0;
                player.top += 120 * deltaTime;
                for (i = 0, l = wall.length; i < l; i += 1) {
                    if (player.intersects(wall[i])) {
                        player.bottom = wall[i].top;
                    }
                    if (player.intersects(box)) {
                        if(!minimap){
                            triggerPopUp("Well, Mini Map found!", "You can show/hide the Map pressing 'M'", 3000);
                            minimap = true;
                        }
                        player.bottom = box.top;
                    }
                }
            }
            if (pressing[KEY_LEFT]) {
                dir = 3;
                player.left -= 120 * deltaTime;
                for (i = 0, l = wall.length; i < l; i += 1) {
                    if (player.intersects(wall[i])) {
                        player.left = wall[i].right;
                    }
                    if (player.intersects(box)) {
                        if(!minimap){
                            triggerPopUp("Well, Mini Map found!", "You can show/hide the Map pressing 'M'", 3000);
                            minimap = true;
                        }
                        player.left = box.right;
                    }
                }
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

        var now = Date.now(),
            deltaTime = (now - lastUpdate) / 1000;
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

        WIDTH = canvas.width;
        HEIGHT = canvas.height;

        // Create player
        player = new Rect(32, 64, 32, 48, true);

        // Create box
        box = new Rect(32, 224, blockSize, blockSize, true);

        // Create camera
        cam = new Camera();
        
        // Load assets
        iPlayer.src = 'assets/player.png';
        iHedge.src = 'assets/hedge.png';
        iTerrain.src = 'assets/terrain.png';
        iBox.src = 'assets/box.png';

        // Set initial map
        setMap();
        
        // Start game
        run();
    }

    window.addEventListener('load', init, false)

    document.addEventListener('keydown', function (evt) {
        lastKeyPress = evt.which;
        pressing[evt.which] = true;
    }, false);

    document.addEventListener('keyup', function (evt) {
        pressing[evt.which] = false;
    }, false);

}(window))