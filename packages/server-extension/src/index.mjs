import routes from './routes/index.mjs'

export default function configureApp(app) {
    app.use(routes)
}
