const tokens = require("./tokens.js");
const config = require("../config");

var connection = config.db.get;

//Получаем категорию по ID
var getById = (req, categoryId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from categories where id=? and user_id =?",
    [categoryId, user.id],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(null);
      }
    }
  );
};

//Получаем все категории пользователя
var getByUser = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select * from categories where user_id =?",
    [user.id],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(null);
      }
    }
  );
};

//Добавляем категорию
var add = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "INSERT INTO categories SET ?",
    [user.id, req.body.category.name, req.body.category.description],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(error);
      }
    }
  );
};

//Обновляем катгорию по ID
var updateById = (req, categoryId, category, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "update categories set name=?, description=? Where id=? and user_id =?",
    [category.name, category.description, categoryId, user.id],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(error);
      }
    }
  );
};

//Удаляем категорию по ID
var deleteById = (req, categoryId, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "DELETE FROM categories WHERE id=? and user_id=?",
    [categoryId, user.id],
    function(error) {
      if (error) throw error;
      try {
        callback("{success}");
      } catch {
        callback("{error}");
      }
    }
  );
};

//Получаем время исполнения по категориям
var getTimeExecutionForAll = (req, callback) => {
  let user = tokens.getUserFromHeaders(req);
  connection.query(
    "select c.name, SUM(TIMESTAMPDIFF(MINUTE, tl.execution_start, tl.execution_end)) execution_time" +
      " from task_log tl," +
      " tasks t," +
      " categories c" +
      " where tl.task_id = t.id" +
      " and c.id = t.category_id" +
      " and t.user_id = ?" +
      " group by 1",
    [user.id],
    function(error, results) {
      if (error) throw error;
      try {
        callback(results);
      } catch {
        callback(null);
      }
    }
  );
};

module.exports.getById = getById;
module.exports.getByUser = getByUser;
module.exports.add = add;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
module.exports.getTimeExecutionForAll = getTimeExecutionForAll;
