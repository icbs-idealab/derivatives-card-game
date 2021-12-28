import { supabase } from "$lib/backend"
import { get } from "svelte/store"
import { allRoleNames, defaultGame, defaultUser } from "./constants"
import { buildShuffledDeck, makeGamePlayers, redirect } from "./helpers"
import type { UserMetaDataValues } from "./new-types"
import { serverSubscriptions, currentGame, currentUser, showLoadingModal, showGameRules, showErrorReporter, gamePlayers, lobbyRequirements } from "./state"
import type { AppGamePlayers, NewGameProps, SupabaseUser } from "./types"
import {nanoid} from 'nanoid'
import { page } from "$app/stores"

// USER

export const updateActiveUser = (newUserDetails: SupabaseUser) => {
    // console.log('updating user details: ', newUserDetails)
    currentUser.update(current => ({...current, ...newUserDetails}))
}

// export function updateUserMetadata(params){
//     currentUser.update(current => ({...current, user_metadata: {
//         ...current.user_metadata,
//         ...params
//     }}))
// }
export const createUser = async (email: string) => {
    let password = 'test123'
    console.log('creating with faux password = ', password)
    let { user, error } = await supabase.auth.signUp({
        email,
        password
    })

    return { user, error }
}

export const resetUser = () => currentUser.update(() => ({...defaultUser}))


// cannot subscribe to supabase users so will rely on calling this function whenever the _layout component is mounted to check for authenticated users

export const getAuthenticatedUser = async () => {
    // console.log('getting authenticated user(): ')
    let user: SupabaseUser | null = await supabase.auth.user()
    let current = get(currentUser)
    let subs = get(serverSubscriptions)
        
    let a = {
        id: current.id,
        meta: current.user_metadata,
    }

    let b = {
        id: user && user.id,
        meta: user && user.user_metadata,
    }

    let isDifferent = JSON.stringify(a) !== JSON.stringify(b)
    
    // console.log('User A: ', a)
    // console.log('User B: ', b)
    // console.log('is different: ', isDifferent)

    if(user && isDifferent){
        console.log('got different user: ', user)
        updateActiveUser(user)  
    }

    return user
}

export const updateUserMetadata = async (values: UserMetaDataValues) => {
    const {data, error} = await supabase.auth.update({
        data: {
            ...values
        }
    })

    return !error 
}

export const requestAccess = async (email: string, message: string) => {
    let { body, error } = await supabase.from('requests')
    .insert([{
        email,
        message,
    }])

    return {body, error}
}

export const signIn = async (email: string, password: string) => {
    let { user, error } = await supabase.auth.signIn({
        email,
        password
    })

    return {user, error}
}

export const singOut = async () => {
    let { error } = await supabase.auth.signOut()
    if(!error){
        updateActiveUser(null)
    }
    return { error}
}

// PLAYER

export const getPlayerData = async (game_id: string) => {
    console.log('getting player data for: ', game_id)    
    let {data, error} = await supabase.from('game-players')
        .select('*')
        .eq('game_id', game_id)

    console.log('player data: ', data)

    return {data: data ? data[0] : data, error, success: !error}
}

export const watchPlayers = async (game_id: string) => {
    console.log('attempting to watch players... ', game_id)
    if(game_id){
        const players = await supabase
            .from(`game-players:game_id=eq.${game_id}`)
            // .select('game_id,admin,round,started,ended,completed,maximum_spread')
            .on('UPDATE', (payload) => {
                // update game object in app state
                console.log('got game-players update: ', payload)
                // updateGamePlayers({players: payload.new})
                syncGamePlayers(payload.new)
            })
            .subscribe()

        // set player watcher 
        serverSubscriptions.update((current) => ({...current, players: players}))

        return players
    }
}

export const getAndWatchPlayers = async (game_id: string) => {
    if(game_id){
        console.log('getting and watching players')
        let players = await getPlayerData(game_id)
        
        if(players.data && typeof Array.isArray(players.data)) {
            syncGamePlayers(players)
            lobbyRequirements.update(original => {
                return {
                    ...original,
                    gamePlayers: players.data
                }
            })
        }

        await watchPlayers(game_id)
        return players
    }
}

