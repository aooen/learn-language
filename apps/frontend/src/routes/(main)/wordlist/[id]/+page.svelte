<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/utils/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { SiteType } from '@learn-language/shared/utils/siteType';

  type Word = Awaited<
    ReturnType<Awaited<ReturnType<(typeof client.words)[':wordlistId']['$get']>>['json']>
  >[number] & {
    selected: boolean;
  };

  let words: Word[] = $state([]);
  const wordlistId = $derived(page.params['id']);
  let wordlist: Awaited<
    ReturnType<Awaited<ReturnType<(typeof client.wordlist)[':id']['$get']>>['json']>
  > | null = $state(null);

  onMount(async () => {
    await Promise.all([
      (async () => {
        // 단어장 정보 가져오기
        const res = await client.wordlist[':id'].$get({ param: { id: wordlistId } });
        wordlist = await res.json();
      })(),
      (async () => {
        // 단어 목록 가져오기
        const res = await client.words[':wordlistId'].$get({ param: { wordlistId } });
        const data = await res.json();
        words = data.map((w) => ({
          ...w,
          selected: false,
        }));
      })(),
    ]);
  });

  async function deleteSelectedWords() {
    const selectedIds = words.filter((w) => w.selected).map((w) => w.id);
    if (selectedIds.length === 0) return;

    await client.words.delete.$post({
      json: { ids: selectedIds },
    });

    words = words.filter((w) => !w.selected);
  }
</script>

<h1 class="title">📚 수집된 단어 리스트</h1>

{#if words.length > 0}
  <div class="button-group">
    <button class="delete-btn" on:click={deleteSelectedWords}>선택 삭제</button>
    {#if wordlist?.sourceType === SiteType.Youtube}
      <button class="media-btn" on:click={() => goto(`/wordlist/${wordlistId}/media`)}>
        🎥 영상과 함께 보기
      </button>
    {/if}
  </div>

  <div class="table-wrapper">
    <table class="word-table">
      <thead>
        <tr>
          <th>✔</th>
          <th>단어</th>
          <th>뜻</th>
          <th>매체 횟수</th>
          <th>난이도</th>
        </tr>
      </thead>
      <tbody>
        {#each words as word (word.id)}
          <tr>
            <td><input type="checkbox" bind:checked={word.selected} /></td>
            <td>{word.word}</td>
            <td>
              {#if word.meaning === '뜻 없음'}
                <span class="no-meaning">(뜻 없음)</span>
              {:else}
                {word.meaning}
              {/if}
            </td>
            <td>{word.count}</td>
            <td>{(word.frequency / 100).toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="empty-text">불러올 수 있는 단어가 없습니다.</p>
{/if}

<style>
  .title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.5rem 0;
  }

  .empty-text {
    text-align: center;
    color: #6b7280;
    margin-top: 2rem;
  }

  .button-group {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .delete-btn {
    background-color: #ef4444;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease;
  }
  .delete-btn:hover {
    background-color: #dc2626;
  }

  .media-btn {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease;
  }
  .media-btn:hover {
    background-color: #2563eb;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .word-table {
    width: 95%;
    max-width: 64rem;
    margin: 0 auto;
    border-collapse: collapse;
    border: 1px solid #d1d5db;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 0.375rem;
  }

  .word-table th,
  .word-table td {
    padding: 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    border-top: 1px solid #e5e7eb;
  }

  .word-table thead {
    background-color: #f3f4f6;
    color: #374151;
  }

  .word-table tr:hover {
    background-color: #f9fafb;
  }

  .no-meaning {
    color: #9ca3af;
    font-style: italic;
  }
</style>
