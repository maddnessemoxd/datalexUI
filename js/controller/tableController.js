var $ = require('jquery');

function TableController(model, view) {

  var self = this;

  this.modsList;
  this.model = model;
  this.view = view;
  this.targetForDeletion;

  this.validateField = function (e) {
    var pattern, value, match, target, isValid, spaces;
    target = $(e.target);
    value = $(target).val();

    if ($(target).hasClass('table__input--remote') || $(target).hasClass('modal__input--remote')) {

      isValid = target.context.validity.valid;
      spaces = target.val().indexOf(' ');

      if (isValid && spaces === -1) {
        self.view.addError(true, target);
      } else {
        self.view.addError(false, target);
      }

    } else if ($(target).hasClass('modal__input--port')) {

      var portPattern = /^[1-9][\d]*/g;
      if (value.match(portPattern)) {
        if (value > 0 && value < 65536) {
          self.view.addError(true, target);
          return;
        }
      }
      self.view.addError(false, target);
      return;
    } else if ($(target).hasClass('table__input--step')) {
      pattern = /^[1-9][0-9]*$/g;
      match = value.match(pattern);
      self.view.addError(match, target);
    }

  };

  this.addAppIP = function () {
    var port, remote, modeVal, portVal, remoteVal, defConfig, stepVal;

    defConfig = $.Deferred();
    port = $('.modal__input--port');
    remote = $('.modal__input--remote');
    modeVal = $('.table__mode--modal').val();
    portVal = $(port).val();
    remoteVal = $(remote).val();
    stepVal = 1;

    if (!portVal || !remoteVal || $(port).hasClass('table--error') || $(remote).hasClass('table--error')) {
      self.view.renderPopUp({status:'warning', statusText: 'Invalid fields'});
      return;
    }

    self.model.addNewPort({"localPort": portVal, "remoteHost": remoteVal, "mode": modeVal}).success(function(data, status, xhr) {
      defConfig.resolve(data);
    }).error(function(data, status, xhr) {
      defConfig.resolve(data);
    });

    $.when(defConfig).then(function (confRes) {
      if (confRes.status === 201) {
        self.view.renderPopUp({status: 'success', statusText: 'Configuration added'});
        $('#myModal').modal('hide');
        self.view.clearModal();
        self.view.render({
          config: [{localPort: portVal, remoteHost: remoteVal, mode: modeVal, step: 1}],
          mods: self.modsList
        });
      } else if(confRes.status === 409){
        self.view.renderPopUp({status:'error', statusText: 'Configuration already exists'});
      }
    });
  };


  this.deleteRow = function (target) {
    var remote, step, mode, def, port;

    def = $.Deferred();
    port = $(target).closest('tr').find('.table__port').text();
    remote = $(target).closest('tr').find('.table__input--remote').val();
    step = $(target).closest('tr').find('.table__input--step').val();
    mode = $(target).closest('tr').find('.table__mode').val();

    $('#deleteModal').modal('hide');

    self.model.deletePort({"localPort": port, "remoteHost": remote, "mode": mode}, port).success(
        function (data, status, res) {
          def.resolve(res)
        }
    ).error(
        function (data, status, res) {
          def.resolve(res)
        }
    );

    $.when(def).then(function (res) {

      if (res.status === 204) {
        self.view.renderPopUp({status:'success',statusText: 'Delete successful'});
        self.view.removeRow(target);
      } else if (res.status === 404) {
        self.view.renderPopUp({status:'error',statusText: 'Delete failed'});
        self.view.removeRow(target);
      }
    })

  };

  this.isValidRow = function (target) {
    var remote, remoteVal;

    remote = $(target).closest('tr').find('.table__input--remote');
    remoteVal = $(remote).val();

    if (!remoteVal) {
      return false;
    } else if ($(remote).hasClass('table--error')) {
      return false;
    } else {
      return true;
    }
  };

  this.isValidStep = function(target) {
    var step, mode, modeVal, stepVal;

    step = $(target).closest('tr').find('.table__input--step');
    stepVal = $(step).val();
    mode = $(target).closest('tr').find('.table__mode');
    modeVal = $(mode).val();

    if(modeVal !== 'FLOW_EMULATOR') {
      return true;
    }

    if(!stepVal || $(step).hasClass('table--error')) {
      return false;
    } else {
      return true;
    }
  };

  this.updateStep = function (e) {
    var step, target, stepVal, valid, def, port, portVal;

    target = $(e.target);
    step = $(target).closest('tr').find('.table__input--step');
    port = $(target).closest('tr').find('.table__port');
    stepVal = $(step).val();
    portVal = $(port).text();

    valid = self.isValidStep(target);

    if (valid) {
      def = $.Deferred();

      self.model.updateStepValue(portVal, stepVal).success(function(data, status, xhr) {
        def.resolve(xhr);
      }).error(function(data, status, xhr) {
        def.resolve(xhr);
      });

      $.when(def).then(function (res) {
        if (res.status === 200) {
          self.view.renderPopUp({status: 'success', statusText: 'Step update successful'});
        } else if (res.status === 404) {
          self.view.renderPopUp({status: 'error', statusText: 'Step update failed'});
        }
      });

    } else {
      self.view.renderPopUp({status:'warning',statusText: 'Invalid fields'});
    }
  };

  this.updateConfig = function (e) {
    var target, rowValidation, def, port, remote, mode, step, stepVal, portVal;

    def = $.Deferred();
    target = $(e.target);
    step = $(target).closest('tr').find('.table__input--step');
    mode = $(target).closest('tr').find('.table__mode');
    port = $(target).closest('tr').find('.table__port');
    remote = $(target).closest('tr').find('.table__input--remote');
    stepVal = $(step).val();
    portVal = $(port).text();

    rowValidation = self.isValidRow(target);

    if (rowValidation) {
      self.model.updateConfig({"localPort": portVal, "remoteHost": $(remote).val(), "mode": $(mode).val()}).statusCode({
        200: function (res) {
          def.resolve(res);
        },
        404: function (res) {
          def.resolve(res);
        }
      });
    } else {
      self.view.renderPopUp({status:'warning',statusText: 'Invalid fields'});
    }

    $.when(def).then(function (res) {
      if (res.status === 200) {
        self.view.renderPopUp({status:'success',statusText: 'Configuration updated'});
      } else if (res.status === 404) {
        self.view.renderPopUp({status:'error',statusText: 'Configuration update failed'});
      }
    });
  };

  this.initTable = function () {
    var defConfig = $.Deferred();
    var defMods = $.Deferred();
    var defSteps = $.Deferred();
    var config, mods;

    self.model.getConfiguration().statusCode({
      200: function (res) {
        defConfig.resolve(res);
      },
      204: function (res) {
        defConfig.resolve(res);
      }
    });

    self.model.getModesList().statusCode({
      200: function (res) {
        defMods.resolve(res);
      },
      204: function (res) {
        defMods.resolve(res);
      }
    });

    $.when(defConfig, defMods).then(function (resConfig, resMods) {
      config = resConfig || [];
      mods = resMods || ['PROXY', 'EMULATOR', 'FLOW_EMULATOR'];

      self.model.getSteps().success(function (res, status, xhr) {
        defSteps.resolve(xhr);
      });
    });

    $.when(defSteps).then(function (xhr) {

      if (xhr.status === 200) {
        config = config.map(function (el) {
          if (xhr.responseJSON[el.localPort]) {
            el.step = xhr.responseJSON[el.localPort];
          } else {
            el.step = 1;
          }
          return el;
        });

        self.modsList = mods;
        self.view.renderModal(mods);
        self.view.render({config: config, mods: mods});
      } else if (xhr.status === 204) {
        self.modsList = mods;
        self.view.renderModal(mods);
        self.view.render({config: config, mods: mods});
      }

      self.initModalHandlers();
    })
  };

  this.initModalHandlers = function () {
    $('.modal__input--port').on('change', self.validateField);
    $('.modal__input--remote').on('change', self.validateField);
    $('.modal__button--submit').on('click', self.addAppIP);
    $('#myModal').on('hidden.bs.modal', self.view.clearModal);
  };


  this.showSequencePage = function (e) {
    e.preventDefault();
    var targetValue;

    targetValue = $(e.target).text();
    window.location = 'sequences.html?'+targetValue;
  };

  this.init = function () {
    $(self.view.table).delegate('.button__update--step', 'click', self.updateStep);
    $(self.view.table).delegate('.table__input--remote', 'change', self.validateField);
    $(self.view.table).delegate('.table__input--step', 'change', self.validateField);
    $(self.view.table).delegate('.table__input--step', 'blur', self.validateField);
    $(self.view.table).delegate('.table__mode', 'change', self.view.hideStep);
    $(self.view.table).delegate('.button__update--config', 'click', self.updateConfig);
    $(self.view.table).delegate('.table__port', 'click', self.showSequencePage);

    $('#deleteModal').on('show.bs.modal', function (e) {
       self.targetForDeletion = e.relatedTarget;
    });

    $('.modal__button--submit-delete').on('click', function (e) {
       self.deleteRow(self.targetForDeletion);
    });



    self.initTable();
  }

}

module.exports = TableController;