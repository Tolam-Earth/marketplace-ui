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
  import DataTable, {Body, Row, Cell} from '@smui/data-table';
  import IconButton, {Icon} from '@smui/icon-button';
  import Accordion, {Panel, Header, Content} from '@smui-extra/accordion';
  import startCase from 'lodash/startCase';
  import type {ESGMRV} from '$types';

  export let credentialSubject: ESGMRV;
</script>

<div style="margin-top: 1rem">
  {#if credentialSubject['type'] === 'array'}
    <DataTable table$aria-label="credential-subject" style="width: 100%;">
      <Body>
        {#each Object.keys(credentialSubject) as credentialSubjectKey}
          {#if credentialSubjectKey !== 'value' && credentialSubjectKey !== 'type'}
            <Row>
              <Cell style="width: 20%;">{startCase(credentialSubjectKey)}</Cell>
              <Cell style="white-space: normal; padding: 1rem"
                >{credentialSubject[credentialSubjectKey]}</Cell
              >
            </Row>
          {/if}
        {/each}
        <Row>
          <Cell colspan="2">
            <Accordion style="padding: 0">
              <Panel style="margin: 1rem 0; background-color: #f8f3f8">
                <Header>
                  Value
                  <IconButton slot="icon" style="opacity: 1;" toggle>
                    <Icon class="material-icons" on>expand_less</Icon>
                    <Icon class="material-icons">expand_more</Icon>
                  </IconButton>
                </Header>
                <Content class="cs-panel-content">
                  {#each credentialSubject['value'] as nestedCredentialSubject}
                    <svelte:self credentialSubject={nestedCredentialSubject} />
                  {/each}
                </Content></Panel
              ></Accordion
            >
          </Cell>
        </Row>
      </Body>
    </DataTable>
  {:else}
    <DataTable table$aria-label="credential-subject" style="width: 100%;">
      <Body>
        {#each Object.keys(credentialSubject) as credentialSubjectKey}
          {#if credentialSubjectKey !== 'type'}
            <Row>
              <Cell style="width: 20%;">{startCase(credentialSubjectKey)}</Cell>
              <Cell style="white-space: normal; padding: 1rem;"
                >{credentialSubject[credentialSubjectKey]}</Cell
              >
            </Row>
          {/if}
        {/each}
      </Body>
    </DataTable>
  {/if}
</div>

<style>
  :global(.cs-panel-content[aria-hidden='false']) {
    padding: 0 12px 12px !important;
  }
</style>
