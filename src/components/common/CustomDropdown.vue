<template>
  <div ref="dropdownRef" class="relative w-48">
    <!-- Trigger Button -->
    <button
      @click="toggleDropdown"
      class="bg-gray-700 text-white px-4 py-2 rounded w-full text-left flex justify-between items-center"
    >
      <span>{{ selected }}</span>
      <svg
        class="w-4 h-4 ml-2 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown List -->
    <ul
      v-if="isOpen"
      class="absolute z-10 mt-1 bg-gray-800 border border-gray-600 rounded w-full max-h-48 overflow-y-auto"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        @click="selectItem(item)"
        class="px-4 py-2 hover:bg-gray-700 text-white cursor-pointer"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'CustomDropdown',
  props: {
    items: {
      type: Array,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isOpen: false,
      selected: this.modelValue || this.items[0] || ''
    };
  },
  watch: {
    modelValue(newVal) {
      this.selected = newVal;
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    selectItem(item) {
      this.selected = item;
      this.isOpen = false;
      this.$emit('update:modelValue', item); // for v-model binding
      this.$emit('change', item); // for @change callback
    },
    handleClickOutside(event) {
      if (!this.$refs.dropdownRef.contains(event.target)) {
        this.isOpen = false;
      }
    }
  }
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
