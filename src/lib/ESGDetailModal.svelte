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
  import Dialog, {Title, Content as DialogContent, Actions} from '@smui/dialog';
  import Button, {Label as ButtonLabel} from '@smui/button';
  import IconButton, {Icon} from '@smui/icon-button';
  import {mdiInformation} from '@mdi/js';
  import {Svg} from '@smui/common/elements';
  import omit from 'lodash/omit';
  import startCase from 'lodash/startCase';
  import Accordion, {Panel, Header, Content} from '@smui-extra/accordion';
  import type {ESGDetailsResponse, Error} from '$types';
  import {formatCurrency} from '$utils';
  import CircularProgress from '@smui/circular-progress';
  import CredentialSubjectTable from './CredentialSubjectTable.svelte';
  import {getOffsetDetails} from '../services';

  let projectDetailsPanel = true;
  let credentialSubjectsPanel = false;

  export let tokenId: string;
  export let serialNumber: number;
  let detailsOpen: boolean;
  let esgDetails: ESGDetailsResponse;
  $: error = '';
  $: loading = false;

  const loadDetails = async () => {
    loading = true;
    try {
      const res = await getOffsetDetails(tokenId, serialNumber);
      if (res) {
        esgDetails = res;
        loading = false;
      }
    } catch (error) {
      console.error(error);
      loading = false;
    }
  };

  $: projectDetails = omit(esgDetails, [
    'request',
    'policy_info',
    'credential_subjects'
  ]);

  $: credentialSubjects = esgDetails?.credential_subjects || [];
</script>

<IconButton
  class="material-icons"
  size="button"
  style="opacity: 0.9; bottom: 5px; color: #2584ff"
  on:click={() => {
    loadDetails();
    detailsOpen = true;
  }}
>
  <Icon component={Svg} viewBox="0 0 24 24">
    <path fill="currentColor" d={mdiInformation} />
  </Icon>
</IconButton>

<Dialog
  bind:open={detailsOpen}
  aria-labelledby="large-scroll-title"
  aria-describedby="large-scroll-content"
  surface$style="width: 800px; max-width: calc(100vw - 32px);"
>
  <Title id="large-scroll-title">Offset Details</Title>
  <DialogContent id="large-scroll-content">
    {#if error || loading}
      {#if error}
        <p>{error}</p>
      {:else}
        <div style="margin: auto; width: 4rem; padding: 2rem">
          <CircularProgress style="height: 54px; width: 44px;" indeterminate />
        </div>
      {/if}
    {:else}
      <Accordion>
        <!-- Project Details Panel -->
        <Panel bind:open={projectDetailsPanel}>
          <Header>
            Project Details
            <IconButton
              slot="icon"
              style="opacity: 1;"
              toggle
              pressed={projectDetailsPanel}
            >
              <Icon class="material-icons" on>expand_less</Icon>
              <Icon class="material-icons">expand_more</Icon>
            </IconButton>
          </Header>
          <Content style="background-color:#f8f3f8">
            <DataTable table$aria-label="project-details" style="width: 44rem;">
              <Body>
                <Row>
                  <Cell style="width: 20%; ">Token ID</Cell>
                  <Cell>{tokenId}</Cell>
                </Row>
                <Row>
                  <Cell>Serial Number</Cell>
                  <Cell>{serialNumber}</Cell>
                </Row>
                {#each Object.keys(projectDetails) as projectDetailKey}
                  <Row>
                    <Cell style="width: 20%;"
                      >{startCase(projectDetailKey)}</Cell
                    >
                    {#if typeof projectDetails[projectDetailKey] === 'number'}
                      <Cell
                        >{formatCurrency(
                          projectDetails[projectDetailKey]
                        )}</Cell
                      >
                    {:else}
                      <Cell style="white-space: normal; padding: 1rem"
                        >{projectDetails[projectDetailKey] || '-'}</Cell
                      >
                    {/if}
                  </Row>
                {/each}
              </Body>
            </DataTable>
          </Content>
        </Panel>
        <!-- Credential Subjects Panel -->
        <Panel bind:open={credentialSubjectsPanel}>
          <Header>
            Credential Subjects
            <IconButton
              slot="icon"
              toggle
              style="opacity: 1;"
              pressed={credentialSubjectsPanel}
            >
              <Icon class="material-icons" on>expand_less</Icon>
              <Icon class="material-icons">expand_more</Icon>
            </IconButton>
          </Header>
          <Content style="background-color:#f8f3f8">
            {#if credentialSubjects.length}
              {#each credentialSubjects as credentialSubject}
                <CredentialSubjectTable {credentialSubject} />
              {/each}
            {:else}
              <div style="margin: auto; width: 4.5rem;">No data</div>
            {/if}
          </Content>
        </Panel>
      </Accordion>
    {/if}
  </DialogContent>
  <Actions>
    <Button action="accept">
      <ButtonLabel>Done</ButtonLabel>
    </Button>
  </Actions>
</Dialog>
