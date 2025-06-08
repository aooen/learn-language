<script lang="ts">
  import { onMount } from 'svelte';
  import { determineSiteType, SiteType } from '@learn-language/shared/utils/siteType';
  import { client } from '$lib/utils/api';
  import type { Collecting } from '$lib/types/collecting';
  import CollectingItem from './CollectingItem.svelte';

  const COLLECTING_DURATION = 1000;

  let text = $state('');
  let collecting: Collecting[] = $state([]);

  const isUrl = $derived(text && /^https?:\/\//.test(text) && !/[ \n]/.test(text));
  const isPlainUrl = $derived(isUrl && determineSiteType(text) === SiteType.Plain);

  async function loadCollecting() {
    const res = await client.collect.$get();
    collecting = (await res.json()).collecting;
    if (collecting.find((c) => c.progress.startsWith('0') && !c.error)) {
      setTimeout(loadCollecting, COLLECTING_DURATION);
    }
  }

  async function submitUrl() {
    if (isPlainUrl) {
      alert('현재 지원되지 않는 URL입니다.');
      return;
    }

    client.collect.$post({ json: isUrl ? { url: text } : { text } }).then(async (res) => {
      const resultText = await res.text();
      return resultText;
    });

    text = '';
    setTimeout(loadCollecting, COLLECTING_DURATION);
  }

  onMount(() => {
    loadCollecting();
  });

  async function deleteCollecting(id: number) {
    await client.collect[':id'].$delete({ param: { id: String(id) } });

    const res = await client.collect.$get();
    collecting = (await res.json()).collecting;
  }
</script>

<div class="wrapper">
  <h2>마음에 드는 글의 내용이나 링크를 넣어보세요</h2>
  <form class="form">
    <div class="inputbar">
      <textarea bind:value={text} style:height={`${text.split('\n').length * 1.6}rem`}></textarea>
      <div class="toolbar">
        <button class="submit" onclick={submitUrl}>{isUrl ? '가져오기' : '입력'}</button>
      </div>
    </div>
  </form>

  {#if collecting.length > 0}
    <div class="collecting-list">
      {#each collecting as c (c.id)}
        <CollectingItem collecting={c} {deleteCollecting} />
      {/each}
    </div>
  {/if}
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

    .collecting-list {
      display: flex;
      align-items: center;
      flex-direction: column;
      width: 100%;
      margin: 30px 0 10px;
    }
  }
</style>
