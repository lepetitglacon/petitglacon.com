
const APP_STATES = {
    MAIN: 'main',
    GAME: 'game',
}

let appState = APP_STATES.MAIN
const setAppState = (state) => {
    appState = state
}

export {appState, APP_STATES, setAppState}