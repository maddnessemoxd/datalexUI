var _ = require('lodash');
var $ = require('jquery');

function TableView(initTemp, popup, row, modal) {
  this.initTemp = initTemp;
  this.popupTemp = popup;
  this.row = row;
  this.modal = modal;
  this.table = $('.table tbody');

  var self = this;

  this.renderModal = function(mods) {
    var template = _.template(self.modal)({mods: mods});
    $('.page').append(template);
  };

  this.renderPopUp = function(data) {
    var template = _.template(self.popupTemp)({update: data});
    $('.page').append(template);
    setTimeout(function() {
      $('.popup').fadeOut('slow', function () {
        $(this).remove();
      })
    }, 3000);
  };

  this.render = function (mods) {
    var template = _.template(self.initTemp)({data:mods});
    $(self.table).append(template);
  };

  this.addError = function (match, target) {
    if (!match) {
      $(target).addClass('table--error');
    } else {
      $(target).removeClass('table--error');
    }
  };

  this.clearModal = function () {
    $('.modal__input--port').removeClass('table--error').val('');
    $('.modal__input--remote').removeClass('table--error').val('');
  };

  this.removeRow = function (target) {
    var row = $(target).closest('tr');
    $(row).remove();
  };

  this.addRow = function (port, remote, mode, modsList) {
    var template = _.template(self.row)({data:{config:{localPort: port,remoteHost:remote, mode: mode}, modsList: modsList}});
    $(self.table).append(template);
  };

  this.hideStep = function () {
    var stepInput = $(this).closest('tr').find('.table__input--step');
    var updateBtn = $(this).closest('tr').find('.button__update--step');

    if ($(this).val() !== 'FLOW_EMULATOR') {
      $(stepInput).hide();
      $(updateBtn).hide();
    } else {
      $(stepInput).show();
      $(updateBtn).show();
    }
  };

}

module.exports = TableView;