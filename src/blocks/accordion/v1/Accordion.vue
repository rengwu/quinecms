<script setup lang="ts">
import styles from './accordion.module.css';
import { ref } from 'vue';
import type { Values, Context } from '../../../core/types';
defineProps<{ props: Values; context: Context }>();
const open = ref(false);
</script>
<template>
  <section :class="styles.accordion">
    <button :aria-expanded="open" @click="open = !open">
      {{ props.question }} <span>{{ open ? '−' : '+' }}</span>
    </button>
    <p v-if="open">{{ props.answer }}</p>
  </section>
</template>
