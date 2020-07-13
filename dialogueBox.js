/*
    NOTE: This module on works with bitmap fonts!
        game.load.bitmapFont("fontKey", "graphicSourc.png", "fontSource.fnt");

        checkout: https://www.pentacom.jp/pentacom/bitfontmaker2/
        checkout: https://github.com/andryblack/fontbuilder for easy creating custom pixel
        checkout: https://convertio.co/ttf-bmp/
        checkout: https://fontforge.github.io/en-US/ convert ttf to bitmap (png/fnt)
        checkout: https://github.com/photonstorm/phaser-examples/tree/master/examples/assets/fonts/bitmapFonts
        credit to https://github.com/netgfx/Phaser-typewriter for reference material

*/


const Dialogue = {};

Dialogue.onOpen  = null;
Dialogue.onClose = null;
Dialogue.postMessageAction  = null;
Dialogue.onType  = null;
Dialouge.isTypeing = false;
Dialogue.currentImages = [];

/*
imageModel = {
    x: 0,
    y: 0,
    key: "phaserSprite",
    onType: () => {console.log("hi")},
    preMessage: null,
    postMessageAction: () => {console.log("goodbye")}
}
*/

/*
optionsModel = {
    spriteKey : "ui",
    background: "backgroundSprite",
    closeButton: "closeButtonSprite",
    fontSize: 14,
    fontFamily: "chillerBlack",
    wordWrap: true,
    typeDelay: 0.01,
    width: 600,
    height: 400,
    x: 0,
    y: 0
};
*/

Dialogue.init = (game, options) => {

    //setup background and close button functionaliity
    Dialogue.game = game;
    Dialogue.container   = game.add.group();
    Dialogue.container.x = options.x || game.width * 0.5 - (options.width * 0.5);
    Dialogue.container.y = options.y || game.height - options.height;
    Dialogue.background  = game.add.sprite(0, 0, options.spriteKey, options.background);
    Dialogue.closeButton = game.add.sprite(0, 0, options.spriteKey, options.closeButton);
    Dialogue.wordWrap = options.wordWrap;
    Dialogue.wrapWidth = options.width * 0.9;
    Dialogue.typeDelay = options.typeDelay || 0.01;
    Dialogue.fontFamily = options.fontFamily;
    Dialogue.fontSize   = options.fontSize;

    Dialogue._isTypeing = false;
    Dialogue._que = [];
    Dialogue._autoTime = false;

    Dialogue.background.width  = options.width;
    Dialogue.background.height = options.height;
    Dialogue.background.inputEnabled = true;

    Dialogue.container.add(Dialogue.background);
    Dialogue.container.add(Dialogue.closeButton);

    Dialogue.closeButton.width  = 50;
    Dialogue.closeButton.height = 50;
    Dialogue.closeButton.x = options.width/2 - Dialogue.closeButton.width/2;
    Dialogue.closeButton.y = options.height - (Dialogue.closeButton.height + 10);
    Dialogue.closeButton.alpha = 0;
    Dialogue.closeButton.events.onInputDown.add(Dialogue.close, Dialogue);

    Dialogue.closeButton.tint = 0x000999;

    Dialogue.container.inputEnableChildren = true;
    Dialogue.container.onChildInputDown.add(Dialogue.userInput, Dialogue);
    //Dialogue.background.events.onInputDown.add(Dialogue.userInput, Dialogue);

    return Dialogue;
};
Dialogue.generateBackground = (width, height) => {
    let graphics = Dialogue.game.add.graphics(0,0);
    graphics.beginFill(0xffffff);
    graphics.lineStyle(4, 0xfd02eb, 1);

    graphics.moveTo(0, 0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height);
    graphics.lineTo(0,height);
    graphics.lineTo(0,0);
    graphics.endFill();
    
    return graphics;
}
Dialogue.setPropertyChain = (property, value) => {
    Dialogue[property] = value;
    return dialouge;
};
Dialogue.setOnTypeCallback = (target, fun) => {
    target.onType = () => {
        fun(target);
    };

    return Dialogue;
};
Dialogue.setPostMessageActionCallback = (target, fun) => {
    target.postMessageAction = () => {
        fun(target);
    };

    return Dialogue;
};
Dialogue.setonPreMessageCallback = (target, fun) => {
    target.preMessage = () => {
        fun(target);
    };

    return Dialouge
}
Dialogue.setOnCloseCallback = (fun) => {
    Dialogue.onClose= fun;

    return Dialogue;
};
Dialogue.setOnOpenCallback = (fun) => {
    Dialogue.onOpen = fun;

    return Dialogue;
};
Dialogue.setMessageAlpha = (message, alpha) => {

    let messageExists = typeof message !== "undefined" && Array.isArray(message.children);

    if (messageExists) {
        let amountOfChars = message.children.length;
        for (let i = 0; i < amountOfChars; i++){
            let letter = message.getChildAt(i);
            letter.alpha = alpha;
        };
    }

    return messageExists;
}
Dialogue.displayMessage = (message, imageData = [], typewriter = false, call) => {
    let newMessageIsReady = !Dialogue._isTypeing;
    if (newMessageIsReady){
        Dialogue._messageText = message;
        if (Dialogue.message){
            Dialogue.message.destroy();
        }
        imageData.forEach((data) => {
            let imgShell = {
                sprite: game.add.sprite(data.x, data.y. data.key),
                onType: null,
                preMessageAction: null,
                postMessageAction: null
            }
            Dialogue.currentImages.push(imgShell)
        })

        if (typewriter){
            Dialogue.typewrite(message);
            Dialogue.postMessageAction = call;
        }
        else {
            // Only support bitmap text until there's a way to use both seamlessly
            Dialogue.message = game.add.bitmapText(0, 0, Dialogue.fontFamily, message, Dialogue.fontSize)
            Dialogue.message.maxWidth = Dialogue.wrapWidth;


            //position Dialogue message in center of box
            Dialogue.message.x = (Dialogue.background.width * 0.5) - (Dialogue.message.width * 0.5);
            Dialogue.message.y = (Dialogue.background.height * 0.05)// - (Dialogue.message.height * 0.5);

            Dialogue.container.add(Dialogue.message);

            let typingActionExists = typeof Dialogue.onType === "function";
            if (typingActionExists){
                Dialogue.onType(message);
            }

            let doMessageAction = typeof call === "function";
            if (doMessageAction){
                call(Dialogue.message, message);
                Dialogue.postMessageAction = null;
            }
        }
    }
    else {
        Dialogue._que.push([message, typewriter, call]);
    }
    return Dialogue;
};
Dialogue.clearQue = () => {
    Dialogue._que = [];
}
Dialogue.typewrite = (message) => {

    let fontFamily = Dialogue.fontFamily;
    let fontSize   = Dialogue.fontSize;
    let xPosition  = Dialogue.background.width * 0.5;
    let yPosition  = Dialogue.background.height * 0.25;
    let typedText  = game.add.bitmapText(xPosition, yPosition, fontFamily, message, fontSize);
    typedText.maxWidth = Dialogue.wrapWidth;

    Dialogue.setMessageAlpha(typedText, 0);

    //Tutorial resets position for some reason?? Find out why!
    typedText.x = (Dialogue.background.width * 0.5) - (typedText.width * 0.5);
    typedText.y = Dialogue.background.height * 0.05

    //calculate timing
    let amountOfChars = typedText.children.length;
    let currentChar = 0;
    let delay = Phaser.Timer.SECOND * Math.min(1,Dialogue.typeDelay); //a millesecond;
    let timer = game.time.create(false);
    timer.start();
    Dialogue._isTypeing = true;
    timer.repeat(delay, amountOfChars, () => {
        //do onType function here
        let char = typedText.getChildAt(currentChar);
        char.alpha = 1;

        let typingActionExists = typeof Dialogue.onType === "function";
        if (typingActionExists){
            Dialogue.onType(message, char);
        }
        currentChar++;
    });

    timer.onComplete.add(Dialogue.timerAction);

    Dialogue._timer = timer;
    Dialogue.message = typedText;
    Dialogue.container.add(Dialogue.message);

    return Dialogue;
};

