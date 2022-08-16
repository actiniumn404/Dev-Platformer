const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

class Block{
    constructor(x, y) {
        this.x = x
        this.y = y
        this.cX = game.blockSize * x
        this.cY = game.blockSize * y
        this.text = utils.randChoice([
            "const x = ",
            "if (x && y)",
            "<audio src=",
            "#include <io",
            "git remove add",
            "std::cout <<"
        ])
    };
    draw(){
        if (this.cX < game.playerX - 4 * game.blockSize || game.playerX + 9 * game.blockSize < this.cX){
            return;
        }
        ctx.fillStyle = game.colors.block_border;
        ctx.fillRect(this.cX - game.playerX + game.realPX,
            this.cY - game.playerY + game.realPY,
            game.blockSize,
            game.blockSize)
        ctx.fillStyle = game.colors.block;
        ctx.fillRect(this.cX + game.blockBorderW - game.playerX + game.realPX,
            this.cY - game.playerY + game.realPY + game.blockBorderW,
            game.blockSize - 2 * game.blockBorderW,
            game.blockSize - 2 * game.blockBorderW)
    }
    collision(coordX, coordY){
        game.playerX = coordX
        game.playerY = coordY
        this.draw()
    }
}

class IDE{
    constructor(x, y) {
        this.x = x
        this.y = y
        this.cX = game.blockSize * x + game.blockSize / 2- 20
        this.cY = game.blockSize * y + game.blockSize / 2 - 20
        this.recieved = false
        this.image = utils.image(utils.randChoice([
            "assets/IDE_eclipse.svg",
            "assets/IDE_intelij.png",
            "assets/IDE_phpstorm.png",
            "assets/IDE_pycharm.png",
            "assets/IDE_rubymine.jpeg",
            "assets/IDE_vs.jpeg",
            "assets/IDE_webstorm.jpeg",
            "assets/IDE_xcode.png"
        ]), 40, 40)
    };
    draw(){
        if (this.cX < game.playerX - 4 * game.blockSize || game.playerX + 9 * game.blockSize < this.cX || this.recieved){
            return;
        }
        ctx.drawImage(this.image, this.cX - game.playerX + game.realPX, this.cY - game.playerY + game.realPY, 40, 40)

    }
    collision(coordX, coordY){
        this.recieved = true
        game.elements.splice(game.elements.indexOf(this), 1)
    }
}

let utils = {
    image: (src, width = null, height = null) => {
        let res;
        if (width && height) {
            res = new Image(width, height);
        }else{
            res = new Image()
        }
        res.src = src;
        return res;
    },
    buildLevel: (level) => {
        level = level.split("\n")
        game.elements = []

        for (let y = 0; y < level.length; y++){
            for (let x = 0; x < 100; x++){
                switch (level[y][x]) {
                    case "b": // full block
                        game.elements.push(new Block(x, y))
                        game.blocksAt.add(JSON.stringify([x, y]))
                        break
                    case "p": // Player spawn
                        game.playerX = x * game.blockSize
                        game.playerY = y * game.blockSize
                        game.grounded = level[y + 1][x] !== " " && Boolean(level[y - 1][x])
                        break
                    case "i": // IDE
                        game.elements.push(new IDE(x, y))
                        break
                }
            }
        }
    },
    randChoice: (arr) => {
        return arr[Math.floor(Math.random() * arr.length)]
    },
    intersect: (s1, s2, direction= null) => {
        // I literally copied this from USACO Guide
        // From page: Broze - Rectangle Geometry
        // https://usaco.guide/bronze/rect-geo?lang=py
        let [bl_a_x, bl_a_y, tr_a_x, tr_a_y] = [s1[0], s1[1], s1[2], s1[3]]
        let [bl_b_x, bl_b_y, tr_b_x, tr_b_y] = [s2[0], s2[1], s2[2], s2[3]]

        if ((bl_a_x - game.charSize < bl_b_x && tr_a_x + game.charSize > tr_b_x && bl_b_y >= bl_a_y && tr_b_y <= tr_a_y)){
            return "top"
        }

        return !(bl_a_x >= tr_b_x || tr_a_x <= bl_b_x
            || bl_a_y >= tr_b_y || tr_a_y <= bl_b_y);
    },
    intersectElement: (element, direction = null) => {
        return utils.intersect([element.cX, element.cY, element.cX + game.blockSize, element.cY + game.blockSize], [game.playerX, game.playerY, game.playerX + game.blockSize, game.playerY + game.charSize], direction)
    },
    elementTop: () => {
        let cx1 = Math.floor(game.playerX / game.blockSize)
        let cx2 = Math.ceil(game.playerX / game.blockSize)
        let cy1 = Math.floor(game.playerY / game.blockSize)
        let cy2 = Math.ceil(game.playerY / game.blockSize)


        for (let x = cx1; x <= cx1; x++){
            for (let y = cy2; y <= cy2; y++){
                if (game.blocksAt.has(JSON.stringify([x, y - 1]))){
                    return true
                }
            }
        }
        return false
    },
    elementBottom: () => {
        let cx1 = Math.floor(game.playerX / game.blockSize)
        let cx2 = Math.ceil(game.playerX / game.blockSize)
        let cy1 = Math.floor(game.playerY / game.blockSize)
        let cy2 = Math.ceil(game.playerY / game.blockSize)

        for (let x = cx1; x <= cx2; x++){
            for (let y = cy1; y <= cy2; y++){
                if (game.blocksAt.has(JSON.stringify([x, y]))){
                    return true
                }
            }
        }
        return false
    },
}

