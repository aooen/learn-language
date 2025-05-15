<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/utils/api';

  type Word = {
    id: number;
    word: string;
    meaning: string;
    count: number;
    level: number;
    selected?: boolean;
  };

  let words: Word[] = [];

  onMount(async () => {
    const res = await client.words.$get();
    const data = await res.json();
    words = (data as Word[]).map((w) => ({
      ...w,
      selected: false,
    }));
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

<h1>수집된 단어 리스트</h1>

{#if words.length > 0}
  <button on:click={deleteSelectedWords}>선택 삭제</button>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>ID</th>
        <th>단어</th>
        <th>뜻</th>
        <th>매체 횟수</th>
        <th>난이도</th>
      </tr>
    </thead>
    <tbody>
      {#each words as word (word.id)}
        <tr>
          <td>
            <input type="checkbox" bind:checked={word.selected} />
          </td>
          <td>{word.id}</td>
          <td>{word.word}</td>
          <td>{word.meaning}</td>
          <td>{word.count}</td>
          <td>{word.level}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>불러올 수 있는 단어가 없습니다.</p>
{/if}

<style>
  h1 {
    text-align: center;
    margin-bottom: 1rem;
  }

  table {
    width: 90%;
    max-width: 800px;
    margin: 0 auto;
    border-collapse: collapse;
  }

  th,
  td {
    border: 1px solid #ccc;
    padding: 12px;
    text-align: center;
  }

  th {
    background-color: #f4f4f4;
  }
</style>
