<template>
  <button
    :class="['DrosseIcon', { available, up, small, big }]"
    @click="onDrosseClick"
  >
    <svg v-if="available" class="drosse" viewBox="0 0 27 25">
      <path
        class="inner-wheel"
        d="M17.7156 11.7796L14.1453 11.7796C12.0891 11.7796 12.0891 14.5212 14.1453 14.5212L17.7164 14.5212C17.5228 15.0588 17.211 15.5631 16.7807 15.9934C15.2092 17.5648 12.6521 17.5556 11.0807 15.9841C9.50922 14.4127 9.49998 11.8556 11.0714 10.2842C12.6429 8.7127 15.2 8.72194 16.7714 10.2934C17.2055 10.7274 17.5203 11.2367 17.7156 11.7796Z"
      />
      <path
        class="outer-wheel"
        d="M18.1824 14.5475C17.9699 15.1912 17.6076 15.7963 17.0956 16.3083C15.3451 18.0588 12.507 18.0588 10.7565 16.3083C9.006 14.5579 9.006 11.7197 10.7565 9.96926C12.507 8.21877 15.3451 8.21877 17.0956 9.96926C17.6076 10.4813 17.9699 11.0864 18.1824 11.7301L18.8769 11.7301C18.6453 10.9134 18.2081 10.1426 17.5651 9.4997C15.5553 7.48988 12.2967 7.48988 10.2869 9.4997C8.2771 11.5095 8.2771 14.7681 10.2869 16.7779C12.2967 18.7877 15.5553 18.7877 17.5651 16.7779C18.2081 16.135 18.6453 15.3642 18.8769 14.5475L18.1824 14.5475Z"
      />
      <path
        class="bar"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M20.2652 12.1997L20.2652 14.0779L14.1609 14.0779C12.7522 14.0779 12.7522 12.1997 14.1609 12.1997L20.2652 12.1997ZM14.2783 12.7866C14.0838 12.5921 13.7684 12.5921 13.5739 12.7866C13.3794 12.9811 13.3794 13.2965 13.5739 13.491C13.7684 13.6855 14.0838 13.6855 14.2783 13.491C14.4728 13.2965 14.4728 12.9811 14.2783 12.7866Z"
      />
      <path
        class="handle"
        d="M20.7347 13.6801L21.5319 13.6801C21.875 14.3145 22.5462 14.7455 23.3181 14.7455C24.4388 14.7455 25.3474 13.8369 25.3474 12.7161C25.3474 11.7023 24.6039 10.8621 23.6325 10.711C23.53 10.6951 23.425 10.6868 23.3181 10.6868L23.3181 11.6525C23.9055 11.6525 24.3817 12.1287 24.3817 12.7161C24.3817 13.3036 23.9055 13.7798 23.3181 13.7798C22.7582 13.7798 22.2994 13.3472 22.2576 12.7981L22.2576 12.7161L20.7347 12.7033L20.7347 13.6801Z"
      />
    </svg>
    <svg v-else class="skull" viewBox="0 0 24 25">
      <path
        d="M12 2.13879C9.61305 2.13879 7.32387 3.08701 5.63604 4.77483C3.94821 6.46266 3 8.75185 3 11.1388C3 14.1688 4.53 16.9588 7 18.6088V22.1388H9V19.1388H11V22.1388H13V19.1388H15V22.1388H17V18.5988C19.47 16.9488 21 14.1388 21 11.1388C21 8.75185 20.0518 6.46266 18.364 4.77483C16.6761 3.08701 14.3869 2.13879 12 2.13879V2.13879ZM8 11.1388C8.53043 11.1388 9.03914 11.3495 9.41421 11.7246C9.78929 12.0997 10 12.6084 10 13.1388C10 13.6692 9.78929 14.1779 9.41421 14.553C9.03914 14.9281 8.53043 15.1388 8 15.1388C7.46957 15.1388 6.96086 14.9281 6.58579 14.553C6.21071 14.1779 6 13.6692 6 13.1388C6 12.6084 6.21071 12.0997 6.58579 11.7246C6.96086 11.3495 7.46957 11.1388 8 11.1388V11.1388ZM16 11.1388C16.5304 11.1388 17.0391 11.3495 17.4142 11.7246C17.7893 12.0997 18 12.6084 18 13.1388C18 13.6692 17.7893 14.1779 17.4142 14.553C17.0391 14.9281 16.5304 15.1388 16 15.1388C15.4696 15.1388 14.9609 14.9281 14.5858 14.553C14.2107 14.1779 14 13.6692 14 13.1388C14 12.6084 14.2107 12.0997 14.5858 11.7246C14.9609 11.3495 15.4696 11.1388 16 11.1388V11.1388ZM12 14.1388L13.5 17.1388H10.5L12 14.1388Z"
      />
    </svg>
  </button>
</template>

<script>
import useIo from '@/modules/io'

export default {
  name: 'DrosseIcon',
  props: {
    available: Boolean,
    uuid: {
      type: String,
      default: '',
    },
    up: Boolean,
    small: Boolean,
    big: Boolean,
  },
  setup(props) {
    const { start, stop } = useIo()

    const onDrosseClick = () => {
      if (props.up) {
        stop(props.uuid)
      } else {
        start(props.uuid)
      }
    }

    return { onDrosseClick }
  },
}
</script>

<style lang="postcss" scoped>
.DrosseIcon {
  display: block;
  min-width: 3rem;
  max-width: 3rem;
  min-height: 3rem;
  max-height: 3rem;

  &.big {
    min-width: 4.5rem;
    max-width: 4.5rem;
    min-height: 4.5rem;
    max-height: 4.5rem;
  }

  &.small {
    min-width: 2rem;
    max-width: 2rem;
    min-height: 2rem;
    max-height: 2rem;
  }
}

.drosse {
  width: 4rem;
  height: 4rem;
  margin: -0.5rem 0 0 -1rem;
  transform: rotate(-45deg);
  will-change: transform;
  transition: transform 0.1s ease-in-out;

  .big & {
    width: 5.5rem;
    height: 5.5rem;
    margin: -0.75rem 0 0 -1.5rem;
  }

  .small & {
    width: 2.5rem;
    height: 2.5rem;
    margin: -0.35rem 0 0 -0.5rem;
  }

  .up & {
    transform: rotate(0);
  }
}

.skull {
  margin-top: 0.25rem;
  width: 2rem;
  height: 2rem;

  .big & {
    width: 2.5rem;
    height: 2.5rem;
  }

  .small & {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* Colors */
.outer-wheel,
.bar,
.handle {
  fill: var(--c-gray-inactive);
  will-change: fill;
  transition: fill 0.1s ease-in-out;

  .up & {
    fill: var(--c-green);
  }
}

.inner-wheel {
  fill: var(--c-gray-active);
  opacity: 0.5;
  will-change: fill, opacity;
  transition: fill 0.1s ease-in-out, opacity 0.1s ease-in-out;

  .up & {
    fill: var(--c-green-light);
    opacity: 1;
  }
}

.skull {
  fill: var(--c-red);
}
</style>
