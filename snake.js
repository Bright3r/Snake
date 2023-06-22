const BLOCK_SIZE = 10
const WIDTH = 300
const HEIGHT = 300
const FPS = 10

let isRunning = true

const startup = () => {
    const canvas = document.getElementById("canvas")
    const context = canvas.getContext("2d")

    const score = document.getElementById("score")

    let snake = new Snake([{x: 10, y: 10}], BLOCK_SIZE)
    let apple = new Apple(50, 150, BLOCK_SIZE, "rgb(200, 0, 0)")

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case "w":
                if (snake.direction !== "DOWN") {
                    snake.setDirection("UP")
                }
                break
            case "s":
                if (snake.direction != "UP") {
                    snake.setDirection("DOWN")
                }
                break
            case "a":
                if (snake.direction != "RIGHT") {
                    snake.setDirection("LEFT")
                }
                break
            case "d":
                if (snake.direction != "LEFT") {
                    snake.setDirection("RIGHT")
                }
                break
        }
    })  

    const gameLoopInterval = setInterval(
        () => {
            if (isRunning) {
                update(context, snake, apple, score)
            }
            else {
                gameOver(context, gameLoopInterval)
            }
        }, 1000/FPS)

    }

const update = (context, snake, apple) => {
    clearScreen(context, "rgb(0, 0, 0)")

    snake.move()
    snake.checkCollisions(apple)

    snake.draw(context)
    apple.draw(context)
}

const clearScreen = (context, color) => {
    context.fillStyle = color
    context.fillRect(0, 0, WIDTH, HEIGHT)
}

const gameOver = (context, gameLoopInterval) => {
    clearInterval(gameLoopInterval)

    clearScreen(context, "rgb(0, 0, 0)")
    context.fillStyle = "rgb(255, 255, 255)"
    context.fillText("Game Over", WIDTH / 2, HEIGHT / 2)
}

class Snake {
    constructor(body, blockSize) {
        this.body = body
        this.blockSize = blockSize
        this.direction = "RIGHT"
        this.color = "rgb(0, 255, 0)"
        this.isInputEnabled = true
        this.nextInput = null
    }

    draw(context) {
        context.fillStyle = this.color
        for (const pos of this.body) {
            context.fillRect(pos.x, pos.y, this.blockSize, this.blockSize)
        }
    }

    setDirection(newDirection) {
        if (this.isInputEnabled) {
            this.direction = newDirection
            this.isInputEnabled = false
        }
        else {
            this.nextInput = newDirection
        }
    }

    move() {
        let nextBlock = {...this.body[0]}
        if (this.direction === "UP") {
            nextBlock.y -= this.blockSize
        }
        else if (this.direction === "DOWN") {
            nextBlock.y += this.blockSize
        }
        else if (this.direction === "LEFT") {
            nextBlock.x -= 10
        }
        else if (this.direction === "RIGHT") {
            nextBlock.x += 10
        }

        this.body.unshift(nextBlock)
        this.body.pop()

        // run buffered input after prev input executes
        if (this.nextInput != null) {
            this.direction = this.nextInput
            this.nextInput = null
            this.move()
        }

        // only allow users one input per frame
        this.isInputEnabled = true
    }

    grow() {
        this.body.unshift({...this.body[0]})
    }

    checkCollisions(apple) {
        let head = {...this.body[0]}
        // check border collisions
        if (head.x < 0 || head.x > (WIDTH - this.blockSize) || head.y < 0 || head.y > (HEIGHT - this.blockSize)) {
            isRunning = false
        }

        // check apple collisions
        if ((head.x === apple.x) && (head.y === apple.y)) {
            this.grow()
            apple.move()
        }

        head = {...this.body[0]}
        // check snake body collisions
        for (let i = 2; i < this.body.length; i++) {
            if (this.body[i].x === head.x && this.body[i].y === head.y) {
                isRunning = false
            }
        }
    }
}

class Apple {
    constructor(x, y, blockSize) {
        this.x = x
        this.y = y
        this.blockSize = blockSize
        this.color = "rgb(255, 0, 0)"

        this.score = new Score()
        this.score.update()
    }

    draw(context) {
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, this.blockSize, this.blockSize)
    }

    move() {
        this.x = this.blockSize * Math.floor(Math.random() * (WIDTH / this.blockSize))
        this.y = this.blockSize * Math.floor(Math.random() * (HEIGHT / this.blockSize))
        this.score.update()
    }
}

class Score {
    constructor() {
        this.score = -1
        this.scoreBox = document.getElementById("score")
    }

    update() {
        this.score++
        this.scoreBox.textContent = this.score
    }
}