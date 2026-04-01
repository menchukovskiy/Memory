const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 1000;
canvas.height = 600;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        // меняем местами
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const gameState = {
    isRunning: false,
    isGameOver: false,
    isGameWon: false,
    isPaused: false,
    score: 0,
    level: 0,
    totalNumberCards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    cards: [],
    playingCards: [],
    timeToBackFlip: 2000,
    selectedCard: null,
    unGameCards: [],
    levels: [
        {
            name: 'Level 1',
            complication: 'Easy',
            timeToGameOver: 120, // seconds
            slots: 5
        },
        {
            name: 'Level 2',
            complication: 'Easy',
            timeToGameOver: 120, // seconds
            slots: 6
        },
        {
            name: 'Level 3',
            complication: 'Medium',
            timeToGameOver: 80, // seconds
            slots: 6
        }
    ],

    getStartWindow: () => {
        const startWindow = document.createElement('div')
        startWindow.classList.add('start-window')
        let selectedLevelOptions = '';

        gameState.levels.forEach((level, index) => {
            selectedLevelOptions += `<option value="${level.name}">${level.name} - ${level.complication}</option>`
        })

        startWindow.innerHTML = `
            <h3>Welcome to the Game!</h3>
            <select id="level-select">
                ${selectedLevelOptions}
            </select>
            <button id="start-button">Start Game</button>
        `
        document.body.appendChild(startWindow)
    },

    getGameCards: () => {

        const arrayofNumbers = [...gameState.totalNumberCards]

        for (let i = 0; i < gameState.level.slots; i++) {
            const index = Math.floor(Math.random() * arrayofNumbers.length);
            const value = arrayofNumbers.splice(index, 1)[0];

            gameState.cards.push(
                {
                    cover: `assets/${value}_front.png`,
                    name: `Card ${value}`
                }
            )

            gameState.cards.push(
                {
                    cover: `assets/${value}_front.png`,
                    name: `Card ${value}`
                }
            )
        }




    }
}


window.onload = function () {

    if (!gameState.isRunning) {
        gameState.getStartWindow()
    }

};

window.addEventListener('click', (event) => {
    const startButton = document.querySelector('#start-button')
    if (event.target === startButton) {
        const selectedLevelName = document.querySelector('#level-select').value
        gameState.level = gameState.levels.find(level => level.name === selectedLevelName)
        gameState.isRunning = true
        document.querySelector('.start-window').remove()

        console.log(gameState)
        startGame()
    }
})



class Card {
    constructor({ cover, position, name }) {
        this.x = position.x
        this.y = position.y
        this.width = 100
        this.height = 150
        this.cover = cover
        this.name = name
        this.isFlipped = true
        this.back = 'assets/back.png'
        this.click = false
    }

    draw() {
        const img = new Image()
        if (this.isFlipped) {
            img.src = this.cover
        } else {
            img.src = this.back
        }

        img.onload = () => {
            ctx.drawImage(img, this.x, this.y, this.width, this.height)
        }
    }
}

function startGame() {

    if (gameState.isRunning) {
        gameState.getGameCards()

        const shuffledCards = shuffle(gameState.cards)

        for (let i = 0; i < shuffledCards.length; i++) {

            const card = shuffledCards[i]
            const position = {
                x: 100 + (i % gameState.level.slots) * 120,
                y: 100 + Math.floor(i / gameState.level.slots) * 170
            }

            const cardInstance = new Card({
                cover: card.cover,
                position: position,
                name: card.name
            })

            gameState.playingCards.push(cardInstance)

        }

        gameState.playingCards.forEach(card => card.draw())

        setTimeout(() => {
            gameState.playingCards.forEach(card => {
                card.isFlipped = false
                card.draw()
            })
        }, gameState.timeToBackFlip)

    }





    canvas.addEventListener('click', (event) => {
        const clickX = event.clientX - canvas.getBoundingClientRect().left
        const clickY = event.clientY - canvas.getBoundingClientRect().top

        // Проверяем, был ли клик по карте
        gameState.playingCards.forEach(card => {
            if (
                clickX >= card.x &&
                clickX <= card.x + card.width &&
                clickY >= card.y &&
                clickY <= card.y + card.height
            ) {
                if (!card.click) {
                    card.click = true
                } else {
                    return
                }
                card.isFlipped = !card.isFlipped
                card.draw()

                if (gameState.selectedCard) {
                    if (gameState.selectedCard.name === card.name) {
                        console.log('Match found!')
                        gameState.unGameCards.push(gameState.selectedCard.name)
                        gameState.selectedCard = null
                    } else {
                        setTimeout(() => {
                            gameState.playingCards.forEach(c => {
                                if ( gameState.unGameCards.includes(c.name) ){
                                    return
                                }
                                c.isFlipped = false
                                c.click = false
                                c.draw()
                            })
                        }, 500)

                        gameState.selectedCard = null
                    }
                } else {
                    gameState.selectedCard = card
                }
            }
        })



    })

}








