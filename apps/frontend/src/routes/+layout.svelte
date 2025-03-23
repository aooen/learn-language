<script lang="ts">
  import './index.css';

  let { children } = $props();
</script>

<div class="wrapper">
  <nav class="nav">
    <div class="menu">
      <ion-icon name="archive-outline"></ion-icon>
      <span class="tooltiptext">단어 수집</span>
    </div>
  </nav>

  <div class="content">
    {@render children()}
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    height: 100%;

    .nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 4px;
      border-right: 1px solid #eee;
      background-color: #f5f5f5;

      .menu {
        position: relative;
        display: flex;
        padding: 8px;
        border-radius: 5px;
        cursor: pointer;
        transition: 0.2s background;

        ion-icon {
          font-size: 1.25rem;
        }

        .tooltiptext {
          position: absolute;
          top: 50%;
          left: 105%;
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
          transform: translateY(-50%);
        }

        &:hover {
          background-color: #eee;

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
