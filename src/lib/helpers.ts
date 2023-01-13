import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { allRoleNames, defaultGamePlayer, emptyHand, emptyReveals, emptySuits, gamePhases, playerRevealRoundsArray, roleKeys } from "./constants";
import { botParams, currentGame, currentUser, gamePlayers } from "./state";
import type { 
    AppGamePlayer, 
    AppGamePlayers, 
    GameCard, 
    Holder, 
    SuitName, 
    SuitReveals,
    GameTrade,
    TradeLedger,
    GamePhase,
    AppGame,
    NumberRange
} from "./types";
import fileSaver from 'file-saver'
import { browser } from "$app/environment";
import { getGame, getPlayerData } from "./actions";
const {saveAs} = fileSaver
const DEV = import.meta.env.VITE_DEV


export function Logger(params: any[]){
    // check env function
    if(DEV === "true" || DEV === true || ( typeof params[0] === 'string' && params[0].startsWith('err')) ){
        console.log(...params)
    }
}

export function redirect(path: string){
    Logger(['redirecting to: ', path])
    browser && goto(path)
    // browser && goto('status')
}

// PLAYERS

export const makePlayers: () => AppGamePlayers = () => {
    let p: {[index: string]: any} = {}
    allRoleNames.forEach((role: string) => {
        p[role] = { ...defaultGamePlayer, role}
    })
    return (p as AppGamePlayers)
}

export function getRelevantTrades(tradeList: GameTrade[], userId: string, playerRole: string){
    return tradeList.filter((trade: any) => {
        return trade.actor === userId 
            || trade.market === playerRole
    })
}

export function calculatePlayerInventory(_trades: TradeLedger, targetRole?: string){
    let testRole = targetRole
    let contracts: {[index: string]: number} = {...emptyHand}
    let balance = 0
    let tradeMultipliers: {[index: string]: number} = {
        buy: 1,
        sell: -1,
    }
    let balanceMultipliers: {[index: string]: number} = {
        buy: -1,
        sell: 1,
    }

    _trades.map((trade: any) => {
        // contracts[trade.market] += tradeMultipliers[trade.type]
        contracts[trade.market] += trade.market === testRole ?
            // invert action since player loses contract to buying player and gains from seller
            (tradeMultipliers[trade.type] * -1) 
            // else add buys, subtract sales
            : tradeMultipliers[trade.type]

        
        // balance += (balanceMultipliers[trade.type] * trade.price)
        balance += trade.market === testRole ?
            // player gains money from trades with type buy if of the same market as they are being 'sold' to the player
            (balanceMultipliers[trade.type] * -1) * trade.price
            // else affect is inverted
            : balanceMultipliers[trade.type] * trade.price
    })

    return {contracts, balance}
}


export function findGamePlayerById(){
    let user = get(currentUser)

    // let player: AppGamePlayer = {
    //     user_id: "",
    //     // email: "",
    //     player_name: "",
    //     role: "",
    //     hand: {...emptyHand},
    //     revealed: {...emptyReveals},
    //     rate_change_log: [],
    //     bot_action_count: {},
    // }
    let player = {...defaultGamePlayer}
    
    if(user.id){
        let players = get(gamePlayers)
        const assign = (gamePlayer: any, role: string) =>  (player = { ...gamePlayer, role })

        for(let i = 0; i < allRoleNames.length; i++){
            let role = allRoleNames[i]
            if(players[role].user_id === user.id){
                assign(players[role], role)
                break
            }
        }
        return player
    }
    else return player
}

export function makeGamePlayers(params?: any): AppGamePlayers {
    if(params){
        const {adminRole, adminId, adminName, roleHands, gameId} = params
        return allRoleNames.map(role => ({
            ...defaultGamePlayer,
            game_id: gameId,
            user_id: role === adminRole ? adminId : "",
            player_name: role === adminRole ? adminName : "",
            is_admin: role === adminRole ,
            hand: roleHands[role],
            revealed: {...emptyReveals},
            role,
        }))
    }
    else return allRoleNames.map(role => ({...defaultGamePlayer}))
}

