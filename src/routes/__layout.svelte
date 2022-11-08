<!--
Copyright 2022 Tolam Earth

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
<script lang="ts">
  import Header from '$lib/header.svelte';
</script>

<Header />

<slot />

<style lang="scss">
  @use '@material/typography/index' as typography;
  :global(h6) {
    @include typography.typography('headline6');
    font-size: 1.1rem;
    color: #fc5130;
  }

  :global(h2) {
    font-family: 'Roboto';
    color: #5d5d5d;
  }

  :global(body) {
    margin: 0;
  }
</style>
