import { allRoleNames, defaultBotParams, defaultErrorMessage, defaultGame, defaultGamePlayer, gamePhases } from "./constants";
import { get, writable } from "svelte/store";
import { getAndWatchGame, getAndWatchLobby, getAuthenticatedUser, watchBotParams, watchGame } from "./actions";
// import { makePlayers } from "./helpers";
import type { AppErrors, AppGamePlayersByRole, LobbyRequirements, ServerSubscriptions, UnassignedLobbyPlayer } from "./types";
import type { AppGamePlayers, SupabaseUser } from "./types";
import { Logger } from "./helpers";
// import { makePlayers } from "./helpers";


// CONSOLIDATED APP STATE
export const showArchivesModal = writable(false)
export const archives = writable([])

export const appMessage = writable(defaultErrorMessage)
export const showAppMessage = writable(false)
export const showErrorReporter = writable(false)
export const appErrors = writable([] as AppErrors)
export const noSuchGame = writable(false)

// USER
let defaultEmail = ''
export const showSignUpSuccessMessageWithEmail = writable(defaultEmail)

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

let gotUser: boolean | null = null
let retrievedUser: any = null
// export const currentUser = writable({...defaultUser}, () => {
export const currentUser = writable(
    defaultUser,
    onUserSubscribe
)

export const passwordUpdated = writable(false)
export const authChecked = writable(false)
export const showPasswordUpdater = writable(false)
function onUserSubscribe(){
    Logger(['getting authenticated user in writable store callback'])
    Logger(['already got user?: ', gotUser])
    Logger(['current user: ', get(currentUser).id])
    if(!gotUser || !retrievedUser){
        getAuthenticatedUser()
        .then((result) => {
            retrievedUser = result
            gotUser = true
        })
        .catch(err => Logger(['error getting auth user: ', err]))
    }

    return () => Logger(['destroyed user listener'])
}

// PLAYERS

export function makePlayers(): AppGamePlayersByRole {
    let p: any = {}
    allRoleNames.forEach((role) => {
        p[role] = { ...defaultGamePlayer, role}
    })
    return p
}

// export const defaultPlayers = makePlayers()

// export const gamePlayers = writable({...defaultGamePlayers})
export const gamePlayers = writable(makePlayers())

// GAME
export const lobbyRequirements = writable<LobbyRequirements>({
    gamePlayers: null,
    lobbyPlayers: null,
})

export const lobby = writable<UnassignedLobbyPlayer[]>([])

export const currentGame = writable({...defaultGame}, 
    () => {
        let activeUser = get(currentUser)
        Logger(['result of user search in game store initialization: ', activeUser])
        if(activeUser && activeUser.user_metadata && activeUser.user_metadata.game_id){
            getAndWatchGame(activeUser.user_metadata.game_id)
        }
        else {
            gameChecked.set(true)
        }
    }
)

export const gameTrades = writable<any[]>([])

export const canTrade = writable({
    clubs: true,
    diamonds: true,
    hearts: true,
    spades: true,
})

export let canUpdatePrice = writable(true)

// LOADING / MODAL

export const showLoadingModal = writable(false)
export const showGameRules = writable(false)
export const showEndGameModal = writable(false)

// SUBSCRIPTIONS

export const serverSubscriptions = writable<ServerSubscriptions>({
    game: null,
    // deck: null, admin only so can live under game
    players: null,
    trades: null,
    // playerReveals: null, // already watch players, only market owners can reveal their own cards, can keep in player/role record
    lobby: null,
    user: null,
    // bot
    bot: null
})

// local subs, different from postgres subs

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

// fix 
export const gameChecked = writable(false)
export const tradesChecked = writable(false)
export const playersChecked = writable(false)

// BOT

function onBotSubscribe(){
    Logger(['Will start watching bots'])
    watchBotParams()
    return () => Logger(['stopped watching bots'])
}

export const botParams = writable(defaultBotParams, onBotSubscribe)

export const gamePhase = writable(gamePhases[0])