let game = {
    assets: {
        background: utils.image("assets/background.png"),
        character: utils.image("assets/character.png")
    },
    colors: {
        block_border: "#02459e",
        block: "#1d53ad",
    },
    blockSize: 75,
    charSize: 65,
    elements: [],
    blocksAt: new Set(),
    blockBorderW: 10,
    // Positioning
    playerX: 0,
    playerY: 0,
    realPX: 225,
    realPY: 300,
    // Physics Weirdness
    speed: 15,
    acceleration: 0,
    accspeed: 3,
    jumpgoal: 0,
    jumping: false,
    grounded: true,
    // Others
    start: 0,
}


window.onload = function(){
    game.start = Date.now()
    let main = setInterval(frame, 1/48 * 1000)
}

let frame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    // Background image
    ctx.globalAlpha = 0.2
    ctx.drawImage(game.assets.background, 0, 0, 853, 533)
    ctx.globalAlpha = 1

    // Character
    ctx.drawImage(game.assets.character, game.realPX, game.realPY, game.charSize, game.charSize)

    keypress()

    // Acceleration/Falling Down
    game.grounded = utils.elementBottom() && !game.jumping
    if (game.jumping && game.playerY <= game.jumpgoal){
        game.accspeed = -1 * (game.accspeed + 2)
        game.jumping = false
    }
    else if (!game.grounded){
        game.acceleration += game.accspeed
        game.playerY += game.acceleration
    }

    // Time
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "right"
    ctx.font = "30px Monospace";

    let seconds = (Date.now() - game.start) / 1000
    ctx.fillText(`${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toFixed(1).padStart(4, 0)}`, canvas.width - 20, 40);

    // Game elements
    for (let element of game.elements){
        element.draw()
        let type = utils.intersectElement(element)
        if (type){
            if (!game.grounded){
                game.acceleration = 0
                game.grounded = true
                if (utils.elementTop()){
                    element.collision(game.playerX, element.cY + game.blockSize)
                    game.accspeed = -1 * (game.accspeed + 2)
                    game.jumping = false
                    game.grounded = false
                    frame()
                    break
                }
            }
            if (element.cY >= game.playerY){
                // Bottom Collision
                element.collision(game.playerX, element.cY - game.charSize)
                frame()
            }

        }
    }

    ctx.stroke()

}

utils.buildLevel(levels[0])

let keylog = {}

let keypress = () => {
    if (keylog["ArrowRight"]){
        game.playerX += game.speed
        for (let element of game.elements){
            if (utils.intersectElement(element) && element.cY < game.playerY){
                element.collision(element.cX - game.charSize, game.playerY)
            }
        }
    }
    if (keylog["ArrowLeft"]){
        game.playerX -= game.speed
        for (let element of game.elements){
            if (utils.intersectElement(element) && element.cY < game.playerY){
                element.collision(element.cX + game.blockSize, game.playerY)
            }
        }
    }
    if (keylog["ArrowUp"] && game.grounded){
        game.grounded = false
        game.jumping = true
        game.jumpgoal = game.playerY - game.charSize
        game.accspeed = game.accspeed * -1 - 2
    }
}

document.body.onkeydown = function(e){
    keylog[e.key] = true
}

document.body.onkeyup = function(e){
    keylog[e.key] = false
}