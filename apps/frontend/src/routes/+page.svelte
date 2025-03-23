<script lang="ts">
  import { client } from '$lib/utils/api';

  let url = $state('');
  let resultPromise = $state<Promise<string> | null>(null);

  async function submitUrl() {
    resultPromise = client.collect.$post({ json: { url } }).then((res) => res.text());
    url = '';
  }
</script>

<div class="wrapper">
  <div class="inputbar">
    <input type="text" bind:value={url} />
    <ion-icon name="add-circle" onclick={submitUrl}></ion-icon>
  </div>

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
      width: 200px;
      padding: 4px;
      border: 2px solid #ccc;
      border-radius: 999px;

      input {
        flex: 1;
        border: 0;
        background: none;
      }

      ion-icon {
        font-size: 1.25rem;
        cursor: pointer;
      }
    }
  }
</style>
