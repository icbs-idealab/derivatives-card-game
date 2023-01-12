<script lang="ts">
  import Icon from "../icon/icon.svelte";
  export let type = "default";
  export let label = "";
  export let action;
  export let disabled: boolean = false;
  export let icon = '';
  export let active: boolean = false
  export let fill: boolean = false;
  function handleClick() {
    if (action && typeof action === "function") {
      action();
    }
  }
</script>

<button 
  class="button" 
  data-button-type={type} 
  data-fill={fill} 
  data-active={active}
  data-no-text={!label}
  on:click={handleClick} 
  disabled={disabled}
>
  <div class="button-content flex">
    {#if label !== ""}
      {label}
    {/if}
    {#if icon}
      <span class="button-icon-wrapper flex">
        <Icon icon={icon} />
      </span>
    {/if}
  </div>
  <div class="overlay"></div>
</button>


<style>
  .button {
    border-radius: 6px;
    border: none;
    text-transform: capitalize;
    font-size: 0.85em;
    font-weight: 100!important;
    position: relative;
    width: auto;
    max-width: 300px;
    overflow: hidden;
    position: relative;
    /* margin-right: 10px; */
    /* box-shadow: var(--button-shadow-a)!important; */
  }

  button[disabled]{
    opacity: 0.8;
    color: gray;
    /* box-shadow: none; */
  }

  .button[data-fill="true"]{ width: 100%; }

  .button:not([disabled]):hover {
    box-shadow: none;
    opacity: 0.9;
  }

  .button-content {
    font-weight: 100;
    font-size: inherit;
    padding: 10px 20px;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  [data-no-text="true"] .button-icon-wrapper {
    margin: 0!important;
  }

  [data-no-text="true"] .button-content {
    padding: 10px!important;
  }

  [data-button-type="end"] {
    background: transparent;
    border: solid thin var(--dm-light);
    color: white;
    text-transform: capitalize;
  }

  [data-button-type="reset"] {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 0;
    text-decoration: underline;
    /* color: white; */
    text-transform: capitalize;
  }

  [data-button-type="reset"] .button-content {
    padding: 0;
  }

  [data-button-type="proceed"] {
    background: var(--dm-darker);
    color: white;
  }

  [data-button-type="save"] {
    background: var(--green);
    color: white;
  }

  [data-button-type="create"] {
    background: var(--deep-green);
    color: white;
  }

  [data-button-type="revert"] {
    border: solid thin var(--dm-lighter);
    background: transparent;
    color: var(--dm-white);
  }

  [data-button-type="info"] {
    background: var(--deep-blue);
    color: white;
  }

  [data-button-type="delete"] {
    background: var(--yellow);
    color: black;
  }

  [data-button-type="delete-perm"] {
    background: var(--red);
    color: white;
  }

  [data-button-type="default"] {
    background: var(--dm-default-button);
    color: var(--dm-white);
  }

  [data-button-type="tab"]:last-child {
    border-left: none
  }

  [data-button-type="tab"] {
    width: 100%;
    /* background: var(--dm-default-button); */
    background: lightgray;
    color: var(--dm-default-button);
    /* color: var(--dm-white); */
    border-radius: 0;
    box-shadow: none;
    border: solid thin lightgray;
    border-top: none;
  }

  [data-button-type="tab"][data-active="true"] {
    background: transparent;
    color: var(--dm-default-button);
    border-bottom: none;
  }

  .button-icon-wrapper {
    margin-left: 10px;
  }
</style>