<div class="admin-layout">
    <h1>Admin</h1>
    {#if localUser}
        <slot />
    {/if}
</div>

<script lang="ts">
    import { browser } from "$app/env";
    import { getAuthenticatedUser } from "$lib/actions";
    import { redirect } from "$lib/helpers";
    import { currentUser } from "$lib/state";
    import { onMount } from "svelte";

    const admins = [
        'winger.shane@gmail.com',
        'shane@fulcrum.house',
        'p.tulip@imperial.ac.uk',
    ]

    $:localUser = null

    // currentUser.subscribe((newUser) => {
    //     if(newUser.id && admins.indexOf(newUser.email) !== -1){
    //         console.log('1')
    //     }
    //     else{
    //         console.log('2: ', newUser)
    //     }
    // })
    async function checkUser(){
        let u = await getAuthenticatedUser()
        console.log('u: ', u)
        // if(u && admins.indexOf(u.email) !== -1){
        //     localUser = u
        // }
        // else{
        //     browser && redirect('/')
        // }
    }
    // onMount(() => {
    //     checkUser()
    // })
</script>