export function makeGamePlayersAsObject(sourceArray?: any){
    let players: {[index: string]: any} = {}
    // let use = sourceArray || allRoleNames
    if(sourceArray){
        sourceArray.map((player: any) => {
            players[player.role] = {...player}
        })
    }
    else{
        allRoleNames.map(role => {
            players[role] = {...defaultGamePlayer}
        })
    }
    return players
}

// BOTS
export function getBotsFromPlayers(players: {[index: string]: AppGamePlayer}){
    let botPlayers: {[index: string]: AppGamePlayer} = {}
    for(let player in players){
        if(players[player].user_id.includes('-bot')){
            let role = players[player].role
            botPlayers[role] = players[player]
        }
    }
    return botPlayers
}

// DECK

export function getRandomCard(hand: SuitName[]){
    let randomIndex = Math.floor(Math.random() * hand.length)
    return hand.splice(randomIndex, 1)[0]
    // return randomIndex
}

export function getRandomCardFromHand(hand: {[index: string]: number}){
    let suits = Object.keys(hand).filter((suit: string, index: number) => {
        return hand[suit] > 0
    })
    let randomSuitIndex = Math.floor(Math.random() * suits.length)
    let randomSuit = suits[randomSuitIndex]
    // let newHand = {...hand}
    // newHand[randomSuit] -= 1
    return randomSuit
}

export function getRandomNumberFromRange(range: NumberRange){
    return Math.floor(Math.random() * (range.max - range.min + 1) + range.min)
}

function removeCardFromTop(deck: SuitName[]){
    return deck.splice(-1, 1)[0]
}


export const buildShuffledDeck = () => {
    let allCards = [
        ...new Array(13).fill('clubs'),
        ...new Array(13).fill('diamonds'),
        ...new Array(13).fill('hearts'),
        ...new Array(13).fill('spades'),
    ]
    
    let hand: SuitName[] = []
    
    while(allCards.length > 0){
        // get random card from list of all cards and more into hand
        let randomCard = getRandomCard(allCards)
        hand.push(randomCard)
    }
    
    const roleHands: {[index: string]: any} = {
        clubs: {...emptyHand},
        diamonds: {...emptyHand},
        hearts: {...emptyHand},
        spades: {...emptyHand},
    }

    Logger(['new game hand is: ', hand])
    
    for(let i = 0; i<6; i++){
        // add one random card to each role
        roleKeys.forEach((roleKey: string) => {
            let rc = removeCardFromTop(hand)
            roleHands[roleKey][rc] += 1
            // Logger(['removed card form top: ', rc, ' and added to: ', roleKey])
        })
    }

    // Logger(['created deck with roleHands: ', roleHands])


    return {
        shuffled: hand, 
        // reveals: [],
        // reveals: makeRevealObject(),
        // move role hands to player records
        roleHands,
    }
}

export function makeRevealObject(){
    let reveals: {[index: string]: any} = {}

    playerRevealRoundsArray.forEach(rr => {
        reveals[rr] = {
            clubs: null,
            diamonds: null,
            hearts: null,
            spades: null,
        }
    })

    return reveals
}

