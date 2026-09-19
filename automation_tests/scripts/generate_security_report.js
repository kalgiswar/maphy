const {
  writeEndpointInventoryReport,
  writeChecklistReport
} = require('../helpers/report_helper');

const inventoryPath = writeEndpointInventoryReport();
const checklistPath = writeChecklistReport();

console.log(`Wrote endpoint inventory: ${inventoryPath}`);
console.log(`Wrote checklist coverage: ${checklistPath}`);
