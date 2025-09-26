import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite";
import cleanup from 'rollup-plugin-cleanup';
import path from 'path';
import handlebars from 'vite-plugin-handlebars';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'index.html'),
                privacy: path.resolve(__dirname, 'privacy/index.html'),
                terms: path.resolve(__dirname, 'terms/index.html'),
                refund: path.resolve(__dirname, 'refund/index.html'),
            },
            plugins: [cleanup({ comments: 'none' })],
        },
    },
    plugins: [
        tailwindcss(),
            handlebars({
                partialDirectory: path.resolve(__dirname, 'partials'),
            }),
    ],
    server: {
        cors: true,
    },
});
