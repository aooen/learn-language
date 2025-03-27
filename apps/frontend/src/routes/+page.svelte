<script lang="ts">
  import { client } from '$lib/utils/api';
  import AddIcon from 'virtual:icons/ion/add';

  let url = $state('');
  let resultPromise = $state<Promise<string> | null>(null);

  async function submitUrl() {
    resultPromise = client.collect.$post({ json: { url } }).then((res) => res.text());
    url = '';
  }
</script>

<div class="wrapper">
  <form>
    <div class="inputbar">
      <input type="text" bind:value={url} />
      <button onclick={submitUrl}>
        <AddIcon class="icon" />
      </button>
    </div>
  </form>

  {#await resultPromise}
    loading...
  {:then result}
    {#if result}
      <textarea class="result">{result}</textarea>
    {/if}
  {/await}
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .inputbar {
      display: flex;
      align-items: center;
      overflow: hidden;
      width: 100%;
      max-width: 400px;
      padding: 8px;
      border: 2px solid #ccc;
      border-radius: 999px;

      input {
        flex: 1;
        border: 0;
        background: none;
        outline: none;
        font-size: 1.05rem;
      }

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background-color: #f5f5f5;
        color: #555;
        font-size: 1.1rem;
        cursor: pointer;
      }
    }
  }
</style>
