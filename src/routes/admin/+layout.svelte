<div class="admin-layout">
    <h1>Admin</h1>
    {#if localUser}
        <slot />
    {/if}
</div>

<script lang="ts">
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { getAuthenticatedUser } from "$lib/actions";
    import { redirect } from "$lib/helpers";
    import { currentUser } from "$lib/state";
    const admins = [
        'winger.shane@gmail.com',
        'shane@fulcrum.house',
        'p.tulip@imperial.ac.uk',
        `s.sundaresan@imperial.ac.uk`,
    ]
    let localUser = null as any
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
        if(u && u.email && admins.indexOf(u.email) !== -1){
            localUser = u
        }
        else{
            browser && redirect('/')
        }
    }
    onMount(() => {
        checkUser()
    })
</script>
