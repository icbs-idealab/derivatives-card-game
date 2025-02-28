import { supabase } from "$lib/backend"
import { get } from "svelte/store"
import { allRoleNames, APP_REDIRECT_URL, APP_URL, defaultBotTradeData, defaultGame, defaultUser, getDefaultBotTrade, playerRevealRounds, roleKeys } from "./constants"
import { buildShuffledDeck, calculateMostRevealed, extractGamePhase, findGamePlayerById, getRandomNumberFromRange, Logger, makeGamePlayers, redirect } from "./helpers"
import type { UserMetaDataValues } from "./new-types"
import { serverSubscriptions, currentGame, currentUser, showLoadingModal, showGameRules, showErrorReporter, gamePlayers, lobbyRequirements, lobby, gameTrades, canTrade, reloadAfterRedirect, appMessage, noSuchGame, authChecked, showAppMessage, playersChecked, gameChecked, tradesChecked, botParams, gamePhase, appErrors, gameIsEnding } from "./state"
import type { AppGame, 
    AppGamePlayer, 
    AppGamePlayers, 
    AppGamePlayersByRole, 
    AppGameRole, 
    BotRateAdjustments, 
    BotTradeData, 
    FinalScore, 
    GamePhase, 
    LobbyPlayerBasicInfo, 
    MessageParams, 
    NewGameProps, 
    PlayerRole, 
    SuitName, 
    SupabaseUser, 
    CardHand, 
    BotRates,
    RateChangeLog,
    AppErrors,
    AppError
} from "./types"
import {nanoid} from 'nanoid'
import type { UserResponse } from "@supabase/supabase-js"

// USER

export const updateActiveUser = (newUserDetails: SupabaseUser) => {
    // Logger(['updating user details: ', newUserDetails])
    currentUser.update(current => ({...current, ...newUserDetails}))
}

export const createUser = async (email: string) => {
    let password = 'test123'
    Logger(['creating with faux password = ', password])
    let { data, error } = await supabase.auth.signUp({
        email,
        password
    })

    return { user: data.user, error }
}

export const resetUser = () => currentUser.update(() => ({...defaultUser}))


export const resetUserPasswordViaEmail = async (email: string) => {
    // const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: APP_REDIRECT_URL
    })
    // return {data, error}
}

// cannot subscribe to supabase users so will rely on calling this function whenever the _layout component is mounted to check for authenticated users

