<div class="app-route flex" id="auth">
    <div class="status-container">
        <h1>App Status</h1>
        <ul>
            {#each statusItems as item}
                <li class="status item flex jc-start">
                    <Icon icon="info" size={"24px"} />
                    <p class="status-value">
                        <span class="label">{item.label}</span>
                        <span class="value">{item.value || 'No value'}</span>
                    </p>
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    h1 {
        font-size: 1.2em;
    }

    ul {
        font-weight: 100;
        margin: 0;
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(3, auto);
        grid-gap: 10px;
        grid-template-rows: auto;
        list-style: none;
    }

    li {
        padding: 0 10px;
    }

    .status-value {
        margin-left: 5px;
    }

    .status-value .label {
        font-size: 80%;
    }

    .status-value .value {
        font-size: 80%;
    }

</style>

<script lang="ts">
    import { onMount, afterUpdate } from "svelte";
    import Icon from "$lib/components/icon/icon.svelte";
    import { currentUser } from "$lib/state";
    import { findGamePlayerById } from "$lib/helpers";
    import type { AppGamePlayer } from "$lib/types";
    
    let player: AppGamePlayer | null
    let u: any = $currentUser

    onMount(() => {
        // populate dependencies
        player = findGamePlayerById()
    })

    $:statusItems = [
        {
            label: 'User ID',
            value: $currentUser.id
        },
        {
            label: 'User Email',
            value: $currentUser.email
        },
        {
            label: 'Player Name',
            value: player && player.player_name
        },
    ]    

    afterUpdate(() => {
        console.log('u: ', u)
    })
</script>