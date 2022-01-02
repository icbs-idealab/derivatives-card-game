export type SuitName = 'clubs' | 'diamonds' | 'hearts' | 'spades'

export type PlayerRole = SuitName | 'speculator1' | 'speculator2' | 'speculator3' | 'speculator4' | 'speculator5' | 'speculator6' | 'guest'

export type SuitSymbol = '&clubs' | '&diamonds' | '&hearts' | '&spades' | '&#128065' | '&#129300' | '&#128540'

export interface JoinGameParameters {
    playerName: string
    gameId: string
}

export interface MarketButtonParameters {
    name: SuitName
    icon: SuitSymbol
}

export interface AppUser {
    id: string
    playerName: string
    email: string
    admin: boolean
    role: PlayerRole
    game: string
}

export interface MenuItem {
    label: string
    icon: string
    active: boolean
    action: () => void
}

export interface AppError {
    message: string
    code: string
}

export type AppErrors = AppError[]

export interface AppIssue {
    id: string
    description: string
    title: string
    steps: issueStep[]
    loggedIn: boolean
    inGame: boolean
    browser: string
}

export interface CardHand {
    clubs: number
    diamonds: number
    hearts: number
    spades: number
}

type rateName = 'clubs_rate' | 'diamonds_rate' | 'hearts_rate' | 'spades_rate'

export interface AppGame {
    id?: string // optional as only present in the supabase record
    game_id: string
    admin: {
        user_id: string
        player_name: string
        role: string
    }
    round: number
    started: boolean
    ended: boolean
    completed: boolean
    maximum_spread: number
    deck: GameDeck
    final_scores?: any
    
    // trade rates
    // clubs_rate: {
    //     buy: number
    //     sell: number
    // }
    // diamonds_rate: {
    //     buy: number
    //     sell: number
    // }
    // hearts_rate: {
    //     buy: number
    //     sell: number
    // }
    // spades_rate: {
    //     buy: number
    //     sell: number
    // }
}

// DECK

type Holder = 'game' | 'clubs' | 'diamonds' | 'spades' | 'hearts'

export interface GameCard {
    suit: SuitName
    revealed: boolean
    revealedOn: Date | null
    heldBy: Holder
}

export interface GameDeck {
    revealed: SuitName[]
    held: SuitName[]
}

//

export interface GameDeckCount {
    revealed: 0
    held: 0
}

//

interface RevealRounds {
    1: string,
    6: string,
    11: string,
    21: string,
    26: string,
}

export interface AppGamePlayer {
    user_id: string
    player_name: string
    hand: SuitCount
    revealed: RevealRounds
    role: string // for ref/convenience only, otherwise derived from column
    buy: number
    sell: number
    game_id: string
    is_admin: boolean
}

export interface AppLobbyPlayer extends AppGamePlayer {
    create_at?: any
    game_id?: string
}

export interface AppGameRole extends AppGamePlayer {
    role?: PlayerRole
}

export interface SuitHands {
    clubs: SuitCount
    diamonds: SuitCount
    hearts: SuitCount
    spades: SuitCount
}

export interface SuitReveals {
    clubs: string
    diamonds: string
    hearts: string
    spades: string
}

export interface SuitRevealsBool {
    clubs: boolean
    diamonds: boolean
    hearts: boolean
    spades: boolean
}

export interface SuitCount {
    clubs: number
    diamonds: number
    hearts: number
    spades: number
}

export type GetHandProps = Partial<SuitCount>

interface RevealedRoundSuits {
    [index: string]: GameCard | null
}

// export interface _OldGameDeck extends SuitHands {
//     game: GameDeck
//     game_id: string
//     reveals: {
//         [key: string]: RevealedRoundSuits
//     }
// }
export type AppGamePlayers = AppGamePlayer[]

export interface OldGamePlayers {
    game_id: string
    clubs: AppGameRole
    diamonds: AppGameRole
    hearts: AppGameRole
    spades: AppGameRole
    speculator1: AppGameRole
    speculator2: AppGameRole
    speculator3: AppGameRole
    speculator4: AppGameRole
    speculator5: AppGameRole
    speculator6: AppGameRole
}

export type GameUpdateProps = Partial<AppGame>

export interface NewGameProps {
    user: SupabaseUser
    maximumSpread: number,
    creatorRole: SuitName,
    playerName: string,
}

export interface CreatedGameResult {
    data: any
    error: any
    success: boolean
}

export type GamePlayers = AppUser[]

export interface SupabaseUser {
    app_metadata: {
        provider?: string
        [key: string]: any
    }
    aud: string
    confirmation_sent_at?: string
    confirmed_at?: string
    created_at: string
    email?: string
    email_confirmed_at?: string
    id: string
    identities?: any[]
    last_sign_in_at?: string
    phone?: string
    role?: string
    updated_at?: string
    user_metadata: {
        [index: string]: any
    }
}

export interface AuthCheckResult {
    success: boolean
    user: SupabaseUser
}

export interface SupabaseAuthSession {
    currentSession: {
        access_token: string
        expires_at: number
        expires_in: number
        provider_token: string
        refresh_token: string
        token_type: string
        user: SupabaseUser
    }
    expiresAt: number
}

export type PotentialAuthToken = string | SupabaseAuthSession

export interface CreateGameResults {
    data: any
    error: any
    type: string
    success: boolean
}

export type EndGameFunction = (game_id: string) => Promise<any>

// TRADES

export interface GameTrade {
    game_id: string
    market: SuitName | ''
    price: number
    round: number
    actor: string
    buy: boolean
}

export type TradeLedger = GameTrade[]

export type TradeValue = null | number
export interface TradeValues {
    [index: string]: TradeValue
}