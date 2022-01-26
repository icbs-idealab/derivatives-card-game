import { browser } from "$app/env";
import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { allRoleNames, defaultGamePlayer, emptyHand, emptyReveals, playerRevealRoundsArray, roleKeys } from "./constants";
import { currentUser, gamePlayers } from "./state";
import type { AppGamePlayer, AppGamePlayers, GameCard, Holder, SuitName } from "./types";
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
    let p = {}
    allRoleNames.forEach((role) => {
        p[role] = { ...defaultGamePlayer, role}
    })
    return (p as AppGamePlayers)
}

export function getRelevantTrades(tradeList, userId, playerRole){
    return tradeList.filter(trade => {
        return trade.actor === userId 
            || trade.market === playerRole
    })
}

export function calculatePlayerInventory(_trades, targetRole?){
    let testRole = targetRole
    let contracts = {...emptyHand}
    let balance = 0
    let tradeMultipliers = {
        buy: 1,
        sell: -1,
    }
    let balanceMultipliers = {
        buy: -1,
        sell: 1,
    }

    _trades.map((trade) => {
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

    let player = {
        user_id: "",
        email: "",
        player_name: "",
        role: "",
        hand: {...emptyHand},
        revealed: {...emptyReveals}
    }
    
    if(user.id){
        let players = get(gamePlayers)
        const assign = (gamePlayer, role) =>  (player = { ...gamePlayer, role })

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

export function makeGamePlayers(params?): AppGamePlayers {
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
    let players = {}
    // let use = sourceArray || allRoleNames
    if(sourceArray){
        sourceArray.map(player => {
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

// DECK

function getRandomCard(hand){
    let randomIndex = Math.floor(Math.random() * hand.length)
    return hand.splice(randomIndex, 1)[0]
    // return randomIndex
}

function removeCardFromTop(deck){
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
    
    const roleHands = {
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
            Logger(['removed card form top: ', rc, ' and added to: ', roleKey])
        })
    }

    Logger(['created deck with roleHands: ', roleHands])


    return {
        shuffled: hand, 
        // reveals: [],
        // reveals: makeRevealObject(),
        // move role hands to player records
        roleHands,
    }
}

export function makeRevealObject(){
    let reveals = {}

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

export function emailIsValid (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function valueWithSymbol(val){
    let symbol = val < 0 ? '-' : ''
    let usableValue = divBy100AsString(val)
    return `${symbol}$${usableValue}`
}

export function divBy100AsString(val){
    let stringVal: any = String(val)
    let append = stringVal[stringVal.length-1] === '0' && stringVal !== '0' ? '0' : ''
    return `${Math.abs(val/100)}${append}`
}