<script lang="ts">
    import TabConent from "$lib/components/tabs/tab-conent.svelte";
    import TabbedContainer from "$lib/components/tabs/tabbed-container.svelte";
    import Tabs from "$lib/components/tabs/tabs.svelte";
    import { requestAccess, signIn, signUp } from "$lib/actions";
    import Login from "./login.svelte";
    import { Logger } from "$lib/helpers";
	import type { SvelteComponent } from "svelte";
	import Button from "../button/button.svelte";
	import Signup from "./signup.svelte";
	import { showSignUpSuccessMessageWithEmail } from "$lib/state";
    // import { onMount } from "svelte";
    // import { user } from "$lib/state";
    // import { browser } $app.environment;
    // import { goto } from "$app/navigation";
    // vars
    $:email = '' as string
    $:password = '' as string
    $:signUpPassword = '' as string
    //
    let showSignUpSuccessMessage = false
    const tabs = [
        {
            label: 'Log-in',
            id: 'login',
            icon: 'user',
            onClick: () => setShow('login')
        },
        {
            label: 'Sing-Up',
            id: 'signup',
            icon: 'request',
            onClick: () => setShow('signup')
        },
    ]

    export let show: string = tabs[0].id

    function showSignup(){show = tabs[1].id}
    function showLogin(){show = tabs[0].id}

    function setShow(target: any){
        Logger(['setting...'])
        show = target
    }

    const submit = async ({email, password, message}: any) => {
        Logger(['async submit'])
        if(show === 'login'){
            // handle log-in submission
            Logger(['handling login: ', email, ' ', password])
            const newUser = await signIn(email, password)
            Logger(['new user is: ', newUser])
            return newUser
        }
        else {
            // handle request submission
            Logger(['handling request: ', email, ' / ', signUpPassword])
            const {data, error} = await signUp(email, signUpPassword)
            if(data.user && data.user.email){
                showSignUpSuccessMessageWithEmail.set(data.user.email)
            }
            return {data, error}
        }
    }

    const updateEmail = (value: any) => {
        email = value
        Logger(['updating'])
    }
    function updatePassword(value: any){password = value}
    function updateSignUpPassword(value: any){signUpPassword = value}

    const components: {[index: string]: any} = {
        'login': Login,
        'signup': Signup
    }

    $:currentComponent = components[show]

    $: tabButtons = [
        {label: 'Log-in', action: showLogin, active: show === 'login'},
        {label: 'Sign-up', action: showSignup, active: show === 'signup'},
    ]
</script>

<TabbedContainer tabButtons={tabButtons}>
    {#if show === 'login'}
        <Login onSubmit={submit} email={email} password={password} updateEmail={updateEmail} updatePassword={updatePassword} />
    {:else}
        <Signup onSubmit={submit} email={email} password={signUpPassword} updateEmail={updateEmail} updatePassword={updateSignUpPassword} />
    {/if}
</TabbedContainer>