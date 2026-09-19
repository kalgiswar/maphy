# Maphy API Endpoint Inventory

Generated: 2026-06-23T12:03:00.628Z

Target API base URL: `http://localhost:4009/api/v1`

| Method | Path | Auth | Category | Parameters |
|---|---|---|---|---|
| GET | `/` | Yes | root |  |
| POST | `/` | Yes | root |  |
| GET | `/accessories` | Yes | Inventory |  |
| POST | `/accessories` | Yes | Inventory |  |
| DELETE | `/accessories/:id` | Yes | Inventory | id |
| GET | `/accessories/:id` | Yes | Inventory | id |
| PUT | `/accessories/:id` | Yes | Inventory | id |
| GET | `/accessories/:id/checkedout` | Yes | Inventory | id |
| GET | `/accessories/:id/checkin` | Yes | Inventory | id |
| POST | `/accessories/:id/checkin` | Yes | Inventory | id |
| POST | `/accessories/:id/checkout` | Yes | Inventory | id |
| GET | `/accessories/chart` | Yes | Inventory |  |
| GET | `/accessories/selectList` | Yes | Inventory |  |
| GET | `/admin/access-controls` | Yes | Admin |  |
| PUT | `/admin/access-controls/:id` | Yes | Admin | id |
| GET | `/admin/admintags` | Yes | Admin |  |
| PUT | `/admin/admintags/:id` | Yes | Admin | id |
| GET | `/admin/barcodes` | Yes | Admin |  |
| PUT | `/admin/barcodes/:id` | Yes | Admin | id |
| GET | `/admin/branding` | Yes | Admin |  |
| PUT | `/admin/branding/:id` | Yes | Admin | id |
| GET | `/admin/labels` | Yes | Admin |  |
| PUT | `/admin/labels/:id` | Yes | Admin | id |
| GET | `/admin/localization` | Yes | Admin |  |
| PUT | `/admin/localization/:id` | Yes | Admin | id |
| PUT | `/admin/security/:id` | Yes | Admin | id |
| GET | `/admin/settings` | Yes | Admin |  |
| PUT | `/admin/settings/:id` | Yes | Admin | id |
| GET | `/audit` | Yes | Audit |  |
| POST | `/audit` | Yes | Audit |  |
| GET | `/categories` | Yes | Settings |  |
| POST | `/categories` | Yes | Settings |  |
| DELETE | `/categories/:id` | Yes | Settings | id |
| GET | `/categories/:id` | Yes | Settings | id |
| PUT | `/categories/:id` | Yes | Settings | id |
| GET | `/categories/selectList/:type` | Yes | Settings | type |
| GET | `/companies` | Yes | Settings |  |
| POST | `/companies` | Yes | Settings |  |
| DELETE | `/companies/:id` | Yes | Settings | id |
| GET | `/companies/:id` | Yes | Settings | id |
| PUT | `/companies/:id` | Yes | Settings | id |
| GET | `/companies/selectList` | Yes | Settings |  |
| GET | `/components` | Yes | Inventory |  |
| POST | `/components` | Yes | Inventory |  |
| DELETE | `/components/:id` | Yes | Inventory | id |
| GET | `/components/:id` | Yes | Inventory | id |
| PUT | `/components/:id` | Yes | Inventory | id |
| GET | `/components/:id/assets` | Yes | Inventory | id |
| POST | `/components/:id/checkin` | Yes | Inventory | id |
| POST | `/components/:id/checkout` | Yes | Inventory | id |
| GET | `/components/chart` | Yes | Inventory |  |
| GET | `/components/selectList` | Yes | Inventory |  |
| GET | `/consumables` | Yes | Inventory |  |
| POST | `/consumables` | Yes | Inventory |  |
| DELETE | `/consumables/:id` | Yes | Inventory | id |
| GET | `/consumables/:id` | Yes | Inventory | id |
| PUT | `/consumables/:id` | Yes | Inventory | id |
| GET | `/consumables/:id/checkout` | Yes | Inventory | id |
| POST | `/consumables/:id/checkout` | Yes | Inventory | id |
| GET | `/consumables/chart` | Yes | Inventory |  |
| GET | `/consumables/selectList` | Yes | Inventory |  |
| GET | `/consumables/view/:id/users` | Yes | Inventory | id |
| GET | `/contactus` | No | Public |  |
| POST | `/contactus` | No | Public |  |
| PUT | `/contactus/:id` | Yes | Public | id |
| POST | `/customFieldCustomFieldsets` | Yes | Settings |  |
| DELETE | `/customFieldCustomFieldsets/:id` | Yes | Settings | id |
| GET | `/customFieldCustomFieldsets/:id` | Yes | Settings | id |
| GET | `/customfields` | Yes | Settings |  |
| POST | `/customfields` | Yes | Settings |  |
| DELETE | `/customfields/:id` | Yes | Settings | id |
| GET | `/customfields/:id` | Yes | Settings | id |
| PUT | `/customfields/:id` | Yes | Settings | id |
| GET | `/customFieldsets` | Yes | Settings |  |
| POST | `/customFieldsets` | Yes | Settings |  |
| DELETE | `/customFieldsets/:id` | Yes | Settings | id |
| GET | `/customFieldsets/:id` | Yes | Settings | id |
| PUT | `/customFieldsets/:id` | Yes | Settings | id |
| GET | `/customFieldsets/selectList` | Yes | Settings |  |
| GET | `/dashboard` | Yes | Dashboard |  |
| GET | `/dashboard/assets` | Yes | Dashboard |  |
| GET | `/dashboard/chart` | Yes | Dashboard |  |
| GET | `/dashboard/chart/tickets` | Yes | Dashboard |  |
| GET | `/departments` | Yes | Settings |  |
| POST | `/departments` | Yes | Settings |  |
| DELETE | `/departments/:id` | Yes | Settings | id |
| GET | `/departments/:id` | Yes | Settings | id |
| PUT | `/departments/:id` | Yes | Settings | id |
| GET | `/departments/selectList` | Yes | Settings |  |
| GET | `/depreciations` | Yes | Settings |  |
| POST | `/depreciations` | Yes | Settings |  |
| DELETE | `/depreciations/:id` | Yes | Settings | id |
| GET | `/depreciations/:id` | Yes | Settings | id |
| PUT | `/depreciations/:id` | Yes | Settings | id |
| GET | `/depreciations/selectList` | Yes | Settings |  |
| GET | `/firms/getBrandingDetails` | Yes | Admin |  |
| PUT | `/firms/uploadLogo` | Yes | Admin |  |
| GET | `/groups` | Yes | Admin |  |
| POST | `/groups` | Yes | Admin |  |
| DELETE | `/groups/:id` | Yes | Admin | id |
| GET | `/groups/:id` | Yes | Admin | id |
| PUT | `/groups/:id` | Yes | Admin | id |
| GET | `/groups/selectList` | Yes | Admin |  |
| GET | `/hardware` | Yes | Assets |  |
| POST | `/hardware` | Yes | Assets |  |
| DELETE | `/hardware/:id` | Yes | Assets | id |
| GET | `/hardware/:id` | Yes | Assets | id |
| PUT | `/hardware/:id` | Yes | Assets | id |
| POST | `/hardware/:id/checkin` | Yes | Assets | id |
| POST | `/hardware/:id/checkout` | Yes | Assets | id |
| GET | `/hardware/:id/clone` | Yes | Assets | id |
| POST | `/hardware/agent-import` | Yes | Assets |  |
| POST | `/hardware/approve-agent` | Yes | Assets |  |
| POST | `/hardware/audit` | Yes | Assets |  |
| GET | `/hardware/audit/selectList` | Yes | Assets |  |
| POST | `/hardware/bulk-upload` | Yes | Assets |  |
| POST | `/hardware/bulkcheckout` | Yes | Assets |  |
| GET | `/hardware/byserial/:serialno` | Yes | Assets | serialno |
| GET | `/hardware/byStatus` | Yes | Assets |  |
| GET | `/hardware/bytag/:tagId` | Yes | Assets | tagId |
| POST | `/hardware/Old_bulkcheckout` | Yes | Assets |  |
| GET | `/hardware/pending-agent` | Yes | Assets |  |
| DELETE | `/hardware/pending-agent/:id` | Yes | Assets | id |
| GET | `/hardware/selectList` | Yes | Assets |  |
| GET | `/hardware/totalassetcost` | Yes | Assets |  |
| GET | `/hardware/totalassets` | Yes | Assets |  |
| GET | `/kits` | Yes | Inventory |  |
| POST | `/kits` | Yes | Inventory |  |
| DELETE | `/kits/:id` | Yes | Inventory | id |
| GET | `/kits/:id` | Yes | Inventory | id |
| PUT | `/kits/:id` | Yes | Inventory | id |
| DELETE | `/kits/model/:id` | Yes | Inventory | id |
| GET | `/kits/models` | Yes | Inventory |  |
| POST | `/kits/models` | Yes | Inventory |  |
| PUT | `/kits/models/:id` | Yes | Inventory | id |
| GET | `/labels` | Yes | Admin |  |
| POST | `/labels` | Yes | Admin |  |
| PUT | `/labels/:id` | Yes | Admin | id |
| GET | `/licenseNotifications` | Yes | Admin |  |
| POST | `/licenseNotifications` | Yes | Admin |  |
| GET | `/licenses` | Yes | Inventory |  |
| POST | `/licenses` | Yes | Inventory |  |
| DELETE | `/licenses/:id` | Yes | Inventory | id |
| GET | `/licenses/:id` | Yes | Inventory | id |
| PUT | `/licenses/:id` | Yes | Inventory | id |
| GET | `/licenses/:id/checkin` | Yes | Inventory | id |
| POST | `/licenses/:id/checkin` | Yes | Inventory | id |
| POST | `/licenses/:id/checkout` | Yes | Inventory | id |
| POST | `/licenses/:id/checkout/:seatId` | Yes | Inventory | id, seatId |
| GET | `/licenses/:id/clone` | Yes | Inventory | id |
| GET | `/licenses/:id/seats` | Yes | Inventory | id |
| GET | `/licenses/chart` | Yes | Inventory |  |
| GET | `/licenses/selectList` | Yes | Inventory |  |
| GET | `/locations` | Yes | Settings |  |
| POST | `/locations` | Yes | Settings |  |
| DELETE | `/locations/:id` | Yes | Settings | id |
| GET | `/locations/:id` | Yes | Settings | id |
| PUT | `/locations/:id` | Yes | Settings | id |
| GET | `/locations/old_get` | Yes | Settings |  |
| GET | `/locations/selectList` | Yes | Settings |  |
| GET | `/maintenances` | Yes | Assets |  |
| POST | `/maintenances` | Yes | Assets |  |
| DELETE | `/maintenances/:id` | Yes | Assets | id |
| GET | `/maintenances/:id` | Yes | Assets | id |
| PUT | `/maintenances/:id` | Yes | Assets | id |
| GET | `/maintenances/selectList` | Yes | Assets |  |
| GET | `/manufacturers` | Yes | Settings |  |
| POST | `/manufacturers` | Yes | Settings |  |
| DELETE | `/manufacturers/:id` | Yes | Settings | id |
| GET | `/manufacturers/:id` | Yes | Settings | id |
| PUT | `/manufacturers/:id` | Yes | Settings | id |
| PUT | `/manufacturers/restore/:id` | Yes | Settings | id |
| GET | `/manufacturers/selectList` | Yes | Settings |  |
| GET | `/models` | Yes | Settings |  |
| POST | `/models` | Yes | Settings |  |
| DELETE | `/models/:id` | Yes | Settings | id |
| GET | `/models/:id` | Yes | Settings | id |
| PUT | `/models/:id` | Yes | Settings | id |
| PUT | `/models/restore/:id` | Yes | Settings | id |
| GET | `/models/selectList` | Yes | Settings |  |
| GET | `/register/firms` | No | Registration |  |
| POST | `/register/firms` | No | Registration |  |
| GET | `/register/firms/:id` | Yes | Registration | id |
| PUT | `/register/firms/:id/activate` | Yes | Registration | id |
| PUT | `/register/firms/:id/deactivate` | Yes | Registration | id |
| PUT | `/register/firms/:id/subscription` | Yes | Registration | id |
| GET | `/reports/accessories` | Yes | Reports |  |
| GET | `/reports/activity` | Yes | Reports |  |
| GET | `/reports/activityForAsset/:id` | Yes | Reports | id |
| GET | `/reports/assets` | Yes | Reports |  |
| GET | `/reports/components` | Yes | Reports |  |
| GET | `/reports/consumables` | Yes | Reports |  |
| GET | `/reports/depreciations` | Yes | Reports |  |
| GET | `/reports/licenses` | Yes | Reports |  |
| GET | `/scrapSale` | Yes | Scrap Sale |  |
| POST | `/scrapSale` | Yes | Scrap Sale |  |
| DELETE | `/scrapSale/:id` | Yes | Scrap Sale | id |
| GET | `/scrapSale/:id` | Yes | Scrap Sale | id |
| PUT | `/scrapSale/:id` | Yes | Scrap Sale | id |
| GET | `/severity` | Yes | Admin |  |
| POST | `/severity` | Yes | Admin |  |
| DELETE | `/severity/:id` | Yes | Admin | id |
| GET | `/severity/:id` | Yes | Admin | id |
| PUT | `/severity/:id` | Yes | Admin | id |
| GET | `/severity/selectList` | Yes | Admin |  |
| GET | `/shorturl` | Yes | Short URL |  |
| POST | `/shorturl` | Yes | Short URL |  |
| DELETE | `/shorturl/:id` | Yes | Short URL | id |
| PUT | `/shorturl/:id` | Yes | Short URL | id |
| GET | `/shorturl/code/:urlId` | Yes | Short URL | urlId |
| GET | `/statuslabels` | Yes | Settings |  |
| POST | `/statuslabels` | Yes | Settings |  |
| DELETE | `/statuslabels/:id` | Yes | Settings | id |
| GET | `/statuslabels/:id` | Yes | Settings | id |
| PUT | `/statuslabels/:id` | Yes | Settings | id |
| GET | `/statuslabels/selectList` | Yes | Settings |  |
| GET | `/suppliers` | Yes | Settings |  |
| POST | `/suppliers` | Yes | Settings |  |
| DELETE | `/suppliers/:id` | Yes | Settings | id |
| GET | `/suppliers/:id` | Yes | Settings | id |
| PUT | `/suppliers/:id` | Yes | Settings | id |
| GET | `/suppliers/selectList` | Yes | Settings |  |
| GET | `/talentGroups` | Yes | Admin |  |
| POST | `/talentGroups` | Yes | Admin |  |
| DELETE | `/talentGroups/:id` | Yes | Admin | id |
| GET | `/talentGroups/:id` | Yes | Admin | id |
| PUT | `/talentGroups/:id` | Yes | Admin | id |
| GET | `/talentGroups/selectList` | Yes | Admin |  |
| GET | `/ticketIssues` | Yes | Admin |  |
| POST | `/ticketIssues` | Yes | Admin |  |
| DELETE | `/ticketIssues/:id` | Yes | Admin | id |
| GET | `/ticketIssues/:id` | Yes | Admin | id |
| PUT | `/ticketIssues/:id` | Yes | Admin | id |
| GET | `/ticketIssues/selectList` | Yes | Admin |  |
| GET | `/tickets` | Yes | Tickets |  |
| POST | `/tickets` | Yes | Tickets |  |
| GET | `/tickets/:id` | Yes | Tickets | id |
| PUT | `/tickets/:id` | Yes | Tickets | id |
| POST | `/tickets/:id/sister` | Yes | Tickets | id |
| GET | `/tickets/:talentGroupId/users` | Yes | Tickets | talentGroupId |
| GET | `/tickets/chart` | Yes | Tickets |  |
| GET | `/tickets/ticketstatus` | Yes | Tickets |  |
| GET | `/users` | Yes | Users |  |
| POST | `/users` | Yes | Users |  |
| DELETE | `/users/:id` | Yes | Users | id |
| GET | `/users/:id` | Yes | Users | id |
| PUT | `/users/:id` | Yes | Users | id |
| GET | `/users/:id/status` | Yes | Users | id |
| POST | `/users/changePassword` | Yes | Users |  |
| GET | `/users/chart` | Yes | Users |  |
| POST | `/users/generateOtp` | No | Users |  |
| POST | `/users/login` | No | Users |  |
| POST | `/users/maintenanceEmail` | Yes | Users |  |
| GET | `/users/me` | Yes | Users |  |
| PUT | `/users/onboarding/dismiss` | Yes | Users |  |
| PUT | `/users/password/update` | No | Users |  |
| PUT | `/users/restore/:id` | Yes | Users | id |
| GET | `/users/selectList` | Yes | Users |  |
| POST | `/users/slack` | Yes | Users |  |
| PUT | `/users/status/:id` | Yes | Users | id |
| POST | `/users/totpSetup/:id` | Yes | Users | id |
| PUT | `/users/verify/:id` | Yes | Users | id |
| GET | `/workstatus` | Yes | Work Status |  |
| POST | `/workstatus` | Yes | Work Status |  |
| PUT | `/workstatus/:id` | Yes | Work Status | id |
| GET | `/workstatus/currentTime` | Yes | Work Status |  |
