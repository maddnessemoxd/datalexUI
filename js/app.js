require('bootstrap');
require('bootstrap/dist/css/bootstrap.css');
require('../less/main.less');

var TableModel = require('./model/tableModel');
var TableController = require('./controller/tableController');
var TableView = require('./view/tableView');
var initTemplate = require('./view/templates/init.html');
var popUpTemplate = require('./view/templates/popup.html');
var rowTemplate = require('./view/templates/row.html');
var modalTemplate = require('./view/templates/modal.html');
var $ = require('jquery');

function App() {

  var tableModel = new TableModel();
  var tableView = new TableView(initTemplate, popUpTemplate, rowTemplate, modalTemplate);
  var tableController = new TableController(tableModel, tableView);

  tableController.init();
}

App();