<Backdrop>
    <div class="content flex">
        {#if completed}
            <div class="modal-content flex fd-col ai-start">
                <h1>Congratulations!</h1>
                <p>Your new password has been set.</p>
                <div class="button-container">
                    <Button 
                        label="Ok, continue"
                        action={next}
                    />
                </div>
            </div>
        {:else}
            <div class="modal-content flex fd-col ai-start">
                <h1>Update your password</h1>
                <!-- <p>You're logging in for the first time, please set a new password.</p> -->
                <p class="small">Your password should be at least 8 characters long </p>
                <form action="" class="form">
                    {#if editingPassword}
                        {#if showPwd}
                            <TextInput value={newPassword} onUpdate={onUpdatePassword} placeholder="Enter your new password" icon="lock" />
                            <TextInput value={newPasswordRepeat} onUpdate={onUpdatePasswordRepeat} placeholder="Confirm your new password" icon="lock" />
                        {:else}
                            <PasswordInput value={newPassword} onUpdate={onUpdatePassword} placeholder="Enter your new password" />
                            <PasswordInput value={newPasswordRepeat} onUpdate={onUpdatePasswordRepeat} placeholder="Confirm your new password" />
                        {/if}
                        <div class="form-controls">
                            {#if !match}
                            <div class="warning">
                                <p>Your passwords do not match!</p>
                            </div>
                            {/if}
                            <div class="button-container flex jc-between">
                                <Button 
                                    fill={false} 
                                    type="proceed" 
                                    label="Update Password" 
                                    action={submit} 
                                    disabled={newPasswordRepeat !== newPassword || newPassword.length < 8}
                                />
                                <button class="show-pwd flex" on:click={toggleShowPwd}>
                                    Show Password 
                                    {#if showPwd}
                                        <Icon icon="eye" />
                                    {:else}
                                        <Icon icon="eyeOff" />
                                    {/if}
                                </button>
                            </div>
                            <!-- end -->
                        </div>
                    {:else}
                        <div class="during-update">
                            <h2>Updating your password</h2>
                            <div class="new-password is-loading flex jc-start">
                                {#each newPassword as _}
                                    <div class="pwd-hash"></div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </form>
            </div>
        {/if}
    </div>
</Backdrop>

<style>
    .is-loading {
        height: 50px;
        padding: 10px;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .content {
        height: 100%;
        width: 100%;
    }

    .modal-content {
        background: lightgray;
        padding: 30px;
        border-radius: 8px;
        width: 550px;
    }

    .form {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, auto);
        gap: 10px;
    }

    h1 {
        font-size: 1.4em;
        margin: 0 0 20px;
    }

    p {
        margin: 0 0 35px;
    }

    p.small {
        opacity: 0.7;
        font-weight: 100;
    }

    .pwd-hash {
        height: 6px;
        width: 6px;
        border-radius: 6px;
        margin-right: 6px;
        display: flex;
        background: gray;
    }

    .new-password {
        width: 100%;
    }

    .button-container {
        margin-top: 30px;
    }
    
    .warning {
        color: var(--red)!important;
    }

    .warning p {
        font-weight: 500;
    }

    .show-pwd {
        font-size: 0.9em;
    }

</style>

<script lang="ts">
    import { setLoadingModal, updatePassword } from "$lib/actions";
    import PasswordInput from "$lib/components/input/password-input.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
    import Backdrop from "$lib/components/app/backdrop.svelte";
    import { Logger, redirect } from "$lib/helpers";
    import { currentUser, showPasswordUpdater } from "$lib/state";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import Button from "$lib/components/button/button.svelte";
    import Icon from "$lib/components/icon/icon.svelte";
    import type { TextInputEvent } from "$lib/types";
    let editingPassword = true
    let completed = false
    let newPassword: string = ""
    let newPasswordRepeat: string = ""
    let touched = {
        a: false, 
        b: false
    }
    let match: boolean = newPassword === newPasswordRepeat
    let showPwd: boolean = false

    // type TextInputEvent = svelte.JSX.ChangeEventHandler<HTMLInputElement>

    function onUpdatePassword({currentTarget}: TextInputEvent){
        newPassword = currentTarget.value
        if(!touched.a){ touched.a = true}
        checkMatch()
    }
    
    function onUpdatePasswordRepeat({target}: TextInputEvent){
        newPasswordRepeat = target.value
        if(!touched.b){ touched.b = true}
        checkMatch()
    }
    
    function checkMatch(){
        if(touched.a && touched.b){
            match = newPassword === newPasswordRepeat
        }
    }

    function toggleShowPwd(){
        showPwd = !showPwd
    }

    function submit(){
        editingPassword = false
        updateUserPassword()
    }

    async function updateUserPassword(){
        updatePassword(newPassword)
        .then((result) => {
            completed = true
            Logger(['success! updated password: ', result])
            if($page.url.pathname === '/update-password'){
                redirect('/')
            }
        })
        .catch((err) => {
            Logger(['error updating password: ', err])
            // show error message here
        })
        .finally(() => {
            !editingPassword && (editingPassword = true)
        })
    }

    const next = () => {
        browser && location.reload()
        // showPasswordUpdater.set(false)
        // browser && redirect('/')
        // setTimeout(() => {
        // })
    }
</script>