import routes from './routes/index'

export default function configureApp(app) {
    app.use(routes)
}
