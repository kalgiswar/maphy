const express = require('express');
const router = express.Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../db/models/index');
const _ = require('lodash');
const util = require('../../utils/index');
const constants = require('../../shared/constants');
const {errorHandler} = require('../../shared/error-handler')

const ScrapSale = models.scrapSale;


router.get('/', errorHandler(async function (req, res, next) {
  try {
    const queries = req.query;
    const { search, sort, limit, offset, order } = util.queryRequest(queries);

    const result = await ScrapSale.findAndCountAll({
      where: {
        firm_id: req.userInfo.firmId,
        deleted_at: { [Op.eq]: null },
        ...(search && {
          itemName: { [Op.like]: `%${search}%` }
        })
      },
      order: Sequelize.literal(`${sort} ${order}`),
      limit,
      offset
    });

    const response = _.map(result.rows, formatResponse);
    return res.status(200).json({ total: result.count, rows: response });
  } catch (err) {
    console.error("❌ ScrapSale Get All Error:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}));


router.get('/:id',errorHandler( async function (req, res, next) {
  try {
    const id = _.parseInt(req.params.id);
    const result = await ScrapSale.findOne({
      where: {
        id,
        firm_id: req.userInfo.firmId,
        deleted_at: { [Op.eq]: null },
      }
    });

    if (!result) {
      return res.status(404).json({ message: 'Scrap sale not found' });
    }

    return res.status(200).json(formatResponse(result));
  } catch (err) {
    console.error("❌ ScrapSale get Error:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}));

router.post('/', errorHandler(async function (req, res, next) {
  try {
    req.body.created_by = req.userInfo.userId;
    req.body.firm_id = req.userInfo.firmId;
    const { item_name, quantity, unit_price } = req.body;

    if (!item_name ) {
      return res.status(400).json({ error: 'Item name is required ' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    if (!Number.isInteger(unit_price) || unit_price <= 0) {
      return res.status(400).json({ error: 'Unit price must be a positive integer' });
    }
    if (req.body.sale_date) {
    const saleDateStr = req.body.sale_date; // e.g., '2025-07-30'
    const todayStr = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    if (saleDateStr > todayStr) {
        return res.status(400).json({ error: 'Sale date cannot be in the future' });
    }
    }

    // Auto-calculate total price
    req.body.total_price = quantity * unit_price;
    const result = await ScrapSale.create(req.body);
    return res.status(200).json({result:result, message: 'Scrap sale created successfully' });

  } catch (err) {
    console.error("❌ ScrapSale Create Error:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}));



router.put('/:id', errorHandler(async function (req, res, next) {
  try {
    const id = _.parseInt(req.params.id);
    const scrapSale = await ScrapSale.findOne({
      where: {
        id,
        firm_id: req.userInfo.firmId,
        deleted_at: { [Op.eq]: null }
      }
    });

    if (!scrapSale) {
      return res.status(404).json({ error: 'Scrap sale not found' });
    }
    req.body.updated_by = req.userInfo.userId;

    const { item_name, quantity, unit_price } = req.body;

    if (!item_name ) {
      return res.status(400).json({ error: 'Item name is required ' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    if (!Number.isInteger(unit_price) || unit_price <= 0) {
      return res.status(400).json({ error: 'Unit price must be a positive integer' });
    }

    req.body.totalPrice = quantity * unit_price;
    if (req.body.sale_date) {
    const saleDateStr = req.body.sale_date; // e.g., '2025-07-30'
    const todayStr = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    if (saleDateStr > todayStr) {
        return res.status(400).json({ error: 'Sale date cannot be in the future' });
    }
    }

    const [affectedRows] = await ScrapSale.update(req.body, {
      where: {
        id,
        firm_id: req.userInfo.firmId,
        deleted_at: { [Op.eq]: null },
      }
    });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Scrap sale not found or not modified' });
    }

    return res.status(200).json({ message: 'Scrap sale updated successfully' });
  } catch (err) {
    console.error("❌ ScrapSale Update Error:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}));



router.delete('/:id', errorHandler(async function (req, res, next) {
  try {
    const id = _.parseInt(req.params.id);
    const scrapSale = await ScrapSale.findOne({
      where: {
        id,
        firm_id: req.userInfo.firmId,
        deleted_at: { [Op.eq]: null }
      }
    });

    if (!scrapSale) {
      return res.status(404).json({ error: 'Scrap sale not found' });
    }
    const [affectedRows] = await ScrapSale.update({
      deleted_at: new Date(),
      updated_by: req.userInfo.userId
    }, {
      where: {
        id,
        firm_id: req.userInfo.firmId,

      }
    });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Scrap sale not found or already deleted' });
    }

    return res.status(200).json({ message: 'Scrap sale deleted successfully' });
  } catch (err) {
    console.error("❌ ScrapSale Delete Error:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}));

function formatResponse(row) {
  return {
    id: row.id,
    item_name: row.item_name,
    item_type: row.item_type,
    sale_date: row.sale_date,
    quantity: row.quantity,
    unit_price: row.unit_price,
    total_price: row.total_price,
    buyer_name: row.buyer_name,
    buyer_contact: row.buyer_contact,
    remarks: row.remarks,
    created_by: row.create_by,
    updated_by: row.updated_by,
    created_at: util.createdUpdatedDateFormat(row.created_at),
    updated_at: util.createdUpdatedDateFormat(row.updated_at)
  };
}

module.exports = router;
