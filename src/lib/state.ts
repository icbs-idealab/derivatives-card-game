import { allRoleNames, defaultGame, defaultGamePlayer } from "./constants";
import { get, writable } from "svelte/store";
import { getAndWatchGame, getAndWatchLobby, getAuthenticatedUser, watchGame } from "./actions";
// import { makePlayers } from "./helpers";
import type { AppErrors } from "./types";
import type { AppGamePlayers, SupabaseUser } from "./types";
// import { makePlayers } from "./helpers";


// CONSOLIDATED APP STATE


export const appState = writable({
    game_id: null,
    players: [],
    deck: {
        revealed: [],
        hidden: [],
    },
    lobby: [],
})

export const showErrorReporter = writable(false)
export const appErrors = writable([] as AppErrors[])

// USER

export const defaultUser: SupabaseUser = {
    app_metadata: {
        provider: '',
        providers: [],
    },
    aud: '',
    confirmation_sent_at: '',
    confirmed_at: '',
    created_at: '',
    email: '',
    email_confirmed_at: '',
    id: '',
    identities: [],
    last_sign_in_at: '',
    phone: '',
    role: '',
    updated_at: '',
    user_metadata: {},
}

let gotUser = null
// export const currentUser = writable({...defaultUser}, () => {
export const currentUser = writable(
    defaultUser,
    onUserSubscribe
)

function onUserSubscribe(){
    console.log('getting authenticated user in writable store callback')
    console.log('already got user?: ', gotUser)
    console.log('current user: ', get(currentUser).id)
    if(!gotUser){
        getAuthenticatedUser()
        .then((result) => {
            gotUser = result
        })
        .catch(err => console.log('error getting auth user: ', err))
    }

    return () => console.log('destroyed user listener')
}

// PLAYERS

export function makePlayers(): AppGamePlayers {
    let p = {}
    allRoleNames.forEach((role) => {
        p[role] = { ...defaultGamePlayer, role}
    })
    return (p as AppGamePlayers)
}

// export const defaultPlayers = makePlayers()

// export const gamePlayers = writable({...defaultGamePlayers})
export const gamePlayers = writable(makePlayers())

// GAME

export const lobbyRequirements = writable({
    gamePlayers: null,
    lobbyPlayers: null,
})

export const lobby = writable([])

export const currentGame = writable({...defaultGame}, 
    () => {
        let activeUser = get(currentUser)
        console.log('result of user search in game store initialization: ', activeUser)
        if(activeUser && activeUser.user_metadata && activeUser.user_metadata.game_id){
            getAndWatchGame(activeUser.user_metadata.game_id)
        }
    }
)

export const gameTrades = writable([])

export const canTrade = writable({
    clubs: true,
    diamonds: true,
    hearts: true,
    spades: true,
})

export let canUpdatePrice = writable(false)

// LOADING / MODAL

export const showLoadingModal = writable(false)
export const showGameRules = writable(false)
export const showEndGameModal = writable(false)

// SUBSCRIPTIONS

export const serverSubscriptions = writable({
    game: null,
    // deck: null, admin only so can live under game
    players: null,
    trades: null,
    // playerReveals: null, // already watch players, only market owners can reveal their own cards, can keep in player/role record
    lobby: null,
    user: null,
    // local subs, different from postgres subs
})

export const localSubscriptions = writable({
    game: null,
    // deck: null, admin only so can live under game
    players: null,
    trades: null,
    // playerReveals: null, // already watch players, only market owners can reveal their own cards, can keep in player/role record
    lobby: null,
    user: null,
    // local subs, different from postgres subs
})


// RELOAD PAGE
export let reloadAfterRedirect = writable(false)