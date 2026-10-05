<script lang="ts">
 import type {Component} from 'svelte';
 import type {ViewProps} from '../../core/types';
 let {Renderer,state}:{Renderer:Component<ViewProps>;state:ViewProps}=$props();
</script>
<Renderer props={state.props} context={state.context}/>
