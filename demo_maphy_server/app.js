var createError = require('http-errors');
var express = require('express');
var path = require('path');
var process = require('process')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken')
var helmet = require('helmet')
var winstonLogger = require('./logger')
var winston = require('winston')
var expressWinston = require('express-winston')
var swaggerJsDoc = require('swagger-jsdoc')
var swaggerUi = require('swagger-ui-express')
require('dotenv').config()
var _ = require('lodash')
var cors = require('cors');
const models = require('./db/models');
const authorization = require('./middleware/authorization');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();
app.use(helmet())
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    next();
  });

app.use(
helmet.hsts({
    maxAge: 63072000,          // 2 years
    includeSubDomains: true,   // also protect subdomains
    preload: true              // opt into browser preload lists
})
);
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4009'],
    credentials: true
}));

app.use((req, res, next) => {
    const sequelize = require('./db/conn');
    sequelize.requestStorage.run(req, () => {
        next();
    });
});

app.use(expressWinston.logger({
    transports: [
        //new winston.transports.Console()
        new winston.transports.File({ filename: 'combined.log' })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function(req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

//view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/uploads',express.static(path.join(__dirname, 'uploads')));

app.use(function(req, res, next) {
    if (_.eq(req.url, '/api/v1/hardware/agent-import')) {
        const isLocal = ['localhost', '127.0.0.1', '::1'].includes(req.hostname) || req.ip === '127.0.0.1' || req.ip === '::1';
        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
        if (process.env.NODE_ENV === 'production' && !isLocal && !isSecure) {
            return res.status(403).json({ success: false, message: 'HTTPS (SSL/TLS) is required for production telemetry ingestion.' });
        }

        let authorization = req.headers['authorization'] || '';
        let token = authorization.split(' ')[1];
        const secureAgentToken = process.env.MAPHY_AGENT_TOKEN || 'MAPHY_AGENT_SECURE_TOKEN_XYZ123';
        const salt = process.env.MAPHY_AGENT_SALT || 'MAPHY_SECURE_SALT_9988_SECRET';
        
        let isValid = (token === secureAgentToken);
        if (!isValid && req.body && req.body.serial) {
            const crypto = require('crypto');
            const expectedHash = crypto.createHash('sha256').update(req.body.serial + salt).digest('hex');
            isValid = (token && token.toLowerCase() === expectedHash.toLowerCase());
        }

        if (isValid) {
            req.userInfo = { firmId: 1, userId: 1, isSuperuser: true };
            if (_.eq(req.method, 'POST') || _.eq(req.method, 'PUT')) {
                req.body.firm_id = req.userInfo.firmId;
            }
            return next();
        } else {
            return res.sendStatus(401);
        }
    }
    if (/^\/[^\/]+$/.test(req.path) && !req.path.startsWith('/api-docs')) {
        return next();
    }
    const urls = req.url.split('/')
    let url = ''
    if (_.startsWith(req.url, '/data/uploads') ||
        _.startsWith(req.url, '/uploads') ||
        // _.startsWith(req.url, '/:shortCode') ||  //for short url
        _.eq(req.url, '/api/v1/users/login') ||
        _.eq(req.url, '/api/v1/users/generateotp') ||
        _.eq(req.url, '/api/v1/users/password/update') || 
        _.eq(req.url, '/api/v1/register/firms') ||
        _.eq(req.url, '/api/v1/contactus') ||
        _.eq(req.url, '/api/v1/users/resetpassword') ||
            _.eq(req.url, '/uploads') ) {
        next()
    } else {
        let authorization = ''
        if (_.includes(req.headers.referer, '/api-docs')) {
            authorization = process.env.TOKEN
        } else {
            authorization = req.headers['authorization']
        }
        var token = _.split(authorization, ' ')[1]
        if (token == null) return res.sendStatus(401)

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET)
            req.userInfo = user

            // Super Admin org switching: when X-Selected-Org header is present,
            // override the firmId so tenant isolation hooks scope queries to the selected org.
            // This allows the super admin to see a specific org's data (dashboard, assets, etc.)
            const selectedOrgId = req.headers['x-selected-org'];
            if (selectedOrgId && selectedOrgId !== 'all' && selectedOrgId !== 'undefined' && selectedOrgId !== '') {
              const orgId = parseInt(selectedOrgId, 10);
              if (req.userInfo.isSuperuser && !isNaN(orgId) && orgId > 0) {
                req.userInfo.firmId = orgId;
                req.userInfo._originalSuperuser = true;
              }
            }

            if (_.eq(req.method, 'POST') || _.eq(req.method, 'PUT')) {
                req.body.firm_id = req.userInfo.firmId
            }
            next()
        } catch (err) {
            return res.sendStatus(401)
        }
    }
})

app.use(authorization.loadCurrentPermissions)
app.use(authorization.enforcePermissions)

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Maphy API',
            description: 'Maphy route description'
        },
        "basePath": "/api/v1/",
    },
    apis: ['./routes/v1/*.js', './routes/v1/*/*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.use('/api/v1/', indexRouter);
app.use('/api/v1/companies', require('./routes/v1/settings/companies'))
app.use('/api/v1/models', require('./routes/v1/settings/models'))
app.use('/api/v1/manufacturers', require('./routes/v1/settings/manufacturers'))
app.use('/api/v1/statuslabels', require('./routes/v1/settings/statusLabels'))
app.use('/api/v1/categories', require('./routes/v1/settings/categories'))
app.use('/api/v1/depreciations', require('./routes/v1/settings/depreciations'))
app.use('/api/v1/locations', require('./routes/v1/settings/locations'))
app.use('/api/v1/departments', require('./routes/v1/settings/departments'))
app.use('/api/v1/suppliers', require('./routes/v1/settings/suppliers'))
app.use('/api/v1/customfields', require('./routes/v1/settings/customFields'))
    //app.use('/api/v1/assets', require('./routes/v1/settings/assets'))
app.use('/api/v1/customFieldsets', require('./routes/v1/settings/customFieldsets'))
app.use('/api/v1/customFieldCustomFieldsets', require('./routes/v1/settings/customFieldCustomFieldsets'))
app.use('/api/v1/groups', require('./routes/v1/adminSettings/groups'))
app.use('/api/v1/licenses', require('./routes/v1/licenses'))
app.use('/api/v1/accessories', require('./routes/v1/accessories'))
app.use('/api/v1/consumables', require('./routes/v1/consumables'))
app.use('/api/v1/components', require('./routes/v1/components'))
app.use('/api/v1/kits', require('./routes/v1/kits'))
app.use('/api/v1/users', require('./routes/v1/users'))
app.use('/api/v1/hardware', require('./routes/v1/assets/hardware'))
app.use('/api/v1/maintenances', require('./routes/v1/maintenances'))
app.use('/api/v1/reports', require('./routes/v1/reports/'))
app.use('/api/v1/tickets', require('./routes/v1/tickets'))
app.use('/api/v1/admin', require('./routes/v1/admin'))
app.use('/api/v1/dashboard', require('./routes/v1/dashboard'))
app.use('/api/v1/talentGroups', require('./routes/v1/adminSettings/talentGroups'))
app.use('/api/v1/ticketIssues', require('./routes/v1/adminSettings/ticketIssues'))
app.use('/api/v1/severity', require('./routes/v1/adminSettings/severity'))
app.use('/api/v1/firms', require('./routes/v1/adminSettings/firms'))
app.use('/api/v1/labels', require('./routes/v1/adminSettings/labels'))
app.use('/api/v1/register/firms', require('./routes/v1/register/firm'))
app.use('/api/v1/contactus', require('./routes/v1/contactus'))
app.use('/api/v1/audit', require('./routes/v1/audit'))
app.use('/api/v1/scrapSale', require('./routes/v1/scrapSale'))
app.use('/api/v1/chatbot', require('./routes/v1/chatbot'))

app.use('/api/v1/workstatus', require('./routes/v1/workstatus'))
app.use('/api/v1/licenseNotifications', require('./routes/v1/adminSettings/licenseNotifications'))
app.use('/api/v1/shorturl', require('./routes/v1/shorturl'))

app.get('/:shortCode', async (req, res) => {
    try {
        console.log('start');

        const { shortCode } = req.params;
        const ShortUrl = models.shorturl;

        const record = await ShortUrl.findOne({
            where: {
                url_id: shortCode,
                deleted_at: null
            }
        });

        if (!record) {
            return res.status(404).send('Short URL not found');
        }

        return res.redirect(record.url);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.use(function(req, res, next) {
    if (_.startsWith(req.url, '/:shortCode')) {
        return next();
    }  //for short url

    if (res.headersSent) {
        return;
    }
    if (res.result === undefined) {
        return next();
    }
    switch (req.method) {
        case 'POST':
            if (!_.eq(req.url, '/api/v1/users/login')) {
                var message = 'Created successfully'
                if (!_.isEmpty(res.result.error)) {
                    res.result = { message: res.result.error, success: false }
                } else {
                    res.result = { id: res.result.id, message: message, success: true }
                }
            }
            break;
        case 'PUT':
            var message = 'Updated successfully'
            var success = true
            if (!_.isEmpty(res.result.error)) {
                message = res.result.error
                success = false
            }
            const originalUrl = req.originalUrl
            if (!_.isNil(originalUrl)) {
                paths = _.split(originalUrl, '/')
                const isRestoreExists = _.some(paths, path => path === 'restore')
                message = isRestoreExists ? 'Restored successfully' : message
            }
            res.result = { message: message, success: success }
            break;
        case 'DELETE':
            res.result = { message: 'Deleted successfully', success: true }
            break;
        default:
            break;
    }

    res.send(res.result)
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// app.use(helmet())

const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
    unhandledRejections.set(promise, reason);
    winstonLogger.logger.log({ level: 'error', message: reason.stack })
});
process.on('rejectionHandled', (promise) => {
    unhandledRejections.delete(promise);
});

app.use(expressWinston.errorLogger({
    transports: [
        //new winston.transports.Console()
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //new winston.transports.File({ filename: 'combined.log' })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json('error');
});

module.exports = app;