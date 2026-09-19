const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require('../../db/models');
const _ = require('lodash');
var util = require('../../utils/index');

const BASE_URL = process.env.SHORT_URL_BASE; // e.g. https://sho.rt/

function generateShortCode() {
  return Math.floor(1000000 + Math.random() * 9000000).toString(); // 7 digits
}

router.post('/', async (req, res, next) => {
  try {
    
    const ShortUrl = models.shorturl;
    const { url } = req.body;

    if (!url) {
      res.result = { error: 'URL is required' };
      return next();
    }

    let urlId;
    let exists = true;

    while (exists) {
      urlId = generateShortCode();
      exists = (await ShortUrl.count({ where: { url_id: urlId } })) > 0;
    }

    const record = await ShortUrl.create({
      url,
      url_id: urlId,
      firm_id: req.userInfo.firmId || 1
    });

    // IMPORTANT: no res.json / res.send here
    return res.json({
      id: record.id,
      url: record.url,
      short_url: `${BASE_URL}/${record.url_id}`,
      created_at: record.created_at
    });

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * GET All Short URLs
 */
router.get('/', async (req, res) => {
  try {
    const ShortUrl = models.shorturl;

    const rows = await ShortUrl.findAll({
      where: {
        deleted_at: null,
        firm_id: req.userInfo?.firmId || null
      },
      order: [['created_at', 'DESC']]
    });

    const response = rows.map(row => ({
      id: row.id,
      url: row.url,
      short_url: `${BASE_URL}${row.url_id}`,
      created_at: row.created_at
    }));

    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET by Short Code (for redirect / fetch original URL)
 */
router.get('/code/:urlId', async (req, res) => {
  try {
    const ShortUrl = models.shorturl;
    const { urlId } = req.params;

    const record = await ShortUrl.findOne({
      where: {
        url_id: urlId,
        deleted_at: null
      }
    });

    if (!record) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // for redirect use: res.redirect(record.url)
    return res.json({ url: record.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * UPDATE Short URL
 * body: { url: "https://newurl.com" }
 */
router.put('/:id', async (req, res) => {
  try {
    const ShortUrl = models.shorturl;
    const id = _.parseInt(req.params.id);
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const [updated] = await ShortUrl.update(
      { url },
      {
        where: {
          id,
          firm_id: req.userInfo?.firmId || null,
          deleted_at: null
        }
      }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE Short URL (Soft Delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const ShortUrl = models.shorturl;
    const id = _.parseInt(req.params.id);

    const [deleted] = await ShortUrl.update(
      { deleted_at: new Date() },
      {
        where: {
          id,
          firm_id: req.userInfo?.firmId || null,
          deleted_at: null
        }
      }
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
