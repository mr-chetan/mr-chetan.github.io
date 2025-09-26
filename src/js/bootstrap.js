import axios from 'axios';
import Alpine from 'alpinejs';
import anchor from '@alpinejs/anchor';
import collapse from '@alpinejs/collapse';
import focus from '@alpinejs/focus';
import intersect from '@alpinejs/intersect';
import mask from '@alpinejs/mask';
import morph from '@alpinejs/morph';
import resize from '@alpinejs/resize';
import sort from '@alpinejs/sort';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

Alpine.plugin(anchor);
Alpine.plugin(collapse);
Alpine.plugin(focus);
Alpine.plugin(intersect);
Alpine.plugin(mask);
Alpine.plugin(morph);
Alpine.plugin(resize);
Alpine.plugin(sort);

window.Alpine = Alpine;
