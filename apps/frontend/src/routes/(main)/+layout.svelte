<script lang="ts">
  import { type Component, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { client } from '$lib/utils/api';
  import clsx from 'clsx';
  import ArchiveOutlineIcon from 'virtual:icons/ion/archive-outline';
  import CheckboxOutlineIcon from 'virtual:icons/ion/checkbox-outline';
  import FileTrayFullOutlineIcon from 'virtual:icons/ion/file-tray-full-outline';
  import PeopleOutlineIcon from 'virtual:icons/ion/people-outline';
  import type { User } from '$lib/types/user';
  import { updateJwt } from '$lib/stores/auth.svelte';
  import { getImageUrl } from '$lib/utils/user';

  let { children } = $props();

  let user = $state<User | null>(null);

  onMount(async () => {
    const res = await client.user.me.$get();
    if (!res.ok) {
      updateJwt(null);
      return goto('/');
    }
    const json = await res.json();
    user = json.user;
    updateJwt(json.token);
  });

  const menu = $derived.by(() => {
    switch (true) {
      case page.url.pathname.startsWith('/home'):
        return 'home';
      case page.url.pathname.startsWith('/wordlist'):
        return 'wordlist';
      case page.url.pathname.startsWith('/quizzes'):
        return 'quizzes';
      case page.url.pathname.startsWith('/friends'):
        return 'friends';
    }
    return null;
  });
</script>

<div class="wrapper">
  <nav class="nav">
    {#snippet item(path: string, tooltip: string, Icon: Component)}
      <a class={clsx('menu', { selected: menu === path })} href="/{path}">
        <Icon class="icon" />
        <span class="tooltiptext">{tooltip}</span>
      </a>
    {/snippet}

    {@render item('home', '단어 수집', ArchiveOutlineIcon)}
    {@render item('wordlist', '단어장', FileTrayFullOutlineIcon)}
    {@render item('quizzes', '퀴즈', CheckboxOutlineIcon)}
    {@render item('friends', '친구', PeopleOutlineIcon)}

    {#if user}
      <a class="user" href="/mypage">
        <img class="avatar" src={getImageUrl(user.image)} alt="프로필 이미지" />
        <span>{user.username}</span>
      </a>
    {/if}
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

      @media (max-width: 640px) {
        justify-content: flex-start;
      }

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

      .user {
        position: absolute;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        width: 160px;
        height: 38px;
        padding: 4px;
        margin-right: 40px;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 999px;
        color: black;
        text-decoration: none;

        @media (max-width: 640px) {
          width: 120px;
          margin-right: 0;
          font-size: 0.9rem;
        }

        img {
          width: 28px;
          height: 28px;
          border-radius: 99px;
        }

        span {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .content {
      flex: 1;
      padding: 16px;
    }
  }
</style>