export function syncGamePlayers(update){
    gamePlayers.update(currentPlayers => {
        // players.data
        let newPlayers = [...currentPlayers]
        
        if(Array.isArray(update)){

            update.map(player => {
                let index = newPlayers.findIndex(oldPlayer => oldPlayer.role === player.role)
                newPlayers[index] = {
                    ...newPlayers[index],
                    ...player
                }
            })

        }
        else{
            let index = newPlayers.findIndex(oldPlayer => oldPlayer.role === update.role)
            newPlayers[index] = {
                ...newPlayers[index],
                ...update
            }
        }
    
        return newPlayers    
    })
}

const getPlayersFromLobby = async (game_id) => {
    const {data, error} = await supabase.from('game-lobby')
        .select('*')
        .eq('game_id', game_id)
    console.log("new lobby players: ", data)
    return {data, success: !error, error}
}

const watchLobby = async (game_id: string) => {
    const subscription = await supabase.from(`game-lobby:game_id=eq.${game_id}`)
        .on('INSERT', (payload) => {
            console.log('got new lobby payload: ', payload)
            syncLobby(payload.new)
        })
        .subscribe()

    console.log('watchLobby() -> subscribed to lobby: ', subscription)

    serverSubscriptions.update((current) => ({...current, lobby: subscription}))
}

export const getAndWatchLobby = async (game_id: string) => {
    if(game_id){
        console.log('getting lobby players')
        let players = await getPlayersFromLobby(game_id)
        if(players.data) {
            syncLobby(players.data)
            lobbyRequirements.update(original => {
                return {
                    ...original,
                    lobbyPlayers: players.data
                }
            })
        }
        
        await watchLobby(game_id)
    }
}

export function syncLobby(update){
    gamePlayers.update(currentPlayers => {
        // players.data
        let newPlayers = [...currentPlayers]
        
        if(Array.isArray(update)){

            update.map(player => {
                let index = newPlayers.findIndex(oldPlayer => oldPlayer.role === player.role)
                newPlayers[index] = {
                    ...newPlayers[index],
                    ...player
                }
            })

        }
        else{
            let index = newPlayers.findIndex(oldPlayer => oldPlayer.role === update.role)
            newPlayers[index] = {
                ...newPlayers[index],
                ...update
            }
        }
    
        return newPlayers    
    })
}


async function insertPlayer(game_id, player){
    const {data, error} = await supabase
        .from(`game-lobby`)
        .insert([
            {
                user_id: player.user_id,
                game_id: game_id,
                player_name: player.player_name,
            }
        ])

    return {data, error, success: !error}
}

function checkGameForAvailableRoles(playerData){
    console.log('checking against: ', playerData)
        let count = 0
        // let ps = Object.keys(playerData)
        allRoleNames.map(role => {
            playerData[role].user_id === "" && (count += 1)
        })

        return count !== allRoleNames.length
}

export async function joinLobby(game_id, player){

    getPlayerData(game_id)
    .then(async playerData => {
        return checkGameForAvailableRoles(playerData.data) 
        // ? true : false
    })
    .then(async canJoin => {
        if(canJoin){
            return insertPlayer(game_id, player)
        }
        return false
    })
    .then(async insertedPlayer => {
        insertedPlayer && updateUserMetadata({game_id})
    })
    .then(async res => {
        console.log('joined lobby, updated player record. hide loading modal: ', res)
        redirect('/game')
        setLoadingModal(false)
    })
    .catch(err => {
        console.log('error joining lobby: ', err)
    })
}

// GAME

