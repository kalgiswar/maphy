var express = require('express');
var router = express.Router();
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
var {errorHandler} = require('../../shared/error-handler')

router.get('/admintags', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const attributes = [
        'id', 'auto_increment_assets', 'auto_increment_prefix', 'next_auto_tag_base','zerofill_count'
      ]
    let result = await util.getAdminSetting(setting, attributes)
    const response = _.isNil(result) ? {} : result;

    res.json(response);
}))

router.get('/branding', errorHandler(async function(req, res, next) {
  const setting = models.setting;
  const attributes = [
      'id', 'brand', 'logo', 'email_logo', 'label_logo', 'favicon', 'header_color', 'skin', 'custom_css', 'support_footer', 'version_footer'
    ]
  let result = await util.getAdminSetting(setting, attributes)
  const response = _.isNil(result) ? {} : result;

  res.json(response);
 }))

 router.get('/barcodes', errorHandler(async function(req, res, next) {
  const setting = models.setting;
    const attributes = [
        'id', 'qr_code', 'barcode_type', 'alt_barcode_enabled', 'alt_barcode'
      ]
    let result = await util.getAdminSetting(setting, attributes)
    const response = _.isNil(result) ? {} : result;

    res.json(response);
  }))

  router.get('/labels', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const attributes = [
        'id', 'labels_per_page', 'labels_fontsize', 'labels_width', 'labels_height', 'labels_display_sgutter',
            'labels_display_bgutter', 'labels_pmargin_top', 'labels_pmargin_right', 'labels_pmargin_bottom', 'labels_pmargin_left',
                'labels_pagewidth', 'labels_pageheight', 'labels_display_serial', 'labels_display_tag'
      ]
    let result = await util.getAdminSetting(setting, attributes)
    const response = _.isNil(result) ? {} : result;

    res.json(response);
  }))

  router.get('/settings', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const attributes = [
        'id', 'email_domain', 'email_format', 'username_format', 'show_images_in_email', 'per_page',
            'thumbnail_max_h', 'default_eula_text', 'login_note', 'dashboard_message', 'modellist_displays',
                'depreciation_method', 'privacy_policy_link'
      ]
    let result = await util.getAdminSetting(setting, attributes)
    const response = _.isNil(result) ? {} : result;

    res.json(response);
  }))

  router.get('/localization', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const attributes = [
        'id', 'locale', 'date_display_format', 'time_display_format', 'default_currency'
      ]
    let result = await util.getAdminSetting(setting, attributes)
    const response = _.isNil(result) ? {} : result;

    res.json(response);
  }))

router.put('/admintags/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

router.put('/branding/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

router.put('/barcodes/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

router.put('/labels/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

router.put('/settings/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

router.put('/localization/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

router.put('/security/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

router.get('/access-controls', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const attributes = [
        'id', 'admin_groups_access_enabled'
      ]
    let result = await util.getAdminSetting(setting, attributes)
    const response = _.isNil(result) ? {} : result;

    res.json(response);
}))

router.put('/access-controls/:id', errorHandler(async function(req, res, next) {
    const setting = models.setting;
    const result = await util.updateAdminSetting(setting, req)
    res.result = result;
    next()
}))

module.exports = router;
