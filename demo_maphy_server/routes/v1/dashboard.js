var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const models = require('../../db/models/index');
var _ = require('lodash');
const { errorHandler } = require('../../shared/error-handler');

router.get('/', errorHandler(async function (req, res, next) {
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-GB', options);
    
    const licenseNotifications = models.licenseNotifications;
    const licenseExpiryDiff = await licenseNotifications.findOne({
        raw: true,
        attributes: ['no_of_days'],
        where: { firm_id: req.userInfo.firmId }
    });
    const noOfDays = licenseExpiryDiff ? licenseExpiryDiff.no_of_days : 30;
    const firmId = req.userInfo.firmId;
    const Op = Sequelize.Op;

    const [
        accessoriesCount,
        assetsCount,
        consumablesCount,
        licensesCount,
        licenseExpiredCount,
        LicensesGoingToExpired
    ] = await Promise.all([
        models.accessory.count({
            where: { firm_id: firmId, deleted_at: null }
        }),
        models.asset.count({
            where: { firm_id: firmId, deleted_at: null }
        }),
        models.consumable.count({
            where: { firm_id: firmId, deleted_at: null }
        }),
        models.license.count({
            where: { firm_id: firmId, deleted_at: null }
        }),
        models.license.count({
            where: {
                firm_id: firmId,
                deleted_at: null,
                expiration_date: {
                    [Op.lt]: new Date()
                }
            }
        }),
        models.license.count({
            where: {
                firm_id: firmId,
                deleted_at: null,
                expiration_date: {
                    [Op.between]: [
                        new Date(),
                        new Date(new Date().setDate(new Date().getDate() + noOfDays))
                    ]
                }
            }
        })
    ]);

    res.json({
        accessoriesCount,
        assetsCount,
        consumablesCount,
        licensesCount,
        licenseExpiredCount,
        LicensesGoingToExpired,
        date: formattedDate
    });
}));

router.get('/assets', errorHandler(async function (req, res, next) {
    const firmId = req.userInfo.firmId;
    const TotalAssetCost = await models.asset.sum('purchase_cost', {
        where: { firm_id: firmId, deleted_at: null }
    }) || 0;
    const assetsCount = await models.asset.count({
        where: { firm_id: firmId, deleted_at: null }
    });
    
    res.json({
        TotalAssetCost,
        assetsCount
    });
}));

router.get('/chart', errorHandler(async function (req, res, next) {
    try {
        const statusLabel = models.statusLabel;
        const firmId = req.userInfo.firmId;

        const statusLabels = await statusLabel.findAll({
            where:{
                firm_id: firmId,
                deleted_at: null
            }
        });

        // Safe defaults — if no status labels exist for this firm yet, IDs default to 0
        let deployedId = 0, deployableId = 0;
        if (statusLabels && statusLabels.length > 0) {
            let deployedStatusLabel = _.find(statusLabels, label => label.archived === true);
            if (!_.isNil(deployedStatusLabel)) {
                deployedId = deployedStatusLabel.id;
            }
            let deployableStatusLabel = _.find(statusLabels, label => label.deployable === true);
            if (!_.isNil(deployableStatusLabel))
                deployableId = deployableStatusLabel.id;
        }

        const assetsCount = await models.asset.count({
            where: { firm_id: firmId, deleted_at: null }
        });

        // When deployedId/deployableId are 0, return 0 directly (no matching rows)
        const deployedCount = deployedId
            ? await models.asset.count({ where: { firm_id: firmId, deleted_at: null, status_id: deployedId } })
            : 0;
        const deployableCount = deployableId
            ? await models.asset.count({ where: { firm_id: firmId, deleted_at: null, status_id: deployableId } })
            : 0;

        res.json({
            deployedCount,
            deployableCount,
            undeployedCount: assetsCount - (deployedCount + deployableCount)
        });
    } catch (err) {
        // New firms with no status labels should still return safe zeros
        res.json({ deployedCount: 0, deployableCount: 0, undeployedCount: 0 });
    }
}));

router.get('/chart/tickets', errorHandler(async function (req, res, next) {
    try {
        const firm_id = req.userInfo.firmId;
        const ticketStatus = models.ticketStatus;

        // ticketStatus is global (no firm_id column) — safe to findAll without filter
        const ticket_Status = await ticketStatus.findAll();

        const statusId = (name) => {
            if (!ticket_Status || ticket_Status.length === 0) return 0;
            const status = _.find(ticket_Status, function (item) { return item.name == name });
            return _.isNil(status) ? 0 : status.id;
        };

        const openId = statusId("Open");
        const inProgressId = statusId("Inprogress");
        const closeId = statusId("Close");
        const escalateId = statusId("Escalate");
        const holdId = statusId("Hold");
        const sistetTicketId = statusId("Sister Ticket");
        const reassignId = statusId("Reassign");

        // Safe count — if status id is 0, skip the DB query and return 0 directly
        const safeCount = async (statusIdVal) => {
            if (!statusIdVal) return 0;
            return models.ticket.count({ where: { firm_id, status_id: statusIdVal } });
        };

        const [
            openCount,
            inProgressCount,
            closeCount,
            escalateCount,
            holdCount,
            sisterTicketCount,
            reassignCount
        ] = await Promise.all([
            safeCount(openId),
            safeCount(inProgressId),
            safeCount(closeId),
            safeCount(escalateId),
            safeCount(holdId),
            safeCount(sistetTicketId),
            safeCount(reassignId)
        ]);

        res.json({
            openCount,
            inProgressCount,
            closeCount,
            escalateCount,
            sisterTicketCount,
            reassignCount,
            holdCount
        });
    } catch (err) {
        // New firms with no tickets/ticket statuses return safe zeros
        res.json({
            openCount: 0,
            inProgressCount: 0,
            closeCount: 0,
            escalateCount: 0,
            sisterTicketCount: 0,
            reassignCount: 0,
            holdCount: 0
        });
    }
}));

module.exports = router;