export const getAuthenticatedUser = async () => {
    // Logger(['getting authenticated user(): '])
    // let user: SupabaseUser | null = await supabase.auth.getUser()
    let _user: UserResponse | null = await supabase.auth.getUser()
    let user = _user?.data.user
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

    Logger(['USER DATA: ', user, a, b])

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

export const checkIfPasswordChanged = async (user: any) => {
    return await supabase
        .from('password-changed')
        .select("*")
        .eq('id', user.id)
        .limit(1)
}

export const checkUserCache = async () => {
    // check 
}

export const updatePassword = async (password: string) => {
    let returnObject: {
        user: null | UserResponse
        supabase: any
    } = {
        user: null,
        supabase: null,
    }

    returnObject.user  = await supabase.auth.updateUser({password})

    if(returnObject.user.data && returnObject.user.data.user){
        returnObject.supabase = await supabase
            .from('password-changed')
            .insert([{id: returnObject.user.data.user.id}])
            .select("*")

        currentUser.set(returnObject.user.data.user)
    }    

    return returnObject
}

export const updateUserMetadata = async (values: UserMetaDataValues) => {
    Logger(['updating user meta data: ', values])
    const {data, error} = await supabase.auth.updateUser({
        data: values
    })

    if(error){
        Logger(['error updating user metadata: ', error])
    }
    else if(data && data.user){
        currentUser.set(data.user)
    }
    return data
}

export const requestAccess = async (email: string, message: string) => {
    let { data, error } = await supabase.from('requests')
    .insert([{
        email,
        message,
    }])

    return {body: data, error}
}

export const signUp = async (email: string, password: string) => {
    let { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if(!error){
        Logger(['result of signup: ', data])
    }
    else {
        let errorConfig: AppError = {
            code: (error as any).status || 442,
            message: error.message
        }
        let errors: AppErrors = []
        errors.push(errorConfig)

        appErrors.set(errors)
        showErrorReporter.set(true)
    }


    return {data, error}
}

export const signIn = async (email: string, password: string) => {
    let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    return {user: data.user, error}
}

export const singOut = async () => {
    let { error } = await supabase.auth.signOut()
    if(!error){
        updateActiveUser(defaultUser)
    }
    return { error, success: !error }
}

export const checkIfAdmin = async (user: any) => {
    return await supabase
        .from('admins')
        .select("*")
        .eq('email', user.email)
        .limit(1)
}

export const getUserList = async () => {
    return await supabase
        .from('created-users')
        .select("*")
}

// PLAYER

export const updatePlayer = async (newData: any, game_id: string, user_id: string) => {
    return await supabase.from('game-players')
        .update(newData)
        .eq('game_id', game_id)
        .eq('user_id', user_id)
        .select('*')
}

export const revealPlayerCard = async (newPlayerData: any, game_id: string, user_id: string) => {
    const {data, error} = await updatePlayer(newPlayerData, game_id, user_id)
    data !== null && Logger(['result of player update: ', data])
    error !== null && Logger(['error updating player: ', data])
    return {data, error, success: !error}
}

export const updatePlayerPrices = async (newPrices: {buy: number, sell: number}) => {
    let game = get(currentGame)
    let game_id = game.game_id
    let user_id = get(currentUser).id
    // get players and filter by id
    let thisPlayer = findGamePlayerById()
    Logger(['current rate: this player is: ', thisPlayer])

    let currentChangeLog = thisPlayer.rate_change_log 

    Logger(['current rate change log: ', currentChangeLog])

    if(!currentChangeLog){
        Logger(['No current rate change log!'])
        currentChangeLog = []
    }


    let newLog: RateChangeLog = {
        ...newPrices,
        time: Date.now(),
        round: game.round
    }

    currentChangeLog.push(newLog)

    let newPlayerData = {
        rate_change_log: currentChangeLog,
        ...newPrices
    } 
    
    // const {data, error} = await updatePlayer(newPrices, game_id, user_id)
    const {data, error} = await updatePlayer(newPlayerData, game_id, user_id)
    data !== null && Logger(['result of player price update: ', data])
    error !== null && Logger(['error updating player prices: ', error])
    return {data, error, success: !error}
}

export const updateBotsInCloud = async (gameId: string, bots: AppGamePlayersByRole) => {
    let calls = []

    for(let bot in bots){
        let b = bots[bot]
        let call = new Promise(async (resolve, reject) => {
            const {data, error} = await supabase
                .from('game-players')
                .update([b])
                .eq('game_id', gameId)
                .eq('user_id', b.user_id)
                .select("*")

            !error && resolve(data)
            error && reject(error)
        })
        calls.push(call)
    }

    return Promise.all(calls)
        .then(res => {
            Logger(['completed bot update calls: ', res])
            return {success: true, result: res, error: null}
        })
        .catch(err => {
            Logger(['error completing bot update calls: ', err])
            return {success: false, result: null, error: err}
        })

}

export const getBotParams = async () => {
    const {data, error} = await supabase.from('bot-logic')
        .select('*')
        .single()

    !error && Logger(['result of getting bot params: ', data])
    error && Logger(['error getting bot params: ', error])

    return {data, error}
}

export const watchBotParams = async () => {
    let subs = get(serverSubscriptions)

    function handleBotParamsChange(payload: any){
        Logger(['Got new bot params: ', payload.new])

        let parsed = {}
        if(typeof payload.new === 'string'){
            parsed = JSON.parse(payload.new)
        }

        JSON.stringify(get(botParams)) !== JSON.stringify(parsed)
            && botParams.set(payload.new)
    }

    if(!subs.bot){
        const botParamsWatcher = await supabase
            .channel(`public:bot-logic`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bot-logic',
            }, handleBotParamsChange)
            .subscribe()
    
            serverSubscriptions.update(original => {
                return {
                    ...original,
                    bot: botParamsWatcher
                }
            })
    }
}

export function createBotTradePromise(bot: AppGamePlayer, game: AppGame, tradeData: BotTradeData){
    // price depends on market being interacted with
    let trade = {
        market: tradeData.market,
        type: tradeData.type,
        price: tradeData.price,
        actor: bot.user_id,
        game_id: bot.game_id,
        round: game.round,
    }

    return new Promise( async (resolve, reject) => {
        const {data, error} = await supabase.from('game-trades')
        .insert(trade)
        .eq('game_id', bot.game_id)
        .eq('user_id', bot.user_id)
        .select("*")

        !error && resolve(data)
        error && reject(error)
    })
}

function getAllLeastRevealed(ordered: SuitName[], revealCount: CardHand){
    let least = ordered[ordered.length - 1]
    let targets: SuitName[] = []
    
    function append(target: SuitName){
        targets.push(target)
    }

    [...ordered].reverse().forEach((target) => {
        revealCount[target] === revealCount[least] && append(target)
    })

    Logger(['Can target suits: ', targets])
    
    return targets
}

function calculateBestTrade(orderedSuits: SuitName[], cardCount: CardHand , players: AppGamePlayers, currentBotRole: PlayerRole){
    // when to buy
    // buy any of the markets that has the fewest cards revealed
    // let leastRevealed = orderedSuits[orderedSuits.length - 1].toLowerCase()
    let leastRevealedCards = getAllLeastRevealed(orderedSuits, cardCount)
    let mostRevealed = orderedSuits[0].toLowerCase()
    let botRole = currentBotRole.toLowerCase()
    Logger(['BOT-TRADE LEAST REVEALED CARDS: ', leastRevealedCards])
    Logger(['BOT-TRADE MOST REVEALED: ', mostRevealed])
    Logger(['BOT-TRADE BOT ROLE: ', botRole])

    if(leastRevealedCards.includes(botRole as SuitName)){
        // sell other markets instead, most revealed suit
        let targetMarkets = roleKeys.filter(role => role !== botRole)
        let randomIndex = getRandomNumberFromRange({max: targetMarkets.length, min: 0})
        let selectedMarket = targetMarkets[randomIndex]
        Logger(['Selected Market: ', selectedMarket])
        // get data for selected market
        let targetPlayerIndex = players.findIndex((player: AppGamePlayer) => player.role === selectedMarket)
        Logger(['TARGET PLAYER INDEX: ', targetPlayerIndex])

        let selectedPlayer = players[targetPlayerIndex]
        Logger(['SELECTED PLAYER: ', selectedPlayer])

        if(selectedPlayer){
            let botTradeData = {
                market: selectedMarket,
                type: 'sell',
                price: selectedPlayer.sell
            }
            return botTradeData
        }
    }
    else if(mostRevealed === botRole){
        // do nothing
    }
    else {
        // buy target market
        let rand = getRandomNumberFromRange({max: leastRevealedCards.length, min: 0})
        Logger(['Rand: ', rand])
        let randomFromLeastRevealed = leastRevealedCards[rand-1]
        Logger(['randomFromLeastRevealed: ', randomFromLeastRevealed])
        let targetPlayerIndex = players.findIndex((player: AppGamePlayer) => player.role === randomFromLeastRevealed)
        let targetPlayer = players[targetPlayerIndex]
        if(targetPlayer){
            let botTradeData = {
                market: randomFromLeastRevealed as SuitName,
                type: 'buy',
                price: targetPlayer.buy
            }
            return botTradeData
        }
    }
}

let rateAdjustments: BotRateAdjustments = {
    'early': {
        0: -1,
        1: -1,
        2: 1,
        3: 1,
    },
    'mid': {
        0: -2,
        1: -2,
        2: 2,
        3: 2,
    },
    'late': {
        0: -3,
        1: -2,
        2: 2,
        3: 3,
    },
    'end': {
        0: -4,
        1: -3,
        2: 3,
        3: 4,
    },
}

function adjustBotRates(rates: BotRates, index: number, gamePhase: GamePhase){
    // may later alter logic for adjusting rates so keep as a separate function
    Logger([`Adjusting for game phase: ${gamePhase} with index: ${index} -> ${rateAdjustments[gamePhase][index]}`])
    let params = get(botParams)

    rates.buy += rateAdjustments[gamePhase][index]
    rates.sell += rateAdjustments[gamePhase][index]

    // force rates to sit within parameters
    rates.buy < params.min_buy_rate && (rates.buy = params.min_buy_rate)
    rates.buy > params.max_buy_rate && (rates.buy = params.max_buy_rate)
    rates.sell < params.min_sell_rate && (rates.sell = params.min_sell_rate)
    rates.sell > params.max_sell_rate && (rates.sell = params.max_sell_rate)
    return rates
}

function calculateBestRate(orderedSuits: SuitName[], botRates: {buy: number, sell: number}, botSuit: SuitName, gamePhase: GamePhase, game: AppGame)
:{buy: number, sell: number} {
    // look at most revealed cards
    let newRates: BotRates = {...botRates, round: game.round}
    // increase bid/sell rate if own suit unlikely to be last or unlikely to be targeted by other players (is last or second last in terms of frequency)
    // otherwise increase ask rate
    let index = orderedSuits.indexOf(botSuit)
    newRates = adjustBotRates(newRates, index, gamePhase)
    // generally increase both simultaneously
    return newRates
}

export async function performBotActions(bots: AppGamePlayersByRole){
    let promises = []
    let tradePromises = []
    let {data: game} = await getGame( get(currentGame).game_id )
    let {data: suitPlayers} = await getPlayerData( get(currentGame).game_id )
    let gamePhase = extractGamePhase(game)
    // calculate which suits have the highest number of reveals and return ordered array of suit names
    let {orderedSuits, cardCount} = await calculateMostRevealed(game) // return array in order of most revealed or null

    Logger(['Suits in order are: ', orderedSuits])
    for(let bot in bots){
        let botId = bots[bot].user_id
        let gameId = game.game_id
        let actionCount = bots[bot].bot_action_count as any
        // var by ref so don't need to pass back into original object
        actionCount[game.round] += 1
        
        // calculate the ideal rates to set for the target bot
        let calculatedRates = calculateBestRate(
            orderedSuits, 
            {buy: bots[bot].buy, sell: bots[bot].sell},
            bots[bot].role as SuitName,
            gamePhase,
            game
        )

        Logger(['calculated best rates: ', calculatedRates])

        let newRatesLog = bots[bot].rate_change_log || []
        newRatesLog.push({buy: calculatedRates.buy, sell: calculatedRates.sell, time: Date.now()})

        Logger(['New Rates Log: ', newRatesLog])

        let updatedBot: AppGamePlayer = {
            ...bots[bot],
            buy: calculatedRates.buy,
            sell: calculatedRates.sell,
            bot_action_count: actionCount,
            rate_change_log: newRatesLog
        }

        Logger(['Update Bot is: ', updatedBot])

        // calc best trade option for the target bot
        let bestTrade = calculateBestTrade(orderedSuits, cardCount, suitPlayers, bots[bot].role as PlayerRole)
        if(bestTrade !== undefined){
            let trade: BotTradeData = bestTrade
            let tradeCall = createBotTradePromise(bots[bot] as AppGamePlayer, game, trade)
            Logger(['Pushing trade call! ', tradeCall])
            tradePromises.push(tradeCall)
        }
        else {
            Logger(['No Trade Created!!'])
        }

        // update bots player object
        // including any new pricing for bot-owned markets
        // tbd by a calculation of suit that is most likely to be revealed last
        let rateUpdateCall = new Promise( async (resolve, reject) => {
            const {data, error} = await supabase.from('game-players')
            .update(updatedBot)
            .eq('game_id', gameId)
            .eq('user_id', botId)
            .select("*")

            !error && resolve(data)
            error && reject(error)
        })

        Logger(['Pushing rate update call! ', rateUpdateCall])
        promises.push(rateUpdateCall)
    }
    let allPromises = [...promises, ...tradePromises]

    // return Promise.all(promises.concat(tradePromises))
    // return Promise.all(tradePromises)
    return Promise.all(allPromises)
    .then(res => ({success: true, data: res, error: null}))
    .catch(err => ({success: false, data: null, error: err}))
}

export const getPlayerData = async (game_id: string) => {
    Logger(['getting player data for: ', game_id])
    let {data, error} = await supabase.from('game-players')
        .select('*')
        .eq('game_id', game_id)

    Logger(['player data: ', data])
    playersChecked.set(true)
    let returnData: AppGamePlayers = data || []
    return {data: returnData, error, success: !error}
}

export const watchPlayers = async (game_id: string) => {
    Logger(['attempting to watch players... ', game_id])

    function handleRecordUpdated(payload: any){
        Logger(['got game-players update: ', payload])
        syncGamePlayers(payload.new)
    }

    let subs = get(serverSubscriptions)

    if(game_id && !subs.players){
        const players: any = await supabase
            .channel(`public:game-players:game_id=eq.${game_id}`)
            // .select('game_id,admin,round,started,ended,completed,maximum_spread')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'game-players',
                filter: `game_id=eq.${game_id}`
            }, handleRecordUpdated)
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
            
            Logger(['PLAYERS ARE: ', players])

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

export function syncGamePlayers(update: AppGamePlayers | AppGamePlayer){
    Logger(['syncing players with update value: ', update])
    gamePlayers.update(currentPlayers => {
        // players.data
        // players.data
        Logger(['current players: ', currentPlayers])

        let newPlayers: AppGamePlayersByRole = {...currentPlayers}
        // let newPlayers: AppGamePlayers = [...currentPlayers]
        
        if(Array.isArray(update)){

            update.map((player: AppGamePlayer) => {
                let role: PlayerRole = player.role
                newPlayers[role] = {
                    ...newPlayers[role],
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

const getPlayersFromLobby = async (game_id: string) => {
    const {data, error} = await supabase.from('game-lobby')
        .select('*')
        .eq('game_id', game_id)
    Logger(["new lobby players: ", data])
    return {data, success: !error, error}
}

const watchLobby = async (game_id: string) => {
    const subscription = await supabase
        .channel(`public:game-lobby:game_id=eq.${game_id}`)
        .on(
            'postgres_changes', 
            {event: '*', schema: 'public', table: 'game-lobby', filter: `id=eq.${game_id}`}, 
            (payload) => {
                Logger(['got new lobby payload: ', payload])
                syncLobby(payload.new)
            }
        )
        // .on('DELETE', (payload) => {
        //     Logger(['got new lobby deletion payload: ', payload])
        //     syncLobby(payload.new, true)
        // })
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

export function syncLobby(update: any, remove: boolean = false){
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

async function insertPlayer(game_id: string, player: LobbyPlayerBasicInfo){
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

function checkGameForAvailableRoles(playerData: any){
    Logger(['checking against: ', playerData])
        let count = 0
        // let ps = Object.keys(playerData)
        playerData.map((player: any) => {
            player.user_id === "" && (count += 1)
        })

        // compare to allRoleNames in case some error prevented
        return count !== allRoleNames.length
}

export async function joinLobby(game_id: string, player: LobbyPlayerBasicInfo){

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

export const getArchivesForGameID = async (game_id: string = '') => {
    if(!game_id) return {data: [], error: {message: 'no user id or game id provided!'}};
    
    console.log("action 2")

    return await supabase.from('archives')
        .select()
        .eq('game_id', game_id)
}

export const getArchives = async (user_id: string, game_id: string = '') => {
    if(!game_id && user_id){
        console.log("action 1")
        return await supabase.from('archives')
        .select()
        .textSearch('participants', user_id)
    }
    else if(game_id && user_id){
        console.log("action 2")
        return await supabase.from('archives')
        .select()
        .textSearch('game_id', game_id)
    }
    else{
        return {data: [], error: {message: 'no user id or game id provided!'}}
    }
    
} 

export const createNewGame = async ({user, creatorRole, maximumSpread, playerName}: NewGameProps) => {
    setLoadingModal(true)

    // create new game
    const game_id = nanoid(12)
    const newGame = {
        ...defaultGame,
        game_id,
        admin_id: user.id,
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
            // let res = data && data.length && data.length > 1 ?
            //     data[0]
            //     : data
            let res = data

            !error ?
                resolve({data: res, error: null, success: true, type})
                : reject({error, data: null, success: false, type})
        })
    
        const updateCreatorRecord = new Promise( async (resolve, reject) => {
            const {data, error} = await supabase.auth.updateUser({
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
            // .finally(() => {
            //     setLoadingModal(false)
            // })

    // }
}

const viewCreatedGame = async (creationResults: any[]) => {
    let game = creationResults.filter(cr => cr.type === 'game')[0].data
    // reloadAfterRedirect.set(true)
    Logger(['game: ', game])
    if(game){
        currentGame.set(parseGameData(game))
        if(!get(serverSubscriptions).game){
            await watchGame(game.game_id)
        }
    }
}

export const assignGamePlayers = async (game_id: string, roleAssignments: AppGamePlayer[]) => {
    // assign player roles
    return Promise.all(
        roleAssignments.map(async (player: AppGamePlayer) => {
            return await supabase
                .from('game-players')
                .update({
                    player_name: player.player_name,
                    user_id: player.user_id,
                })
                .eq('game_id', game_id)
                .eq('role', player.role)
                .select("*")
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

export async function updateGame(updateValue: Partial<AppGame>){
    let game = get(currentGame)
    let {game_id} = game
    let res: any = {}

    if(game_id){
        // let record = await supabase.from('game')
        // .select('*')
        // .eq('game_id', game_id)

        let {data, error} = await supabase
            .from(`games`)
            .update(updateValue)
            .eq('game_id', game_id)
            .select()

        if(!error){
            Logger(['successfully updated game: ', data])
            res.data = data
            res.success = true
            res.error = null
            return res
            // return {data, success: true}
        }
        else{
            Logger(['error starting game: ', error])
            res.error = error
            res.success = false
            res.data = null
            return res
            // return {error, success: false}
        }

    }
}

export const removeFromLobby = async (game_id: string) => {
    const {data, error} = await supabase
        .from('game-lobby')
        .delete()
        .eq("game_id", game_id)

        if(error){
            Logger(['error removing players from lobby: ', error])
        }

        return {data, error, success: !error}
}

export const setFinalGameScores = async (final_scores: FinalScore) => {
    // let game = get(currentGame)
    let updateResult = await updateGame({final_scores, ended: true, completed: true})
    return updateResult
}

export const startGame = async () => {
    let game = get(currentGame)
    let updateResult = await updateGame({started: true, round: 1})
    if(game.id){
        await removeFromLobby(game.id)
    }
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

export async function archiveGame(archiveData: any){
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
    let game = get(currentGame)
    if(game.game_id){
        gameIsEnding.set(true)

        // archive
        let {data: gameData} = await getGame(game.game_id)
        let playerData = await getPlayerData(game.game_id)
        let {data: tradeData} = await getTrades(game.game_id)
    
        let participants: any = []

        playerData.data && playerData.data.forEach(p => {
            if(p.user_id){
                participants.push(p.user_id)
            }
        })
        // for(let p in playerData.data){
        //     // console.log('player: ', p, playerData)
        //     if(playerData[p] && playerData[p].user_id){
        //         participants.push(playerData[p].user_id)
        //     }
        // }

        console.log('$participants$: ', participants)

        let archive = {
            game: gameData,
            players: playerData,
            trades: tradeData,
            game_id: gameData.game_id,
            participants: participants.join('_')
        }
    
        let archiveResult = await archiveGame(archive)
        let deletePlayersResult = await deletePlayers(game.game_id)
        // let deletePlayersResult = {success: true, temp: true}
        let deleteTradesResult = await deleteTrades(game.game_id)
        // let deleteTradesResult = {success: true, temp: true}
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
    let {data: upToDateValues} = await getGame(game_id)
    
    let {round, deck} = upToDateValues
    
    if(round && deck){
        ignoreIncrement && Logger(['ignoring increment'])
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
        let errorMessage = 'error updating game round with remote data: '
        Logger([errorMessage])
        return {data: null, error: errorMessage}
    }
}

export async function getGame(game_id: string){
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

    gameChecked.set(true)
    return {data, error}
}

export async function downloadGameData(game_id: string){
    // let gData = await getGame(game_id)
    let gTrades = await getTrades(game_id)
    let gPlayers = await getPlayerData(game_id)

    return {
        // game: gData, 
        trades: gTrades, 
        players: gPlayers, 
    }
}

export async function watchGame(game_id: string){
    Logger(['attempting to watch game...', game_id])
    let subs = get(serverSubscriptions)
    if(game_id && !subs.game){
        Logger(['subscribing to game'])
        let game: any
        const gameRealtime = await supabase
            .channel(`public:games:game_id=eq.${game_id}`)
            .on('postgres_changes', {
                event: '*', 
                schema: 'public', 
                table: 'games', 
                filter: `game_id=eq.${game_id}`, 
            }, 
            (payload) => {
                // update game object in app state
                Logger(['got game update from sub: ', payload])
                currentGame.set(parseGameData(payload.new))
                let newGame = payload.new as AppGame
                let newPhase = extractGamePhase(newGame)
                gamePhase.set( newPhase )
            })
            .subscribe()
        
        serverSubscriptions.update(original => ({...original, game: gameRealtime}))
        Logger(['game subscription: ', gameRealtime])
    }
}

export async function getAndWatchGame(game_id: string){
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

function parseGameData(data: any){
    Logger(['parsing game data: ', data])
    return {
        ...data,
        admin: typeof data.admin === 'string' ? JSON.parse(data.admin) : data.admin
    }
}

export async function leaveGame(){
    setLoadingModal(true)
    let id
    const {data: {user}} = await supabase.auth.getUser()
    if(user){
        await supabase.auth.updateUser({
            data: {
                game_id: '',
                player_id: '',
                role: '',
            }
        })
        id = user.id
        Logger(['deleting lobby record for user with ID: ', id])
        await supabase
            .from(`game-lobby`)
            .delete()
            .eq('user_id', id)
    
        setLoadingModal(false)
    }

    setTimeout(() => {
        redirect("/")
    })

    setTimeout(() => {
        reloadAfterRedirect.set(true)
    }, 1500)
}

const publishTrade = async (trade: any) => {
    return await supabase
        .from('game-trades')
        .insert(trade)
        .select('*')
}

export async function getDummyTradesSB(gameID: string){
    if(!gameID) return {data: [], error: {message: 'no gameID'}}
    ;
    const {data, error} = await supabase.from('game-trades')
    .select('*')
    .eq('game_id', gameID)
    .order('created_at', {ascending: true})
    
    return {data, error}
}

export async function postDummyTrades(trades: any[]){
    let all: any[] = [];
    for(let i = 0; i < trades.length; i += 100){
        let chunk = trades.slice(i, i + 100)
        console.log('chunk: ', chunk)
        // postTrades(chunk)
        const {data, error} = await supabase.from('game-trades')
        .insert(chunk)
        .select('*');

        console.log('data: ', data)
        console.log('error: ', error)
        if(!error){
            all.push(...data)
        }
        else {
            Logger(['error posting dummy trades: ', error])
        }
    }

    return all
}

export async function processTrade({market, type, value}: any){
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

// PRICE CHANGE LOG

function parseLogTime(timestamp: number){
    let date = new Date(timestamp)
    let time: {
        [index: string]: number | string
        // day?: number | string
        // month?: number | string
        // year?: number | string
        // hour?: number | string
        // minute?: number | string
        // second?: number | string
    } = {
        day: date.getDate(),
        month: date.getUTCMonth() + 1,
        year: parseInt(String(date.getFullYear()).substring(2)),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getMinutes(),
    }

    return time
}

export async function getPriceChangeLogs(game_id: string){

    const {data, error} = await supabase
        .from('game-players')
        .select("*")
        .eq("game_id", game_id)

    if(error){
        Logger(['error getting price change logs: ', error])
        // let parsedData = []

        return {data, error, success: false} 
    }
    else {
        Logger(['Got Price Change Log: ', data])
        let beforeParsed: any[] = []
        data.forEach(player => {
            let pLog = [...player.rate_change_log]
            
            beforeParsed.push(...pLog.map((item) => {
                return {
                    ...item,
                    parsedTime: parseLogTime(item.time),
                    player_id: player.user_id,
                    player_name: player.player_name,
                    role: player.role
                }
            }))
        })

        let parsed: any[] = beforeParsed.sort((a: any, b: any) => {
            return a.time > b.time ? 1 : -1
        })

        return {data: parsed, error, success: true}
    }
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
    tradesChecked.set(true)
    return {data, error}
}

function insertTrade(tradeData: any){
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
        .channel(`public:game-trades:game_id=eq.${game_id}`)
        .on(
            "postgres_changes", 
            {
                event: '*', 
                schema: 'public', 
                table: 'game-trades', 
                filter: `game_id=eq.${game_id}`, 
            },
            (payload: any) => {
                Logger(['saw trade: ', payload.new])
                if(payload.new.game_id === game_id){
                    insertTrade(payload.new)
                }
            }
        )
        // .on("INSERT", (payload) => {
        //     Logger(['saw trade: ', payload.new])
        //     if(payload.new.game_id === game_id){
        //         insertTrade(payload.new)
        //     }
        // })
        .subscribe()

    serverSubscriptions.update((original) => ({...original, trades: subscription}))
    return subscription
}

export async function getAndWatchTrades(game_id: string){
    if(!game_id) return;

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

export const setLoadingModal = (newState: boolean) => {
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

export function setShowAppMessage(newState: boolean){
    showAppMessage.set(newState)
}

export async function getArchiveData(game_id = ''){
    return getArchives( get(currentUser).id, game_id )
}