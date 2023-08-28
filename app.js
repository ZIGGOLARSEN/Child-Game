'use strict'

// constants affecting game appearence and settings
const SIZE_OF_GRID = 3
const TIME_PER_BUTTON = 5
const GAME_DURATION = SIZE_OF_GRID**2 * TIME_PER_BUTTON

// global variables to be referenced anytime 
const container = document.getElementById('button_container')

const time_bar_container = document.querySelector('.time-bar-container')
const time_bar = document.querySelector('.time-bar')

const result_container = document.querySelector('.result-container')
const start = document.querySelector('.start')

const time_performace_color_map = {
    1: ['excellent', 'rgb(29, 2, 124)', 'rgb(93, 93, 238)'],
    2: ['very good', 'rgb(0, 190, 190)', 'aqua'],
    3: ['good', 'rgb(0, 179, 0)', 'rgb(103, 255, 103)'],
    4: ['ok', 'rgb(255, 200, 0)', 'rgb(255, 255, 0, 0.5)'],
    5: ['not appealing', 'rgb(220, 20, 0)', 'rgb(255, 0, 0, 0.6)'],
}

const time_per_one_color = GAME_DURATION / Object.keys(time_performace_color_map).length

const correct_list = Array.from({ length: SIZE_OF_GRID**2 }, (_, index) => index + 1);

// setup global variables which will be reseted every game
let game_state;
let interval;
let answer_list = []
let correct_buttons = []
let mistaken_buttons = []
let errors = 0


// html button setup functions
const generate_random_array  = n_rows => {
    const list = Array.from({ length: n_rows**2 }, (_, index) => index + 1);

    const shuffled_array = []

    while (list.length > 0) {
        const idx = Math.floor(Math.random() * list.length)
        const removed_element = list.splice(idx, 1)[0]
        shuffled_array.push(removed_element)
    }

    return shuffled_array
}

const generate_buttons = n_rows => {
    const button_container = document.getElementById("button_container")
    const random_array = generate_random_array(n_rows)
    let html = ""

    for (let i=0; i < n_rows**2; i++){
        const random_num = random_array[i]
        html += `<button id=${i+1} data-value=${random_num} class='default'>${random_num}</button>\n`
    }

    button_container.innerHTML += html
}


generate_buttons(SIZE_OF_GRID)
container.style.gridTemplateColumns = `repeat(${SIZE_OF_GRID}, 1fr)`



const buttons = document.querySelectorAll('button')


const event_listener_callback_function = e => {
    const value = e.target.getAttribute('data-value')

    if (Number(value) === correct_list[answer_list.length]) {
        if (correct_buttons.length) correct_buttons[correct_buttons.length - 1].classList.remove('blinking-button')

        answer_list.push(Number(value))

        correct_buttons.push(e.target)
        correct_buttons.forEach(button => button.classList.add('correct'))

        mistaken_buttons.forEach(button => button.classList.remove('mistake'))
        mistaken_buttons = []

        if (correct_buttons.length !== correct_list.length) correct_buttons[correct_buttons.length - 1].classList.add('blinking-button')
    } else {
        mistaken_buttons.push(e.target)
        mistaken_buttons.forEach(button => button.classList.add('mistake'))
        errors += 1
    }
}

const control_time_bar = time => {
    const time_bar_width_percent = (time * 100) / time_per_one_color % 100
    const time_group = Math.floor(time / time_per_one_color) + 1

    time_bar.style.width = `${time_bar_width_percent}%`
    time_bar_container.style.width = '50%'
    time_bar.style.backgroundColor = time_performace_color_map[time_group][1]
    time_bar_container.style.backgroundColor = time_performace_color_map[time_group][2]
}

function start_game() {
    let time = 0

    buttons.forEach(button => {
        button.addEventListener('click', event_listener_callback_function)
    })

    interval = setInterval(() => {
        time += 0.01

        if (time >= GAME_DURATION || answer_list.length === correct_list.length) {
            clearInterval(interval)
            buttons.forEach(button => button.removeEventListener('click', event_listener_callback_function))
            result_container.innerHTML = `Finished in ${time.toFixed(1)} seconds you made ${errors}
            mistakes and left ${correct_list.length - answer_list.length} unanswered`
        } else control_time_bar(time)

    }, 10)

    return time
}

const setup = () => {
    clearInterval(interval)
    answer_list = []
    correct_buttons = []
    mistaken_buttons = []
    errors = 0
    result_container.innerHTML = ''

    buttons.forEach(button => {
        button.classList.remove('correct')
        button.classList.remove('mistake')
        button.classList.remove('blinking-button')
        button.removeEventListener('click', event_listener_callback_function)
    })

    time_bar.style.width = 0
    time_bar_container.style.width = 0
}

function set_game_state(game_state) {
    setup()
    if (game_state === 'start') start_game()
}

document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', e => {
        if (game_state === e.target.innerHTML) return

        game_state = e.target.innerHTML
        set_game_state(game_state)
    })
})