Dialogue.timerAction = (timer) => {
    Dialogue._isTypeing = false;
    timer.stop();
    timer.destroy();

    let postActionExists = typeof Dialogue.postMessageAction === "function";
    let canShowNewMessage = Dialogue._que.length > 0 && Dialogue._autoTime === true;

    if (postActionExists){
        Dialogue.postMessageAction(Dialogue.container, Dialogue._messageText);
    }
    if (canShowNewMessage){
        let newMessage = Dialogue._que.shift();
        Dialogue.displayMessage(...newMessage);
    }

};

Dialogue.userInput = () => {
    //NOTE address future edge case of both an auto timer being on and user being able to click to skip message
    let noMessagesLeft = !Dialogue._isTypeing && Dialogue._que.length === 0;
    let permitExistingMessage = !Dialogue._isTypeing && Dialogue._que.length > 0 && Dialogue._autoTime === false;
    if (noMessagesLeft){
        Dialogue.closeButton.alpha = 1;
        Dialogue.closeButton.inputEnabled = true;
        //Dialogue.close();
    }
    else if (Dialogue._isTypeing) {
        Dialogue.setMessageAlpha(Dialogue.message, 1);
        Dialogue.timerAction(Dialogue._timer);
    }
    else if (permitExistingMessage){
        let newMessage = Dialogue._que.shift();
        Dialogue.displayMessage(...newMessage);
    }
};

Dialogue.close = () => {
    Dialogue._timer.stop();
    Dialogue._timer.destroy();
    Dialogue.container.destroy();

    let postActionExists = typeof Dialogue.onClose === "function";
    if (postActionExists){
        Dialogue.onClose();
    }
}
