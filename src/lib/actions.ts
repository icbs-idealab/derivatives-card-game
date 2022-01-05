import { supabase } from "$lib/backend"
import { get } from "svelte/store"
import { allRoleNames, defaultGame, defaultUser, playerRevealRounds } from "./constants"
import { buildShuffledDeck, Logger, makeGamePlayers, redirect } from "./helpers"
import type { UserMetaDataValues } from "./new-types"
import { serverSubscriptions, currentGame, currentUser, showLoadingModal, showGameRules, showErrorReporter, gamePlayers, lobbyRequirements, lobby, gameTrades, canTrade, reloadAfterRedirect, appMessage, noSuchGame, authChecked } from "./state"
import type { AppGamePlayers, MessageParams, NewGameProps, SupabaseUser } from "./types"
import {nanoid} from 'nanoid'

// USER

export const updateActiveUser = (newUserDetails: SupabaseUser) => {
    // Logger(['updating user details: ', newUserDetails])
    currentUser.update(current => ({...current, ...newUserDetails}))
}

export const createUser = async (email: string) => {
    let password = 'test123'
    Logger(['creating with faux password = ', password])
    let { user, error } = await supabase.auth.signUp({
        email,
        password
    })

    return { user, error }
}

export const resetUser = () => currentUser.update(() => ({...defaultUser}))

// cannot subscribe to supabase users so will rely on calling this function whenever the _layout component is mounted to check for authenticated users

export const getAuthenticatedUser = async () => {
    // Logger(['getting authenticated user(): '])
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
    
    // Logger(['User A: ', a])
    // Logger(['User B: ', b])
    // Logger(['is different: ', isDifferent])

    if(user && isDifferent){
        Logger(['got different user: ', user])
        updateActiveUser(user)  
    }

    authChecked.set(true)

    return user
}

export const checkIfPasswordChanged = async (user) => {
    return await supabase
        .from('password-changed')
        .select("*")
        .eq('user_id', user.id)
        .limit(1)
}

export const updatePassword = async (password: string) => {
    let returnObject = {
        user: null,
        supabase: null,
    }

    returnObject.user  = await supabase.auth.update({password})

    if(returnObject.user.data){
        returnObject.supabase = await supabase
            .from('password-changed')
            .insert([{user_id: returnObject.user.data.id}])
            .select("*")

        currentUser.set(returnObject.user)
    }    

    return returnObject
}