export const createNewGame = async ({user, creatorRole, maximumSpread, playerName}: NewGameProps) => {
    setLoadingModal({value: true})

    // create new game
    const game_id = nanoid(12)
    const newGame = {
        ...defaultGame,
        game_id,
        admin: {
            user_id: user.id,
            role: creatorRole,
            player_name: playerName
        },
        maximum_spread: maximumSpread,
        // deck now lives in game since only admin can affect
        deck: {}
    }

    // create new game deck

    const shuffledDeck = buildShuffledDeck()
    newGame.deck = {
        held: shuffledDeck.shuffled,
        reveals: [],
    }

    // create game players

    const newGamePlayers: AppGamePlayers = makeGamePlayers({
        adminRole: creatorRole,
        adminId: user.id,
        adminName: playerName,
        roleHands: shuffledDeck.roleHands,
        gameId: game_id
    })

    // console.log('made new deck: ', newGameDeck)
    // console.log('made new player list: ', newPlayersRecord)
    // console.log('made new game: ', newGame)
    
    const makeGame =  new Promise( async (resolve, reject) => {
        const {data, error} = await supabase.from('games')
            .insert([
                {...newGame}
            ])
            .select('game_id,admin,round,started,ended,completed,maximum_spread,deck')
            .limit(1)
            .single()
        
        console.log('result of making game: ', data)
        console.log('errors in making game: ', error)
        
        let type = "game"
            let res = data && data.length && data.length > 1 ?
                data[0]
                : data

        !error ?
            resolve({data: res, error: null, success: true, type})
            : reject({error, data: null, success: false, type})
    })

    const updateCreatorRecord = new Promise( async (resolve, reject) => {
        const {data, error} = await supabase.auth.update({
            data: {
                game_id,
                admin: true,
                player_name: playerName,
                role: creatorRole
            }
        })

        console.log('result of updating creator: ', data)
        console.log('result of updating creator: ', error)

        let type = "creator"

        !error ? 
            resolve({data, error: null, success: true, type})
            : reject({data: null, error, success: false, type})
    })

    const makeNewPlayers = new Promise( async (resolve, reject) => {
        const {data, error} = await supabase.from('game-players')
            .insert(newGamePlayers)
            .select('user_id,player_name,hand,revealed,role,buy,sell')
            
        console.log('result of making players: ', data)
        console.log('errors while making players: ', error)

        let type = "players"

        !error ?
            resolve({data: data, error: null, success: true, type})
            : reject({error, data: null, success: false, type})
    })

    return Promise.all([
            makeGame, 
            updateCreatorRecord, 
            makeNewPlayers, 
        ])
        .then(res => {
            console.log('successfully handled all promises: ', res)
            // redirect to game 
            // return {res, game_id}
            viewCreatedGame(res)
            return game_id
        })
        .catch(err => {
            console.log('err creating new game: ', err)
            return err
            // log error in app
        })
        .finally(() => {
            setLoadingModal(false)
        })
}

const viewCreatedGame = async (creationResults: any[]) => {
    let game = creationResults.filter(cr => cr.type === 'game')[0].data
    console.log('game: ', game)
    if(game){
        currentGame.set(game)
        if(!get(serverSubscriptions).game){
            await watchGame(game.game_id)
        }
    }
}

export async function getGame(game_id){
    let {data, error} = await supabase.from('games')
        .select('*')
        .eq('game_id', game_id)
        .limit(1)
        .single()

    if(error){
        // set application wide error notifications here
        console.log('error getting game ', game_id)
        console.error(error)
        return null
    }

    console.log('got game data: ', data)

    return data
}

export async function watchGame(game_id){
    console.log('attempting to watch game...', game_id)
    let subs = get(serverSubscriptions)
    if(game_id && !subs.game){
        console.log('subscribing to game')
        const game = await supabase
            .from(`games:game_id=eq.${game_id}`)
            // .from(`games`)
            // .select('game_id,admin,round,started,ended,completed,maximum_spread')
            .on('*', (payload) => {
                // update game object in app state
                console.log('got game update: ', payload)
                currentGame.set(payload.new)
            })
            .subscribe()
        
        serverSubscriptions.update(original => ({...original, game}))
        console.log('game subscription: ', game)
    }
}

export async function getAndWatchGame(game_id){
    let game = await getGame(game_id)
    if(game && !get(serverSubscriptions).game){
        currentGame.set(game)
        await watchGame(game_id)
    }
    return game
}

export async function leaveGame(){
    setLoadingModal({value: true})
    await supabase.auth.update({
        data: {
            game_id: '',
            player_id: '',
            role: '',
        }
    })

    setLoadingModal({value: false})

    setTimeout(() => {
        redirect("/")
    })
}


// UI

export const setLoadingModal = (newState) => {
    showLoadingModal.set(newState)
}


// ERRORS

export function displayErrorReporter(state: boolean){
    showErrorReporter.set(state)
}

// Rules

export function displayRules(state: boolean){
    showGameRules.set(state)
}

