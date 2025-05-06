<script lang="ts">
  import { client } from '$lib/utils/api';
  import { onMount } from 'svelte';

  let data = $state<any[]>([]);

  onMount(() => {
    (async () => {
      const res = await client.wordlist.$get();
      const json = await res.json();
      data = json.wordlist;
    })();
  });
</script>

<div class="container">
  {#if data}
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>DSOF</th>
        </tr>
      </thead>
      <tbody>
        {#each data as item (item.id)}
          <tr>
            <td>{item.id}</td>
            <td>{item.dsof}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>Loading data...</p>
  {/if}
</div>

<style>
  .container {
    margin: 1rem 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  th {
    font-weight: bold;
  }
</style>
