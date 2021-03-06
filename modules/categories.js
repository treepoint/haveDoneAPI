const tokens = require("./tokens.js");
const utils = require("./utils.js");
const newUserData = require("./newUserData");
const config = require("../config");

var connection = config.db.get;

//Получаем категорию по ID
var getById = (req, res) => {
  let id = req.params.id;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "select * from categories where id=? and user_id =?",
    [id, user.id],
    function (error, results) {
      //Преобразуем стили в объект
      let result = results.map((item) => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, result, res, 404);
    }
  );
};

//Получаем все категории пользователя
var getByUser = (req, res) => {
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "  select c.* " +
    "  from categories c  " +
    " where (c.close_date is null or exists (select 1 from tasks t where t.category_id = c.id)) " +
    "   and user_id = ?",
    [user.id],
    function (error, results) {
      //Преобразуем стили в объект
      let result = results.map((item) => {
        item.name_style = JSON.parse(item.name_style);

        return item;
      });

      utils.sendResultOrCode(error, utils.arrayToIdObject(result), res, 404);
    }
  );
};

//Добавляем категорию
var add = (req, res) => {
  let category = req.body;
  let user = tokens.getUserFromHeaders(req);

  connection.query(
    "insert into categories set ?",
    {
      user_id: user.id,
      project_id: category.project_id,
      name: category.name,
      name_style: category.name_style,
      description: category.description,
      create_date: utils.getCurrentDate(),
    },
    function (error, results) {
      //Если добавили — получим этот объект и вернем уже его
      if (typeof results.insertId === "number") {
        connection.query(
          "select * from categories where id=? and user_id =?",
          [results.insertId, user.id],
          function (error, results) {
            //Преобразуем стили в объект
            let result = results.map((item) => {
              item.name_style = JSON.parse(item.name_style);

              return item;
            });
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(result),
              res,
              400
            );
          }
        );
      } else {
        //Иначе вернем код ошибки
        res.send(400);
        res.end();
      }
    }
  );
};

//Обновляем категорию по ID
var updateById = (req, res) => {
  let id = req.params.id;
  let category = req.body;

  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "update categories set name=?, name_style = ?, description=?, close_date=? Where id=? and user_id =?",
    [
      category.name,
      JSON.stringify(category.name_style),
      category.description,
      utils.formatDate(category.close_date),
      id,
      user.id,
    ],
    function (error, results) {
      //Если обновили — получим этот объект и вернем уже его
      if (typeof results.affectedRows === "number") {
        connection.query(
          "select * from categories where id=? and user_id =?",
          [id, user.id],
          function (error, results) {
            //Преобразуем стили в объект
            let result = results.map((item) => {
              item.name_style = JSON.parse(item.name_style);

              return item;
            });
            //Если получилось — вернем результат или код ошибки
            utils.sendResultOrCode(
              error,
              utils.arrayToIdObject(result),
              res,
              400
            );
          }
        );
      }
    }
  );
};

//Создаем тестовую категорию
var createFirstUserCategory = (user_id) => {

  //Получим ID первого открытого проекта пользователя
  connection.query(
    "  select c.id " +
    "  from projects c  " +
    " where (c.close_date is null or exists (select 1 from tasks t where t.category_id = c.id)) " +
    "   and user_id = ?" +
    " limit 1",
    [user_id],
    function (error, result) {

      let project_id = result[0].id;

      connection.query(
        "insert into categories set ?",
        {
          user_id: user_id,
          project_id: project_id,
          name: newUserData.firstCategoryName,
          name_style: "{}",
          description: newUserData.firstCategoryDescription,
          create_date: utils.getCurrentDate(),
        })
    });
}

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.createFirstUserCategory = createFirstUserCategory;
