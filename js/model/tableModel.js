var $ = require('jquery');

function TableModel() {

  this.getModesList = function () {
    return $.ajax({
      type: 'GET',
       url: 'api/config/modes/',
        // url:'http://demo7517084.mockable.io/portal/api/config/modes/',
      dataType: 'json'
    })
  };

  this.getConfiguration = function () {
    return $.ajax({
      type: 'GET',
       url:'api/config/',
      //  url:'http://demo7517084.mockable.io/portal/api/config/',
      dataType: 'json'
    })
  };

  this.getSteps = function () {
    return $.ajax({
      type: 'GET',
      //  url:'http://demo7517084.mockable.io/api/stepConfig/getAll/',
      url:'api/stepConfig/getAll/',
      dataType: 'json'
    })
  };

  this.updateStepValue = function (port, step) {
    return $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      url:'api/stepConfig/'+port+'/'+step
    })
  };

  this.addNewPort = function (obj) {
    return $.ajax({
      type: 'POST',
      data: JSON.stringify(obj),
      url: 'api/config/',
      contentType: 'application/json',
      dataType: 'json'
    })
  };

  this.updateConfig = function (obj) {
    return $.ajax({
      type: 'PUT',
      data: JSON.stringify(obj),
      contentType: 'application/json',
      url: 'api/config/',
      dataType: 'json'
    })
  };

  this.deletePort = function (obj, port) {
    return $.ajax({
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify(obj),
      url: 'api/config/' + port,
      dataType: 'json'
    })
  }
}

module.exports = TableModel;