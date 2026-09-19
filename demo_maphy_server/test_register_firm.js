require('dotenv').config();
const sequelize = require('./db/conn');
const models = require('./db/models/index');
const Sequelize = require('sequelize');

async function test() {
  const transaction = await sequelize.transaction();
  try {
    // 1. Create a dummy location under firm 1
    const loc = await models.location.create({
      name: "Test Location XYZ",
      firm_id: 1
    }, { transaction });
    console.log("Created test location ID:", loc.id);

    // 2. Create the organization and associate this location
    const firmRes = await models.firm.create({
      name: "Test Org XYZ",
      activated: 1,
      user_id: 1
    }, { transaction });
    const firmId = firmRes.id;
    console.log("Created test organization ID:", firmId);

    // Associate location
    const updateCount = await models.location.update({
      firm_id: firmId
    }, {
      where: {
        id: [loc.id]
      },
      transaction
    });
    console.log("Updated locations count:", updateCount);

    // Fetch updated location
    const updatedLoc = await models.location.findOne({
      where: { id: loc.id },
      transaction
    });
    console.log("Updated location firm_id:", updatedLoc.firm_id);

    await transaction.rollback();
    console.log("Transaction rolled back successfully.");
  } catch (err) {
    console.error("Test failed:", err);
    if (transaction) await transaction.rollback();
  } finally {
    await sequelize.close();
  }
}

test();
