<script lang="ts">
    import Button from "$lib/components/button/button.svelte";
    import PasswordInput from "$lib/components/input/password-input.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
    import type { AppErrors } from "$lib/types";
    import { appErrors } from "$lib/state";
    import { setLoadingModal, updateActiveUser } from "$lib/actions";
    import Icon from "../icon/icon.svelte";
    export let email: string = ''
    export let password: string = ''
    export let updateEmail = (value: string) => {}
    export let updatePassword = (value: string) => {}

    function onUpdateEmail({target}){ 
        updateEmail(target.value)
    }
    function onUpdatePassword({target}){ 
        updatePassword(target.value)
    }

    export let onSubmit: (params: any) => any = async (submission: any) => {
        console.log('submitting')
        console.table(submission)
    }

    async function submit(){
        if(onSubmit && typeof onSubmit === 'function'){
            
            setLoadingModal(true)

            // console.log('submitting in login.svelte')
            
            let signedIn = await onSubmit({email, password})
            
            // console.log('result of sign in...: ', signedIn)

            if(signedIn.error){
                const ers: AppErrors = [{
                    message: signedIn.error.message,
                    code: signedIn.error.status,
                }]
                // store reference to error in app state
                appErrors.set([ers])
                setLoadingModal(false)
            }
            else if(signedIn && signedIn.user){
                // store new user
                console.log('should store new user')
                updateActiveUser(signedIn.user)
                setLoadingModal(false)
            }
        }
    }

</script>

<div class="login">
    <div class="title flex jc-start">
        <p>Log-in</p>
    </div>
    <TextInput value={email} onUpdate={onUpdateEmail} placeholder="Enter your email" />
    <PasswordInput value={password} onUpdate={onUpdatePassword} placeholder="Enter your password" />
    <div class="button-container">
        <Button type="proceed" label="Log-in" action={submit} />
    </div>
</div>

<style>
    .login {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr 1fr auto;
        grid-gap: 8px;
        /* padding-top: 30px; */
    }

    .button-container {
        margin-top: 20px;
    }

    .title {
        font-size: 1.15em;
        margin: 0 0 25px;
        text-align: left;
        width: 100%;
    }

    .title p{
        font-size: 16pt;;
        font-weight: bold;
    }
</style>