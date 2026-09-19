var express = require('express');
const dept = require('../db/models/dept');
var router = express.Router();
var Sequelize = require("sequelize");
const models = require('../db/models/index');

var sequelize = models.sequelize;

/* GET home page. */
router.get('/', async function(req, res, next) {
  // let emps = [],
  //   depts = []
  // const Emp = models.Emp;
  // const Dept = models.Dept;

  // Emp.belongsTo(Dept, {foreignKey: 'emp_id'})

  // let result = []
  //   result = await Emp.findAll({include: [Dept]})

  // res.json({ result: result });
    res.json({result: 'i am running'})
});

router.post('/', async function(req, res, next) {
  const emp = models.emp;
  const dept = models.dept;
  const transResult = await sequelize.transaction(t => {
    return emp.create(emp, {transaction: t}).then(empResult => {
      dept.empId = empResult.id
      return dept.create(dept, {transaction: t});
    });
  }).then(function (result) {
    console.log('commit')
  }).catch(function (err) {
    console.log(err)
  });
})

module.exports = router;
