<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { client } from '$lib/utils/api';
  import clsx from 'clsx';
  import ArchiveOutlineIcon from 'virtual:icons/ion/archive-outline';
  import FileTrayFullOutlineIcon from 'virtual:icons/ion/file-tray-full-outline';
  import { updateJwt } from '$lib/stores/auth.svelte';

  let { children } = $props();

  onMount(async () => {
    // 유효한 jwt token인지 확인
    const res = await client.user.me.$get();
    if (!res.ok) {
      updateJwt(null);
      return goto('/');
    }
    const json = await res.json();
    updateJwt(json.token);
  });

  const menu = $derived.by(() => {
    switch (true) {
      case page.url.pathname.startsWith('/home'):
        return 'home';
      case page.url.pathname.startsWith('/wordlist'):
        return 'wordlist';
    }
    return null;
  });
</script>

<div class="wrapper">
  <nav class="nav">
    <a class={clsx('menu', { selected: menu === 'home' })} href="/home">
      <ArchiveOutlineIcon class="icon" />
      <span class="tooltiptext">단어 수집</span>
    </a>

    <a class={clsx('menu', { selected: menu === 'wordlist' })} href="/wordlist">
      <FileTrayFullOutlineIcon class="icon" />
      <span class="tooltiptext">단어장</span>
    </a>
  </nav>

  <div class="content">
    {@render children()}
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;

    .nav {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding: 8px;
      border-right: 1px solid #eee;
      background-color: #f5f5f5;

      .menu {
        position: relative;
        display: flex;
        padding: 8px;
        border-radius: 5px;
        color: black;
        font-size: 1.1rem;
        transition: 0.2s background;

        .tooltiptext {
          position: absolute;
          top: 105%;
          left: 50%;
          z-index: 1;
          width: max-content;
          padding: 2px 4px;
          background-color: #000a;
          border-radius: 6px;
          color: #fff;
          font-size: 0.75rem;
          text-align: center;
          opacity: 0;
          transition: 0.4s opacity;
          visibility: hidden;
          transform: translateX(-50%);
        }

        &.selected {
          background-color: #fff;
          cursor: default;
          pointer-events: none;
        }

        &:not(.selected):hover {
          background-color: #e8e8e8;

          .tooltiptext {
            visibility: visible;
            opacity: 1;
          }
        }
      }
    }

    .content {
      flex: 1;
      padding: 16px;
    }
  }
</style>
