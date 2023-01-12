<script lang="ts">
    import Button from "$lib/components/button/button.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
    import { joinLobby, setLoadingModal } from "$lib/actions";
    import { currentUser } from "$lib/state";
import { get } from "svelte/store";

    export let playerName: string = ''
    export let gameId: string = ''
    
    // update player name
    export let updatePlayerName = (value: string) => {}
    function onUpdatePlayerName({target}: any){
        updatePlayerName(target.value)
    }
    // update game id
    export let updateGameId = (value: string) => {}
    function onUpdateGameId({target}: any){
        updateGameId(target.value)
    }
    // join game
    export let submit = () => {
        console.log('submitting to supabase')
        joinActiveGame()

    }

    function joinActiveGame(){
        setLoadingModal(true)

        joinLobby(gameId, {
            user_id: get(currentUser).id,
            player_name: playerName
        })
    }
</script>

<div class="login">
    <TextInput value={playerName} onUpdate={onUpdatePlayerName} placeholder="Enter a player name" />
    <TextInput value={gameId} onUpdate={onUpdateGameId} placeholder="Enter a Game ID" />
    <div class="button-container">
        <Button type="proceed" label="Join Game" action={submit} />
    </div>
</div>

<style>
    .login {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-gap: 15px;
        padding-top: 30px;
    }
</style>