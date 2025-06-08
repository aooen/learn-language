<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { client } from '$lib/utils/api';
  import { userStore } from '$lib/stores/user.svelte';
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

  let sortKey: 'count' | 'frequency' | null = $state(null);
  let sortOrder: 'asc' | 'desc' = $state('asc');

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
        sortBy('count');
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

  function sortBy(key: 'count' | 'frequency') {
    if (sortKey === key) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortOrder = 'desc';
    }
    words = [...words].sort((a, b) => {
      const aValue = a[key] ?? 0;
      const bValue = b[key] ?? 0;
      if (aValue === bValue) return 0;
      if (sortOrder === 'asc') return aValue - bValue;
      return bValue - aValue;
    });
  }

  async function makeQuizSet() {
    const res = await client.quizSet.$post({ json: { wordlistId: Number(wordlistId) } });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        goto(`/quizzes/${data.quizSetId}`);
        return;
      }
    }

    alert('퀴즈 세트 생성에 실패했습니다.');
  }
</script>

<h1 class="title">📚 수집된 단어 리스트</h1>

{#if words.length > 0}
  <div class="button-group">
    {#if userStore.user && userStore.user.id === wordlist?.userId}
      <button class="delete-btn" onclick={deleteSelectedWords}>선택 삭제</button>
    {/if}
    <button class="media-btn" onclick={makeQuizSet}>퀴즈 만들기</button>
    {#if wordlist?.sourceType === SiteType.Youtube}
      <button class="media-btn" onclick={() => goto(`/wordlist/${wordlistId}/media`)}>
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
          <th class="sortable" onclick={() => sortBy('count')}>
            매체 횟수
            {#if sortKey === 'count'}
              {sortOrder === 'asc' ? '▲' : '▼'}
            {/if}
          </th>
          <th class="sortable" onclick={() => sortBy('frequency')}>
            난이도
            {#if sortKey === 'frequency'}
              {sortOrder === 'asc' ? '▲' : '▼'}
            {/if}
          </th>
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
            <td>
              <div class="star-rating">
                <div class="star-rating-filled" style="width: {(1 - word.frequency) * 100}%">
                  ★★★★★
                </div>
                <div class="star-rating-empty">☆☆☆☆☆</div>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="empty-text">불러올 수 있는 단어가 없습니다.</p>
{/if}

<style lang="scss">
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

    &:hover {
      background-color: #dc2626;
    }
  }

  .media-btn {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #2563eb;
    }
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

    th,
    td {
      padding: 0.5rem;
      text-align: center;
      font-size: 0.875rem;
      border-top: 1px solid #e5e7eb;
    }

    thead {
      background-color: #f3f4f6;
      color: #374151;

      .sortable {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    tr:hover {
      background-color: #f9fafb;
    }
  }

  .no-meaning {
    color: #9ca3af;
    font-style: italic;
  }

  .star-rating {
    position: relative;
    width: fit-content;
    margin: 0 auto;

    .star-rating-filled {
      position: absolute;
      left: 0;
      overflow: hidden;
    }
  }
</style>
