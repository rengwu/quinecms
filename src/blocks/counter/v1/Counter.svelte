<script lang="ts">
 import styles from './counter.module.css';
 import type {ViewProps} from '../../../core/types';
 let {props}:ViewProps=$props();
 let clicks=$state(0);
</script>
<section class={styles.counter}><div><p>{String(props.label??'')}</p><strong>{Number(props.start??0)+clicks}</strong></div><button onclick={()=>clicks++}>Add one</button></section>
