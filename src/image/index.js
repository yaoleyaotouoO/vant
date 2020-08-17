import { createNamespace, isDef, addUnit, inBrowser } from '../utils';
import Icon from '../icon';

const [createComponent, bem] = createNamespace('image');

export default createComponent({
  props: {
    src: String,
    fit: String,
    alt: String,
    round: Boolean,
    width: [Number, String],
    height: [Number, String],
    radius: [Number, String],
    lazyLoad: Boolean,
    showError: {
      type: Boolean,
      default: true,
    },
    showLoading: {
      type: Boolean,
      default: true,
    },
    errorIcon: {
      type: String,
      default: 'photo-fail',
    },
    loadingIcon: {
      type: String,
      default: 'photo',
    },
  },

  emits: ['load', 'error', 'click'],

  data() {
    return {
      loading: true,
      error: false,
    };
  },

  watch: {
    src() {
      this.loading = true;
      this.error = false;
    },
  },

  computed: {
    style() {
      const style = {};

      if (isDef(this.width)) {
        style.width = addUnit(this.width);
      }

      if (isDef(this.height)) {
        style.height = addUnit(this.height);
      }

      if (isDef(this.radius)) {
        style.overflow = 'hidden';
        style.borderRadius = addUnit(this.radius);
      }

      return style;
    },
  },

  created() {
    const { $Lazyload } = this;

    if ($Lazyload && inBrowser) {
      $Lazyload.$on('loaded', this.onLazyLoaded);
      $Lazyload.$on('error', this.onLazyLoadError);
    }
  },

  beforeUnmount() {
    const { $Lazyload } = this;

    if ($Lazyload) {
      $Lazyload.$off('loaded', this.onLazyLoaded);
      $Lazyload.$off('error', this.onLazyLoadError);
    }
  },

  methods: {
    onLoad(event) {
      this.loading = false;
      this.$emit('load', event);
    },

    onLazyLoaded({ el }) {
      if (el === this.$refs.image && this.loading) {
        this.onLoad();
      }
    },

    onLazyLoadError({ el }) {
      if (el === this.$refs.image && !this.error) {
        this.onError();
      }
    },

    onError(event) {
      this.error = true;
      this.loading = false;
      this.$emit('error', event);
    },

    onClick(event) {
      this.$emit('click', event);
    },

    genPlaceholder() {
      if (this.loading && this.showLoading) {
        return (
          <div class={bem('loading')}>
            {this.$slots.loading ? (
              this.$slots.loading()
            ) : (
              <Icon name={this.loadingIcon} class={bem('loading-icon')} />
            )}
          </div>
        );
      }

      if (this.error && this.showError) {
        return (
          <div class={bem('error')}>
            {this.$slots.error ? (
              this.$slots.error()
            ) : (
              <Icon name={this.errorIcon} class={bem('error-icon')} />
            )}
          </div>
        );
      }
    },

    genImage() {
      const imgData = {
        alt: this.alt,
        class: bem('img'),
        style: {
          objectFit: this.fit,
        },
      };

      if (this.error) {
        return;
      }

      if (this.lazyLoad) {
        return <img ref="image" vLazy={this.src} {...imgData} />;
      }

      if (this.src) {
        return (
          <img
            src={this.src}
            onLoad={this.onLoad}
            onError={this.onError}
            {...imgData}
          />
        );
      }
    },
  },

  render() {
    return (
      <div
        class={bem({ round: this.round })}
        style={this.style}
        onClick={this.onClick}
      >
        {this.genImage()}
        {this.genPlaceholder()}
        {this.$slots.default?.()}
      </div>
    );
  },
});