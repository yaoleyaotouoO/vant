import { createApp, nextTick } from 'vue';
import VanImagePreview from './ImagePreview';
import { inBrowser } from '../utils';

let instance;

const defaultConfig = {
  loop: true,
  images: [],
  maxZoom: 3,
  minZoom: 1 / 3,
  onScale: null,
  onClose: null,
  onChange: null,
  className: '',
  showIndex: true,
  closeable: false,
  closeIcon: 'clear',
  asyncClose: false,
  getContainer: 'body',
  startPosition: 0,
  swipeDuration: 500,
  showIndicators: false,
  closeOnPopstate: true,
  closeIconPosition: 'top-right',
};

function initInstance() {
  const root = document.createElement('div');
  document.body.appendChild(root);

  instance = createApp({
    data() {
      return {
        props: {
          show: false,
        },
      };
    },
    methods: {
      close() {
        this.toggle(false);
      },
      toggle(show) {
        this.props.show = show;
      },
      setProps(props) {
        Object.assign(this.props, props);
      },
      onClosed() {
        this.props.images = [];
      },
    },
    render() {
      return (
        <VanImagePreview
          {...{
            ...this.props,
            onClosed: this.onClosed,
            'onUpdate:show': this.toggle,
          }}
        />
      );
    },
  }).mount(root);
}

// const initInstance = () => {
//   instance.$on('change', (index) => {
//     if (instance.onChange) {
//       instance.onChange(index);
//     }
//   });

//   instance.$on('scale', (data) => {
//     if (instance.onScale) {
//       instance.onScale(data);
//     }
//   });
// };

const ImagePreview = (images, startPosition = 0) => {
  /* istanbul ignore if */
  if (!inBrowser) {
    return;
  }

  if (!instance) {
    initInstance();
  }

  const options = Array.isArray(images) ? { images, startPosition } : images;

  instance.setProps({
    ...defaultConfig,
    ...options,
  });

  nextTick(() => {
    instance.toggle(true);
  });

  // if (options.onClose) {
  //   instance.$off('close');
  //   instance.$once('close', options.onClose);
  // }

  return instance;
};

ImagePreview.Component = VanImagePreview;

ImagePreview.install = (app) => {
  app.use(VanImagePreview);
};

export default ImagePreview;