export const updateUserMetadata = async (values: UserMetaDataValues) => {
    Logger(['updating user meta data: ', values])
    const {data, error} = await supabase.auth.update({
        data: values
    })

    if(error){
        Logger(['error updating user metadata: ', error])
    }
    else if(data){
        currentUser.set(data)
    }
    return data
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

export const updatePlayer = async (newData, game_id, user_id) => {
    return await supabase.from('game-players')
        .update(newData)
        .select('*')
        .eq('game_id', game_id)
        .eq('user_id', user_id)
}

export const revealPlayerCard = async (newPlayerData, game_id, user_id) => {
    const {data, error} = await updatePlayer(newPlayerData, game_id, user_id)
    data !== null && Logger(['result of player update: ', data])
    error !== null && Logger(['error updating player: ', data])
    return {data, error, success: !error}
}

export const updatePlayerPrices = async (newPrices) => {
    let game_id = get(currentGame).game_id
    let user_id = get(currentUser).id

    const {data, error} = await updatePlayer(newPrices, game_id, user_id)
    data !== null && Logger(['result of player price update: ', data])
    error !== null && Logger(['error updating player prices: ', error])
    return {data, error, success: !error}
}

export const getPlayerData = async (game_id: string) => {
    Logger(['getting player data for: ', game_id])
    let {data, error} = await supabase.from('game-players')
        .select('*')
        .eq('game_id', game_id)

    Logger(['player data: ', data])

    return {data, error, success: !error}
}

export const watchPlayers = async (game_id: string) => {
    Logger(['attempting to watch players... ', game_id])
    if(game_id){
        const players = await supabase
            .from(`game-players:game_id=eq.${game_id}`)
            // .select('game_id,admin,round,started,ended,completed,maximum_spread')
            .on('UPDATE', (payload) => {
                // update game object in app state
                Logger(['got game-players update: ', payload])
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
        Logger(['getting and watching players'])
        let players = await getPlayerData(game_id)
        
        if(players.data && typeof Array.isArray(players.data)) {
            syncGamePlayers(players.data)
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
    Logger(['syncing players with update value: ', update])
    gamePlayers.update(currentPlayers => {
        // players.data
        // players.data
        Logger(['current players: ', currentPlayers])

        let newPlayers = {...currentPlayers}
        
        if(Array.isArray(update)){

            update.map(player => {
                newPlayers[player.role] = {
                    ...newPlayers[player.role],
                    ...player
                }
            })

        }
        else{
            // let index = newPlayers.findIndex(oldPlayer => oldPlayer.role === update.role)
            newPlayers[update.role] = {
                ...newPlayers[update.role],
                ...update
            }
        }

        Logger(['data before syncing players: ', newPlayers])
    
        return newPlayers    
    })
}

const getPlayersFromLobby = async (game_id) => {
    const {data, error} = await supabase.from('game-lobby')
        .select('*')
        .eq('game_id', game_id)
    Logger(["new lobby players: ", data])
    return {data, success: !error, error}
}

const watchLobby = async (game_id: string) => {
    const subscription = await supabase.from(`game-lobby:game_id=eq.${game_id}`)
        .on('INSERT', (payload) => {
            Logger(['got new lobby payload: ', payload])
            syncLobby(payload.new)
        })
        .on('DELETE', (payload) => {
            Logger(['got new lobby deletion payload: ', payload])
            syncLobby(payload.new, true)
        })
        .subscribe()

    Logger(['watchLobby() -> subscribed to lobby: ', subscription])

    serverSubscriptions.update((current) => ({...current, lobby: subscription}))
}

export const getAndWatchLobby = async (game_id: string) => {
    if(game_id){
        Logger(['getting lobby players'])
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

export function syncLobby(update, remove: boolean = false){
    lobby.update(currentLobbyPlayers => {
        // players.data
        Logger(['syncing... current lobby players: ', currentLobbyPlayers])

        let currentPlayers = [...currentLobbyPlayers]
        
        if(Array.isArray(update)){
            Logger(['syncing. New payload is Array'])
            update.map(player => {
                let index = currentPlayers.findIndex(currentPlayer => currentPlayer.user_id === player.user_id)
                remove && index !== -1 && currentPlayers.splice(index, 1)
                !remove && index === -1 && currentPlayers.push({...player})
                // player already exists
                !remove && index !== -1 && Logger(['player with given ID already exists in local lobby will not update'])
            })
        }
        else{
            let index = currentPlayers.findIndex(currentPlayer => currentPlayer.user_id === update.user_id)
            Logger(['syncing. New payload is Object. Index was: ', index])
            remove && index !== -1 && currentPlayers.splice(index, 1)
            !remove && index === -1 && currentPlayers.push({...update})
        }
    
        return currentPlayers    
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
    Logger(['checking against: ', playerData])
        let count = 0
        // let ps = Object.keys(playerData)
        playerData.map(player => {
            player.user_id === "" && (count += 1)
        })

        // compare to allRoleNames in case some error prevented
        return count !== allRoleNames.length
}

export async function joinLobby(game_id, player){

    // first check if such a game exists

    const {data, error} = await getGame(game_id)

    Logger(['joining lobby with game: ', data])
    Logger(['joining lobby with game error: ', error])

    if(error){
        showMessage({
            message: 'Error joining game',
            errorMessage: error.message,
            caller: 'joinLobby',
            params: JSON.stringify({game_id}),
            timestamp: Date.now()
        })
        setLoadingModal(false)
    }
    else if(data){
        // then get players etc
    
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
            return insertedPlayer ? updateUserMetadata({game_id, player_name: player.player_name}) : false
        })
        .then(async res => {
            Logger(['joined lobby, updated player record. redirect to game then refresh: ', res])
            redirect('/game')
            // setTimeout(() => {
            //     reloadAfterRedirect.set(true)
            // }, 1500)
            // do not to stop showing loading modal as will be reloading page after redirect
            // setLoadingModal(false)
        })
        .catch(err => {
            Logger(['error joining lobby: ', err])
        })
    }

}

// GAME

export const createNewGame = async ({user, creatorRole, maximumSpread, playerName}: NewGameProps) => {
    setLoadingModal(true)

    // create new game
    const game_id = nanoid(12)
    const newGame = {
        ...defaultGame,
        game_id,
        admin: {
            user_id: user.id,
            game_id,
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
        revealed: [],
    }

    // create game players

    const newGamePlayers: AppGamePlayers = makeGamePlayers({
        adminRole: creatorRole,
        adminId: user.id,
        adminName: playerName,
        roleHands: shuffledDeck.roleHands,
        gameId: game_id
    })

    // Logger(['made new players: ', newGamePlayers])
    // Logger(['made new game: ', newGame])

    // if(false){

        const makeGame =  new Promise( async (resolve, reject) => {
            const {data, error} = await supabase.from('games')
                .insert([
                    {...newGame}
                ])
                .select('game_id,admin,round,started,ended,completed,maximum_spread,deck')
                .limit(1)
                .single()
            
            Logger(['result of making game: ', data])
            Logger(['errors in making game: ', error])
            
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
    
            Logger(['result of updating creator: ', data])
            Logger(['error updating creator?: ', error])
    
            let type = "creator"
    
            !error ? 
                resolve({data, error: null, success: true, type})
                : reject({data: null, error, success: false, type})
        })
    
        const makeNewPlayers = new Promise( async (resolve, reject) => {
            const {data, error} = await supabase.from('game-players')
                .insert(newGamePlayers)
                .select('user_id,player_name,hand,revealed,role,buy,sell')
                
            Logger(['result of making players: ', data])
            Logger(['errors while making players: ', error])
    
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
                Logger(['successfully handled all promises: ', res])
                // redirect to game 
                // return {res, game_id}
                viewCreatedGame(res)
                return game_id
            })
            .catch(err => {
                Logger(['err creating new game: ', err])
                return err
                // log error in app
            })
            .finally(() => {
                setLoadingModal(false)
            })

    // }
}

const viewCreatedGame = async (creationResults: any[]) => {
    let game = creationResults.filter(cr => cr.type === 'game')[0].data
    reloadAfterRedirect.set(true)
    Logger(['game: ', game])
    if(game){
        currentGame.set(parseGameData(game))
        if(!get(serverSubscriptions).game){
            await watchGame(game.game_id)
        }
    }
}

export const assignGamePlayers = async (game_id, roleAssignments) => {
    // assign player roles
    return Promise.all(
        roleAssignments.map(async (player) => {
            // try {
                // results[player.role] = await supabase
                return await supabase
                    .from('game-players')
                    .update({
                        player_name: player.player_name,
                        user_id: player.user_id,
                    })
                    .select("*")
                    .eq('game_id', game_id)
                    .eq('role', player.role)
            // }
            // catch(err){
            //     Logger([`error assigning player ${player.role}: `, err])
            // }
        })
    )
    .then(res => {
        Logger(['successfully assigned all game roles: ', res])
        return res
    })
    .catch(err => {
        Logger(['error assigning players before game start: ', err])
    })
}

export async function updateGame(updateValue){
    let game = get(currentGame)
    let {game_id} = game
    if(game_id){
        let {data, error} = await supabase
            .from(`games`)
            .update(updateValue)
            .eq('game_id', game_id)

        if(!error){
            Logger(['successfully updated game: ', data])
            return {data, success: true}
        }
        else{
            Logger(['error starting game: ', error])
            return {error, success: false}
        }

    }
}

export const removeFromLobby = async (game_id) => {
    const {data, error} = await supabase
        .from('game-lobby')
        .delete()
        .eq("game_id", game_id)

        if(error){
            Logger(['error removing players from lobby: ', error])
        }

        return {data, error, success: !error}
}

export const setFinalGameScores = async (final_scores) => {
    // let game = get(currentGame)
    let updateResult = await updateGame({final_scores, ended: true, completed: true})
    return updateResult
}

export const startGame = async () => {
    let game = get(currentGame)
    let updateResult = await updateGame({started: true, round: 1})
    let lobbyDeletion = await removeFromLobby(game.id)
    return updateResult
}

export const deletePlayers = async (game_id: string) => {
    return await supabase
        .from('game-players')
        .delete()
        .eq("game_id", game_id)
}

export const deleteTrades = async (game_id: string) => {
    return await supabase
        .from('game-trades')
        .delete()
        .eq("game_id", game_id)
}

export async function archiveGame(archiveData){
    const {data, error} = await supabase
        .from('archives')
        .insert(archiveData)
        .select("*")

    if(error){
        Logger(['error archiving data: ', error])
    }

    return {data, error, success: !error}
}

export const endGame = async () => {
    setLoadingModal(true)
    let game = get(currentGame)
    
    if(game.game_id){
        // archive
        let {data: gameData} = await getGame(game.game_id)
        let playerData = await getPlayerData(game.game_id)
        let {data: tradeData} = await getTrades(game.game_id)
    
        let archive = {
            game: gameData,
            players: playerData,
            trades: tradeData,
        }
    
        let archiveResult = await archiveGame(archive)
        let deletePlayersResult = await deletePlayers(game.game_id)
        let deleteTradesResult = await deleteTrades(game.game_id)
        let updateResult = await updateGame({ended: true})
        return {meta: updateResult, players: deletePlayersResult, archiveResult, trades: deleteTradesResult}
    }
    else{
        return 'no game_id. could not end game'
    }
}

export const removeGameFromUserRecord = async () => {
    updateUserMetadata({game_id: "", player_name: ""})
}

export const nextRound = async (ignoreIncrement?: boolean) => {
    let {game_id} = get(currentGame)
    let {data: uptoDateValues} = await getGame(game_id)
    
    let {round, deck} = uptoDateValues
    
    if(round && deck){
        Logger(['ignoring increment'])
        let next = round + (ignoreIncrement ? 0 : 1)
        Logger(['$$ next round: ', next])
        Logger(['$$ is next round a player reveal? ', playerRevealRounds[next]])
        let update: {deck?: any, round: number} = {
            round: next
        }
        
        if(  !playerRevealRounds[next] ){
            let newDeck = {...deck}
            let card = newDeck.held.shift()
            newDeck.revealed.push(card)
            update.deck = newDeck
            Logger(['$$ new deck: ', newDeck])
        }
    
        let updateResult = await updateGame(update)
        return updateResult
    }
    else{
        Logger(['error updating game round with remote data: ', ])
    }
}

export async function getGame(game_id){
    Logger(['getting game id: ', game_id])
    let {data, error} = await supabase.from('games')
        .select('*')
        .eq('game_id', game_id)
        .limit(1)
        .maybeSingle()

    if(error){
        // set application wide error notifications here
        Logger(['error getting game ', game_id])
        console.error(error)
        // return null
    }

    Logger(['got game data: ', data])

    // update game local object
    if(data){
        currentGame.update(current => data)
    }
    else if(!data && !error){
        Logger(['setting no such game'])
        noSuchGame.set(true)
    }

    return {data, error}
}

export async function downloadGameData(game_id){
    // let gData = await getGame(game_id)
    let gTrades = await getTrades(game_id)
    let gPlayers = await getPlayerData(game_id)

    return {
        // game: gData, 
        trades: gTrades, 
        players: gPlayers, 
    }
}

export async function watchGame(game_id){
    Logger(['attempting to watch game...', game_id])
    let subs = get(serverSubscriptions)
    if(game_id && !subs.game){
        Logger(['subscribing to game'])
        const game = await supabase
            .from(`games:game_id=eq.${game_id}`)
            // .from(`games`)
            // .select('game_id,admin,round,started,ended,completed,maximum_spread')
            .on('*', (payload) => {
                // update game object in app state
                Logger(['got game update: ', payload])
                currentGame.set(parseGameData(payload.new))
            })
            .subscribe()
        
        serverSubscriptions.update(original => ({...original, game}))
        Logger(['game subscription: ', game])
    }
}

export async function getAndWatchGame(game_id){
    Logger(['getting and watching game: ', game_id])
    let {data: game, error} = await getGame(game_id)
    let subs = get(serverSubscriptions)
    Logger(['subs when attempting to subscribe to game: ', subs])
    if(game && !subs.game){
        currentGame.set(parseGameData(game))
        await watchGame(game_id)
    }
    else{
        Logger(['game already had sub'])
    }
    return game
}

function parseGameData(data){
    Logger(['parsing game data: ', data])
    return {
        ...data,
        admin: JSON.parse(data.admin)
    }
}

export async function leaveGame(){
    setLoadingModal(true)
    
    const loggedIn = await supabase.auth
    if(loggedIn && loggedIn.update)
    await loggedIn.update({
        data: {
            game_id: '',
            player_id: '',
            role: '',
        }
    })

    let id = loggedIn.user().id

    Logger(['deleting lobby record for user with ID: ', id])

    await supabase
        .from(`game-lobby`)
        .delete()
        .eq('user_id', id)


    setLoadingModal(false)

    setTimeout(() => {
        redirect("/")
    })

    setTimeout(() => {
        reloadAfterRedirect.set(true)
    }, 1500)
}

const publishTrade = async (trade) => {
    return await supabase
        .from('game-trades')
        .insert(trade)
        .select('*')
}

export async function processTrade({market, type, value}){
    canTrade.update(current => {
        return {
            ...current,
            [market]: false
        }
    })

    let player = get(currentUser)
    let game = get(currentGame)

    let trade = {
        market,
        type,
        price: value,
        actor: player.id,
        game_id: game.game_id,
        round: game.round
    }
    Logger(['would trade: ', trade])

    // const {data, error} = await publishTrade(trade)
    publishTrade(trade)
    .then(({data}) => {
        Logger(['successfully published trades: ', data])
    }) 
    .catch(error => {
        Logger(['error publishing trade: ', error])
    })
    .finally(() => {
        setTimeout(() => {
            canTrade.update(current => {
                return {
                    ...current,
                    [market]: true
                }
            })    
        }, 1200)
    })

}

// TRADES

export async function getTrades(game_id: string){
    const {data, error} = await supabase
        .from('game-trades')
        .select("*")
        .eq("game_id", game_id)
        // .limit(10)
        .order('created_at', {ascending: false})
    
    if(error){
        Logger(['error getting trades: ', error])
        // return null 
    }
    else{
        gameTrades.set(data)
    }
    return {data, error}
}

function insertTrade(tradeData){
    Logger(['inserting trade: ', tradeData])
    gameTrades.update(currentTrades => {
        let newTrades = [tradeData].concat(currentTrades)
        Logger(['new trade state: ', newTrades])
        // if(newTrades.length > 10){
        //     newTrades.splice(-1, 1)
        // }
        
        return newTrades
    })
}

export async function watchTrades(game_id: string){
    const subscription = await supabase
        .from(`game-trades:game_id=eq.${game_id}`)
        .on("INSERT", (payload) => {
            Logger(['saw trade: ', payload.new])
            if(payload.new.game_id === game_id){
                insertTrade(payload.new)
            }
        })
        .subscribe()

    serverSubscriptions.update((original) => ({...original, trades: subscription}))
    return subscription
}

export async function getAndWatchTrades(game_id: string){
    const {data: trades} = await getTrades(game_id)
    let watching
    if(trades && !get(serverSubscriptions).trades){
        Logger(['no trade subscription defined. will watch trades'])
        watching = await watchTrades(game_id)
    }
    else {
        Logger(['already had trade watcher'])
    }
    return {trades, watching}
}

// UI

export const setLoadingModal = (newState) => {
    Logger(['setting loading modal'])
    showLoadingModal.set(newState)
}


// ERRORS

export function displayErrorReporter(state: boolean){
    showErrorReporter.set(state)
}

// RULES

export function displayRules(state: boolean){
    showGameRules.set(state)
}

// MESSAGES

export function showMessage(params: Partial<MessageParams>){
    appMessage.set(params)
}