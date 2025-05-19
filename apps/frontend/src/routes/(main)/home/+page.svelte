<script lang="ts">
  import { client } from '$lib/utils/api';

  let url = $state('');
  let resultPromise = $state<Promise<string> | null>(null);

  async function submitUrl() {
    resultPromise = client.collect.$post({ json: { url } }).then(async (res) => {
      const resultText = await res.text();
      return resultText;
    });

    url = '';
  }
</script>

<div class="wrapper">
  <h2>마음에 드는 글의 내용이나 링크를 넣어보세요</h2>
  <form class="form">
    <div class="inputbar">
      <textarea bind:value={url} style:height={`${url.split('\n').length * 1.6}rem`}></textarea>
      <div class="toolbar">
        <button class="submit" onclick={submitUrl}>입력</button>
      </div>
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

    .form {
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 0 20px;
    }

    .inputbar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 768px;
      padding: 12px 16px;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      background-color: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

      textarea {
        width: 100%;
        height: 3.2rem;
        min-height: 3.2rem;
        max-height: 16rem;
        border: 0;
        background: none;
        color: #343541;
        font-size: 1rem;
        line-height: 1.6;
        outline: none;
        resize: none;
      }

      .toolbar {
        display: flex;
        justify-content: flex-end;
        width: 100%;

        .submit {
          padding: 6px 10px;
          border: 0;
          border-radius: 8px;
          background-color: #111;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #333;
          }
        }
      }
    }

    .result {
      width: 100%;
      max-width: 768px;
      margin-top: 24px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e5e5e5;
      background-color: #f7f7f8;
      min-height: 150px;
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
      font-size: 0.95rem;
      line-height: 1.5;
      color: #343541;
    }
  }
</style>
