import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
	// server: {
	// 	proxy: {
	// 		'/api': {
	// 			target: 'https://api.nytimes.com',
	// 			changeOrigin: true,
	// 			rewrite: path => path.replace(/^\/api/, ''),
	// 			secure: false,
	// 		},
	// 	},
	// },

	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
