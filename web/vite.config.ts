import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const fonts = resolve(dirname(fileURLToPath(import.meta.url)), 'node_modules/mathlive/fonts')
export default defineConfig({ plugins: [react(), {
	name: 'local-mathlive-fonts',
	configureServer(server) {
		server.middlewares.use('/mathlive-fonts/', (request, response, next) => {
			const name = (request.url ?? '').split('?')[0].replace(/^\//, '')
			if (name !== basename(name) || !readdirSync(fonts).includes(name)) return next()
			response.setHeader('Content-Type', name.endsWith('.woff2') ? 'font/woff2' : 'font/woff')
			response.end(readFileSync(resolve(fonts, name)))
		})
	},
	generateBundle() { for (const name of readdirSync(fonts)) this.emitFile({ type: 'asset', fileName: `mathlive-fonts/${name}`, source: readFileSync(resolve(fonts, name)) }) },
}], base: './' })