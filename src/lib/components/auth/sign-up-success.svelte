<script lang="ts">
	import { showSignUpSuccessMessageWithEmail } from "$lib/state";
	import Backdrop from "../app/backdrop.svelte";
</script>

<Backdrop>
    <div class="message flex">
        <div class="content">
            <h3>You successfully signed up!</h3>
            <p>Please check your email address <span>({$showSignUpSuccessMessageWithEmail})</span> for a verification link to enable access to this site.</p>
        </div>
    </div>
</Backdrop>

<style>
    .message {
        width: 100%;
        height: 100%;
        padding: 10px;
    }

    h3 {
        margin-top: 0;
    }

    .content {
        background-color: var(--dm-white);
        padding: 30px;
        border-radius: 18px;
        max-width: 600px;
    }
</style>