<div class="loader"></div>

<style>
  .loader {
    width: 100%;
    height: 100%;
    max-width: 48px;
    max-height: 48px;
    border-radius: 50%;
    display: inline-block;
    border-top: 3px solid var(--primary);
    border-right: 3px solid transparent;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>