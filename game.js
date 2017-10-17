/**
 * The Hardest Game in the World
 */

(function () {
    "use strict";

    var PREFER_XHR = true;

    function truncateFloat(num, digits) {
        var value = num.toString();
        var decimal_index = value.indexOf(".");
        if (decimal_index > -1) {
            value = value.substr(0, decimal_index + digits + 1);
        }

        return value;
    }

    var TheHardestGame = function(canvas) {
        this._stage = new createjs.Stage(canvas);
        if (!TheHardestGame.assets) {
            this._preload();
        }
        else {
            this._init();
        }
    };
    var p = TheHardestGame.prototype;

    // I'd make it one millisecond or lower but I'm not entirely certain if
    // execution time might always cause the player to lose (I'm still not sure
    // with this low either because I can't fucking beat it).
    TheHardestGame.KEY_MIN_REACTION_TIME = 2;

    TheHardestGame.MAX_LEVEL = 5;

    TheHardestGame.assets = null;

    TheHardestGame._getKey = function(e) {
        if (e.key !== undefined) {
            return e.key;
        }
        else if (e.keyIdentifier !== undefined) {
            return e.keyIdentifier;
        }
        else {
            return e.keyCode;
        }
    };

    p._preloadQueue = null;
    p._level = 0;
    p._startTime = 0;
    p._countdownBar = null;
    p._countdownTime = 0;
    p._spaceIsDown = false;
    p._startButtonHelper = null;
    p._playAgainButtonHelper = null;

    p.showTitleScreen = function() {
        this._stage.clear();

        var canvas = this._stage.canvas;
        var txt_title = new createjs.Text("The Hardest Game in the World", "22px Arial", "#000000");
        var txt_title_bounds = txt_title.getBounds();
        txt_title.x = (canvas.width / 2) - (txt_title_bounds.width / 2);
        txt_title.y = 15;
        this._stage.addChild(txt_title);

        var txt_instructions = new createjs.Text(" ", "16px Arial", "#000000");
        txt_instructions.lineHeight = 20;
        txt_instructions.text = "Press start to play. Wait until the bar reaches 0, and then\ntry to press the spacebar in as little time as possible.\n"
                                + "You have a " + TheHardestGame.KEY_MIN_REACTION_TIME + " millisecond window of time and " + TheHardestGame.MAX_LEVEL + " levels to\n"
                                + "complete. Good luck.";
        var txt_instructions_bounds = txt_instructions.getBounds();
        txt_instructions.x = (canvas.width / 2) - (txt_instructions_bounds.width / 2);
        txt_instructions.y = txt_title.y + txt_title_bounds.height + 60;
        this._stage.addChild(txt_instructions);

        var txt_disclaimer = new createjs.Text("DISCLAIMER: I am not responsible for any property or psychological damage\nthis may cause. It also might not actually be the hardest game in the world.", "12px Arial", "#000000");
        var txt_disclaimer_bounds = txt_disclaimer.getBounds();
        txt_disclaimer.x = (canvas.width / 2) - (txt_disclaimer_bounds.width / 2);
        txt_disclaimer.y = txt_instructions.y + txt_instructions_bounds.height + 30;
        this._stage.addChild(txt_disclaimer);

        this._startButtonHelper = this._addButton((canvas.width / 2) - 75, txt_disclaimer.y + txt_disclaimer_bounds.height + 90, 150, 60, 15, "Start", "26px Arial", this._startGame);
    };

    p.update = function(e) {
        if (this._countdownBar) {
            if (this._countdownTime > 0) {
                this._countdownTime -= e.delta;
                this._countdownBar.scaleX = this._countdownTime / ((5 / this._level) * 1000);
            }
            else if (this._startTime === 0) {
                let canvas = this._stage.canvas;
                this._stage.removeAllChildren();
                var text = new createjs.Text("GO!", "26px Arial", "#000000");
                var text_bounds = text.getBounds();
                text.x = (canvas.width / 2) - (text_bounds.width / 2);
                text.y = (canvas.height / 2) - (text_bounds.height / 2);
                this._stage.addChild(text);

                this._startTime = createjs.Ticker.getTime();
            }
        }

        this._stage.update(e);
    };

    p._preload = function() {
        createjs.Sound.alternateExtensions = ["mp3"];

        TheHardestGame.assets = {};
        var queue = new createjs.LoadQueue(PREFER_XHR);
        queue.on("fileload", this._onFileLoad, this, false);
        queue.on("complete", this._onPreloadComplete, this, true);
        queue.loadManifest([
            { id: "youarewinnerhahaha.png", src: "img/youarewinnerhahaha.png" },
            { id: "failure.png", src: "img/failure.png" },
            { id: "applause.mp3", src: "sounds/applause.mp3" }
        ]);
        this._preloadQueue = queue;
    };

    p._onFileLoad = function(e) {
        TheHardestGame.assets[e.item.id] = e.result;
    };

    p._onPreloadComplete = function(e) {
        this._preloadQueue = null;
        this._init();
    };

    p._init = function() {
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);

        this._stage.enableMouseOver(20);
        var canvas = this._stage.canvas;
        canvas.width = 500;
        canvas.height = 450;
        canvas.style.backgroundColor = "#ffffff";
        canvas.style.border = "1px solid #000000";
        canvas.addEventListener("click", function(e) {
            window.focus();
        });

        createjs.Ticker.on("tick", this.update, this, false);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        this.showTitleScreen();
    };

    p._startGame = function(e) {
        this._startButtonHelper = null;
        this._playAgainButtonHelper = null;
        this._level = 1;
        this._startTime = 0;
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
        this._showCountdown();
    };

    p._showCountdown = function() {
        this._stage.removeAllChildren();

        let canvas = this._stage.canvas;
        var level_text = new createjs.Text("Level " + this._level + " / " + TheHardestGame.MAX_LEVEL, "22px Arial", "#000000");
        var level_text_bounds = level_text.getBounds();
        level_text.x = (canvas.width / 2) - (level_text_bounds.width / 2);
        level_text.y = (canvas.height / 2) - level_text_bounds.height - 17;
        this._stage.addChild(level_text);

        var instruction_text = new createjs.Text("Press Space in...", "18px Arial", "#000000");
        var instruction_text_bounds = instruction_text.getBounds();
        instruction_text.x = (canvas.width / 2) - (instruction_text_bounds.width / 2);
        instruction_text.y = level_text.y + level_text_bounds.height + 8;
        this._stage.addChild(instruction_text);

        var bar_bounds = { width: 250, height: 25 };
        var bar = new createjs.Shape();
        bar.graphics.beginFill("#ff0000");
        bar.graphics.drawRect(0, 0, bar_bounds.width, bar_bounds.height);
        bar.x = (canvas.width / 2) - (bar_bounds.width / 2);
        bar.y = instruction_text.y + instruction_text_bounds.height + 5;
        this._stage.addChild(bar);
        this._countdownBar = bar;

        var border = new createjs.Shape();
        border.graphics.beginStroke("#000000");
        border.graphics.drawRect(0, 0, bar_bounds.width, bar_bounds.height);
        border.x = bar.x;
        border.y = bar.y;
        this._stage.addChild(border);

        this._countdownTime = (5 / this._level) * 1000;
    };

    p._onKeyDown = function(e) {
        var t = createjs.Ticker.getTime();
        var key = TheHardestGame._getKey(e);
        if ((key === "Spacebar" || key === " " || key === 32) && !this._spaceIsDown && this._startTime > 0) {
            var time_difference = t - this._startTime;
            if (time_difference <= TheHardestGame.KEY_MIN_REACTION_TIME) {
                if (this._level === TheHardestGame.MAX_LEVEL) {
                    this._showWinScreen();
                }
                else {
                    this._gotoNextLevel();
                }
            }
            else {
                this._showFailScreen(time_difference - TheHardestGame.KEY_MIN_REACTION_TIME);
            }

            this._spaceIsDown = true;
            e.preventDefault();
        }
    };

    p._onKeyUp = function(e) {
        var key = TheHardestGame._getKey(e);
        if (key === "Spacebar" || key === " " || key === 32) {
            this._spaceIsDown = false;
            e.preventDefault();
        }
    }

    p._gotoNextLevel = function() {
        ++this._level;
        this._startTime = 0;
        this._showCountdown();
    };

    p._showWinScreen = function() {
        this._removeKeyListeners();
        this._stage.removeAllChildren();

        this._stage.addChild(new createjs.Bitmap(TheHardestGame.assets["youarewinnerhahaha.png"]));
        createjs.Sound.play(TheHardestGame.assets["applause.mp3"]);

        var canvas = this._stage.canvas;
        this._playAgainButtonHelper = this._addButton(canvas.width - 175, canvas.height - 85, 150, 60, 15, "Again?", "20px Arial", this._startGame);
    };

    p._showFailScreen = function(lost_by_milliseconds) {
        this._removeKeyListeners();
        this._stage.removeAllChildren();

        this._stage.addChild(new createjs.Bitmap(TheHardestGame.assets["failure.png"]));

        var canvas = this._stage.canvas;
        var text = new createjs.Text("You lost by " + truncateFloat(lost_by_milliseconds, 3) + " milliseconds. :(", "25px Arial", "#ffffff");
        var text_bounds = text.getBounds();
        text.x = (canvas.width / 2) - (text_bounds.width / 2);
        text.y = (canvas.height / 2) - text_bounds.height;

        var text_outline = text.clone();
        text_outline.color = "#000000";
        text_outline.outline = 5;
        this._stage.addChild(text_outline);
        this._stage.addChild(text);

        this._playAgainButtonHelper = this._addButton(canvas.width - 175, canvas.height - 85, 150, 60, 15, "Try Again?", "20px Arial", this._startGame);
    };

    p._removeKeyListeners = function() {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    };

    p._addButton = function(x, y, width, height, radius, text, font, handler) {
        var button_bg = new createjs.Shape();
        button_bg.graphics.beginStroke("#000000");
        button_bg.graphics.beginFill("#cc0000");
        button_bg.graphics.drawRoundRect(0, 0, width, height, radius);
        button_bg.cache(0, 0, width, height);

        var button_txt = new createjs.Text(text, font, "#ffffff");
        var button_txt_bounds = button_txt.getBounds();
        button_txt.x = (width / 2) - (button_txt_bounds.width / 2);
        button_txt.y = (height / 2) - (button_txt_bounds.height / 2);


        var button_mc = new createjs.MovieClip();
        button_mc.addChild(button_bg);
        button_mc.addChild(button_txt);
        button_mc.x = x;
        button_mc.y = y;
        button_mc.cursor = "pointer";
        this._stage.addChild(button_mc);

        button_mc.on("click", this._startGame, this, true);
        return new createjs.ButtonHelper(button_mc);
    };

    function onPageLoad(e) {
        window.removeEventListener("load", onPageLoad);
        var game = new TheHardestGame("game-canvas");
    }
    window.addEventListener("load", onPageLoad);
}());
