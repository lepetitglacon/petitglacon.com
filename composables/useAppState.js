
const APP_STATES = {
    MAIN: 'main',
    GAME: 'game',
}

let appState = ref(APP_STATES.MAIN)
const setAppState = (state) => {
    appState.value = state
}

export {appState, APP_STATES, setAppState}