export function emailIsValid (email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function valueWithSymbol(val: number){
    let symbol = val < 0 ? '-' : ''
    let usableValue = divBy100AsString(val)
    return `${symbol}$${usableValue}`
}

export function divBy100AsString(val: number){
    // let stringVal: any = String(val)
    // let append = stringVal[stringVal.length-1] === '0' && stringVal !== '0' ? '0' : ''
    // return `${Math.abs(val/100)}${append}`
    let stringVal: any = String(Math.abs(val))
    let offset = stringVal.length - 2
    let by100 = stringVal.substr(0, offset) + '.' + stringVal.substr(offset)
    return by100
}

export function getReveals(ps: any, game: any): SuitReveals{
    let reveals = {...emptySuits}

    roleKeys.map((role) => {
        reveals[role] = game && game.round ? 
            ps[role].revealed[game.round]
            : ''
    })
    return reveals
}

export function hasAll(state: any){
    return state.clubs
        && state.diamonds
        && state.hearts
        && state.spades
}

export function parseArchives(list: any[]){
    return list.map((arch: any) => {
        let mapped = {
            ...arch,
            players: arch.players.data,
            mappedPlayers: makeGamePlayersAsObject(arch.players.data),
            // trades: JSON.parse(arch.trades),
            participants: arch.participants.split('_'),
        }
        // console.log('arch: ', mapped)
        return mapped
    })
}

export let getTime = (date: any) => {
    let d = new Date(date)
    return `${d.getHours()}:${d.getMinutes()}:${d.getMilliseconds()}`
}

export let getDate = (date: any) => {
    let d = new Date(date)
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
}

export let makeCSV = async (game_id: string, type: string, csvData: string) => {
    return new Promise(async (resolve) => {
        let fileName = `icbs_derivatives_${game_id}_${type}.csv`
        let blob = new Blob([csvData], {type: 'text/plain;charset=utf8'})
        resolve(saveAs(blob, fileName))
    })
}

export const extractGamePhase = (_game?: AppGame) => {
    let game = _game || get(currentGame)
    let params = get(botParams)
    let phase: GamePhase = 'early'
    let isMidGame = game.round >= params.mid_game_start_round && game.round < params.late_game_start_round 
    let isLateGame = game.round >= params.late_game_start_round && game.round < params.end_game_start_round 
    let isEndGame = game.round >= params.end_game_start_round

    isMidGame && (phase = gamePhases[1])
    isLateGame && (phase = gamePhases[2])
    isEndGame && (phase = gamePhases[3])
    return phase
}

export const getBotParamFrequency = (game?: AppGame) => {
    let phase = extractGamePhase(game)
    let params = get(botParams)
    let freq = 3500
    let frequencies = {
        early: params.early_game_frequency,
        mid: params.mid_game_frequency,
        late: params.late_game_frequency,
        end: params.end_game_frequency,
    }

    freq = frequencies[phase]

    return freq
}

// really only calculates the likelihood of something being revealed
export async function calculateMostRevealed(game: AppGame){
    // get remote game 
    // let last = ''
    let {data: thisGame} = await getGame( get(currentGame).game_id )
    let {data: players} = await getPlayerData( get(currentGame).game_id )
    // Logger(['got players: ', players])
    // extract deck
    if(!thisGame || !players || (players && players.length === 0)){
        return {orderedSuits: [], cardCount: {...emptyHand}}
    }

    let deck = thisGame.deck
    let cardCount = {...emptyHand}
    // deck.held.forEach((card: SuitName) => cardCount[card] += 1)
    deck.revealed.forEach((card: SuitName) => cardCount[card] += 1)
    const suitPlayers = players
        .filter((player: AppGamePlayer) => !player.role.includes('speculator'))

    suitPlayers.forEach((player: AppGamePlayer) => {
            for(let revealed in player.revealed){
                let suitName = (player.revealed as any)[revealed] as SuitName
                suitName && (cardCount[suitName] += 1)
            }
        })
    Logger(['got suit commanding players: ', suitPlayers])

    // let most: SuitName = 'clubs'
    Logger(['card count is: ', cardCount])
    let suitNames = Object.keys(cardCount) as SuitName[]
    let orderedSuits = [...suitNames].sort((suitA: SuitName, suitB: SuitName) => {
        if(cardCount[suitA] > cardCount[suitB]) return -1
        else if(cardCount[suitA] < cardCount[suitB]) return 1
        else return 0
    })
    Logger(['sorted suit names: ', orderedSuits])
    return {orderedSuits, cardCount}
}