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
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import HelperText from '@smui/textfield/helper-text';
  import Select, {Option} from '@smui/select';
  import Card, {Content} from '@smui/card';
  import {createEventDispatcher} from 'svelte';
  import {reTransactionId} from '$utils';

  export let selectedListType = 'ALL';
  export let selectedProjectCategory = 'None';
  export let shouldBeDisabled = false;
  export let searchValue = '';
  export let showMarketPlaceFilters = false;

  const dispatch = createEventDispatcher();
  const listTypes = ['UNLISTED', 'LISTED', 'ALL'];
  const projectCategories = [
    'Renewable Energy',
    'Energy Efficiency',
    'Waste Management',
    'Forestry and Conservation'
  ]; // Todo: Fetch from the services for the MMP.

  interface SearchFormData {
    s: string;
  }

  const handleSearchSubmit = (event: Event) => {
    const form = event.target as HTMLFormElement;
    if (!form.checkValidity()) return form.reportValidity();

    const formData = new FormData(form) as unknown as Iterable<
      [SearchFormData, FormDataEntryValue]
    >;

    const queryString = new URLSearchParams(Object.fromEntries(formData));
    queryString && dispatch('search', queryString);
  };

  const handleProjectCatetorySelect = (event: Event) => {
    const mdcWrapper = event.target as HTMLDivElement;
    const {textContent} = mdcWrapper.querySelector('label') as HTMLLabelElement;
    selectedProjectCategory !== 'None'
      ? dispatch('filter', {[textContent]: [selectedProjectCategory]})
      : dispatch('filter:reset');
  };
</script>

<Card style="margin-top:1rem">
  <Content>
    <div>
      <form
        aria-label="Search for a transaction"
        action="/account/tx"
        method="get"
        on:submit|preventDefault={handleSearchSubmit}
      >
        <Textfield
          required
          variant="outlined"
          value={searchValue}
          label="Find transaction"
          style="width: 100%"
          disabled={shouldBeDisabled}
          type="search"
          input$name="s"
          input$pattern={reTransactionId.source}
        >
          <Icon class="material-icons" slot="leadingIcon">receipt_long</Icon>
          <HelperText slot="helper">ex. 0.0.100@123.456</HelperText>
        </Textfield>
      </form>
    </div>

    <div>
      <Select
        variant="outlined"
        bind:value={selectedListType}
        label="Type"
        style="width: 100%"
        disabled={shouldBeDisabled}
        on:MDCSelect:change={() => {
          dispatch('filter', selectedListType);
        }}
      >
        {#each listTypes as listType}
          <Option value={listType}>{listType}</Option>
        {/each}
      </Select>
    </div>

    {#if showMarketPlaceFilters}
      <div>
        <Select
          variant="outlined"
          bind:value={selectedProjectCategory}
          label="Project Category"
          style="width: 100%"
          on:MDCSelect:change={handleProjectCatetorySelect}
        >
          <Option value="None">None</Option>
          {#each projectCategories as projectCategory}
            <Option value={projectCategory}>{projectCategory}</Option>
          {/each}
        </Select>
      </div>
    {/if}
  </Content>
</Card>

<style>
  div {
    margin-top: 1rem;
  }
</style>
