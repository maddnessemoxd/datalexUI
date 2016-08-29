var $ = require('jquery');

function SequenceModel() {

  this.getSequencesList = function(port) {
    return $.ajax({
      type: 'GET',
      url: 'api/sequence/'+port,
      // url:'http://demo3998185.mockable.io/test2',
      dataType: 'json'
    })
  };

  this.getRequest = function(port, step) {
    return $.ajax({
      type: 'GET',
      url: 'api/request/'+port+'/'+step,
      // url:'http://demo3998185.mockable.io/test',
      dataType: 'json'
    })
  };

  this.getResponse = function(port, step) {
    return $.ajax({
      type: 'GET',
      url: 'api/response/'+port+'/'+step,
      // url:'http://demo3998185.mockable.io/test1',
      dataType: 'json'
    })
  };

  this.updateRequest = function(port, step, obj) {
    return $.ajax({
      type: 'PUT',
      data: JSON.stringify(obj),
      contentType: 'application/json',
      url: 'api/request/'+port+'/'+step
    });
  };


  this.updateResponse = function(port, step, obj) {
    return $.ajax({
      type: 'PUT',
      data:  JSON.stringify(obj),
      contentType: 'application/json',
      url: 'api/response/'+port+'/'+step
    });
  };

  this.clearAll = function(port) {
    return $.ajax({
      type: 'DELETE',
      url: 'api/repository/'+port
      // url: 'http://demo3998185.mockable.io/delete'
    });
  };

  this.downloadAll = function(port) {
    return $.ajax({
      type: 'GET',
      url: 'api/download/'+port
    });
  };

  this.updateRulesForCompasion = function(port, obj) {
    return $.ajax({
      type: 'PUT',
      data: JSON.stringify(obj),
      contentType: 'application/json',
      url: 'api/rule/'+port
    });
  };

  this.updateRulesForCompasionCouple = function(port, obj, sequence) {
    return $.ajax({
      type: 'PUT',
      data: JSON.stringify(obj),
      contentType: 'application/json',
      url: 'api/rule/'+port+'/'+sequence
    });
  };

  this.getRulesForComparison = function(port) {
    return $.ajax({
      type: 'GET',
      url: 'api/rule/'+port
      // url: 'http://demo3998185.mockable.io/test3'
    });
  };

  this.getRulesForComparisonCouple = function(port, sequence) {
    return $.ajax({
      type: 'GET',
      url: 'api/rule/'+port+'/'+sequence
      // url: 'http://demo3998185.mockable.io/test4'
    });
  }

}

module.exports = SequenceModel;