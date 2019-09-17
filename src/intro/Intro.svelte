<script>
  import Config from "./config.js";
  const introKey = "introWasShowen";

  function startIntro() {
    const introWasShown = window.localStorage.getItem(introKey);

    const intro = introJs();

    if (!introWasShown) {
      intro.setOptions(Config).start();

      intro.onexit(function() {
        window.localStorage.setItem(introKey, true);
      });
    }
  }
</script>

<svelte:window on:load={startIntro} />
