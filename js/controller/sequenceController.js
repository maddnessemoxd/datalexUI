var $ = require('jquery');
var GenerateSchema = require('generate-schema');
require("json-editor");
JSONEditor.defaults.editors.array.options.collapsed = true;
JSONEditor.defaults.editors.array.options.disable_array_delete_last_row = true;
JSONEditor.defaults.options.theme = 'bootstrap3';
JSONEditor.defaults.options.iconlib = 'bootstrap3';


function SequenceController(model, view) {
  var self = this;
  this.model = model;
  this.view = view;

  this.initSequence = function () {
    var defSequence, port, step, defReq, defRes;

    port = window.location.search.substring(1);

    defSequence = $.Deferred();
    defReq = $.Deferred();
    defRes = $.Deferred();

    $('.sequence__heading--main').text('Port: ' + port);

    self.model.getSequencesList(port).complete(function (xhr, status) {
      defSequence.resolve(xhr);
    });

    $.when(defSequence).then(function (sequencesList) {
      if (sequencesList.status === 200) {
        step = sequencesList.responseJSON[0];
        self.view.render(sequencesList.responseJSON);
        self.model.getRequest(port, step).complete(function (xhr, status) {
          defReq.resolve(xhr);
        });
        self.model.getResponse(port, step).complete(function (xhr, status) {
          defRes.resolve(xhr);
        });

        $.when(defReq, defRes).then(function (reqXhr, resXhr) {
          if (reqXhr.status === 200 && resXhr.status === 200) {
            self.createEditors(reqXhr.responseJSON, resXhr.responseJSON);
            self.view.addUpdateButtons();
          } else {
            self.view.showPopup({status: 'error', statusText: 'Request or Response not found'});
          }
        });

      } else if (sequencesList.status === 204) {
        self.view.showPopup({status: 'warning', statusText: 'Empty sequence list'});
      }
    });
  };

  this.createEditors = function (reqJSON, resJSON) {
    var reqSchema = GenerateSchema.json(reqJSON);
    var resSchema = GenerateSchema.json(resJSON);
    reqSchema.properties.method = {
      'type': 'string',
      'format': 'select',
      'enum': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    };
    reqSchema.properties.body = {'type': 'string', 'format': 'textarea', 'options': {'input_height': '200px'}};
    resSchema.properties.body = {'type': 'string', 'format': 'textarea', 'options': {'input_height': '200px'}};

    self.request = new JSONEditor(document.getElementsByClassName('sequence__request')[0], {
      schema: reqSchema,
      startval: reqJSON
    });

    self.response = new JSONEditor(document.getElementsByClassName('sequence__response')[0], {
      schema: resSchema,
      startval: resJSON
    });
  };

  this.validateRequest = function (data) {
    if (data.method && data.protocol) {
      return true;
    } else {
      return false;
    }
  };

  this.initRulesForComparisonGlobal = function () {
    var port, defRules;

    port = window.location.search.substring(1);
    defRules = $.Deferred();

    self.model.getRulesForComparison(port).complete(function (xhr, status) {
      defRules.resolve(xhr);
    });

    $.when(defRules).then(function (defRes) {
      if (defRes.status === 200) {
        self.setRulesGlobal(defRes.responseJSON);
      }
    });

  };

  this.initRulesForComparisonCouple = function (startSequence) {
    var port, defRules, sequence;

    port = window.location.search.substring(1);
    defRules = $.Deferred();
    sequence = startSequence;

    self.model.getRulesForComparisonCouple(port, sequence).complete(function (xhr, status) {
      defRules.resolve(xhr);
    });

    $.when(defRules).then(function (defRes) {
      if (defRes.status === 200) {
        self.setRulesCouple(defRes.responseJSON);
      }
    });

  };

  this.setRulesGlobal = function (rules) {
    var partialRule;

    self.rules = $.extend({}, rules);
    $('input[name=comparison-options--modal][value=' + rules.comparisonType + ']').prop('checked', true).trigger('change');

    if (rules.excluded.length !== 0) {
      $('input[name=partial-rules--modal][value=exclude]').prop('checked', true);
      partialRule = 'exclude';
      self.view.addHeaders(rules.excluded, partialRule, 'sequence__list-of-partial--modal');
    } else if (rules.included.length !== 0) {
      $('input[name=partial-rules--modal][value=include]').prop('checked', true);
      partialRule = 'include';
      self.view.addHeaders(rules.included, partialRule, 'sequence__list-of-partial--modal');
    }

  };

  this.setRulesCouple = function (rules) {
    var partialRule;

    self.sequenceRules = $.extend({}, rules);
    $('input[name=comparison-options][value=' + rules.comparisonType + ']').prop('checked', true).trigger('change');

    if (rules.excluded.length !== 0) {
      $('input[name=partial-rules][value=exclude]').prop('checked', true);
      partialRule = 'exclude';
      self.view.addHeaders(rules.excluded, partialRule, 'sequence__list-of-partial');
    } else if (rules.included.length !== 0) {
      $('input[name=partial-rules][value=include]').prop('checked', true);
      partialRule = 'include';
      self.view.addHeaders(rules.included, partialRule, 'sequence__list-of-partial');
    }
  };

  this.clearAll = function (e) {
    var port, defClear;
    e.preventDefault();

    port = window.location.search.substring(1);
    defClear = $.Deferred();

    self.model.clearAll(port).complete(function (xhr, status) {
      defClear.resolve(xhr);
    });

    $.when(defClear).then(function (clearXhr) {
      if (clearXhr.status === 204) {
        $('.sequence__request').empty();
        $('.sequence__response').empty();
        $('#sequence-list').empty();
        self.view.showPopup({status: 'success', statusText: 'Clear successful'});
      } else if (clearXhr.status === 404) {
        self.view.showPopup({status: 'error', statusText: 'Clear failed'});
      }
    });
  };

  this.getRequestResponse = function (e) {
    var step, defReq, defRes, port;

    step = $(e.target).text().trim();
    port = window.location.search.substring(1);

    defReq = $.Deferred();
    defRes = $.Deferred();

    self.model.getRequest(port, step).complete(function (xhr, status) {
      defReq.resolve(xhr);
    });

    self.model.getResponse(port, step).complete(function (xhr, status) {
      defRes.resolve(xhr);
    });

    $.when(defReq, defRes).then(function (reqXhr, resXhr) {
      if (reqXhr.status === 200 && resXhr.status === 200) {
        $('.sequence__request').empty();
        $('.sequence__response').empty();
        self.createEditors(reqXhr.responseJSON, resXhr.responseJSON);
        self.view.addUpdateButtons();
      } else {
        self.view.showPopup({status: 'error', statusText: 'Request or Response not found'});
      }
    });
  };

  this.updateReqRes = function (e) {
    var def, port, step, valid, dataForUpdate, func, popupText, validation;

    port = window.location.search.substring(1);
    step = $('.sequence-list__button.active').text().trim();
    def = $.Deferred();

    if ($(e.target).hasClass('button--update-request')) {

      valid = self.request.validate();
      func = self.model.updateRequest;
      dataForUpdate = self.request.getValue();
      popupText = 'Request';
      validation = self.validateRequest(dataForUpdate);

    } else if ($(e.target).hasClass('button--update-response')) {

      valid = self.response.validate();
      func = self.model.updateResponse;
      dataForUpdate = self.response.getValue();
      popupText = 'Response';
      validation = true;

    }


    if (valid.length === 0 && validation) {
      func(port, step, dataForUpdate).complete(function (xhr, status) {
        def.resolve(xhr);
      });

      $.when(def).then(function (xhr) {
        if (xhr.status === 200) {
          self.view.showPopup({status: 'success', statusText: popupText + ' updated'});
        } else if (xhr.status === 404) {
          self.view.showPopup({status: 'error', statusText: popupText + ' not found'});
        } else if (xhr.status === 304) {
          self.view.showPopup({status: 'warning', statusText: popupText + ' not modified'});
        }
      });
    } else {
      self.view.showPopup({status: 'error', statusText: 'Invalid JSON'});
    }
  };

  this.downloadAll = function (e) {
    var port;
    e.preventDefault();
    port = window.location.search.substring(1);
    window.open('api/download/' + port);
  };

  this.updateComparisonRules = function (e, comparisonOption, partialRules, listOfPartial) {

    var checkedOption, def, partialType, headersList, rulesObject, port, func, global, sequence;
    def = $.Deferred();
    port = window.location.search.substring(1);
    sequence = $('.sequence-list__button.active').text().trim();
    checkedOption = $('input[name=' + comparisonOption + ']:checked').val();
    partialType = $('input[name=' + partialRules + ']:checked').val().trim();
    headersList = self.getHeadersList($('.' + listOfPartial), partialType);

    if (checkedOption !== 'PARTIAL') {
      rulesObject = {comparisonType: checkedOption, excluded: [], included: []};
    } else {
      if (partialType !== 'exclude') {
        rulesObject = {comparisonType: checkedOption, excluded: [], included: headersList};
      } else {
        rulesObject = {comparisonType: checkedOption, excluded: headersList, included: []};
      }
    }

    if ($(e.target).hasClass('modal__button--submit-rules')) {
      func = self.model.updateRulesForCompasion;
      global = true;
    } else if ($(e.target).hasClass('button--submit-rules')) {
      func = self.model.updateRulesForCompasionCouple;
      global = false;
    }

    func(port, rulesObject, sequence).complete(function (xhr, status) {
      def.resolve(xhr);
    });

    $.when(def).then(function (defRes) {
      if (defRes.status === 200) {
        self.view.showPopup({status: 'success', statusText: 'Comparison rules added'});
        if (global) {
          self.rules = $.extend({}, rulesObject);
        } else {
          self.sequenceRules = $.extend({}, rulesObject);
        }
        $('#rulesModal').modal('hide');

      } else if (defRes.status === 304) {
        self.view.showPopup({status: 'warning', statusText: 'Comparison rules not modified'});
        if (global) {
          self.rules = $.extend({}, rulesObject);
        } else {
          self.sequenceRules = $.extend({}, rulesObject);
        }
      } else if (defRes.status === 422) {
        self.view.showPopup({status: 'error', statusText: 'Comparison rules not valid'});
      }
    });
  };

  this.getHeadersList = function (target, rule) {
    var arr = [];
    $(target).children('li.' + rule).each(function (i, item) {
      arr.push($(this).text().slice(0, -1).trim());
    });
    return arr;
  };

  this.init = function () {
    self.initSequence();
    self.initRulesForComparisonGlobal();
    self.initRulesForComparisonCouple(1);

    $(self.view.container).delegate('.button--sequence', 'click', self.updateReqRes);

    $('#sequence-list').on('click','.sequence-list__button', self.getRequestResponse);

    $('#sequence-list').on('click','.sequence-list__button', function (e) {
      $('.sequence__list-of-partial').empty();
      console.log($(e.target).text().trim());
      self.initRulesForComparisonCouple($(e.target).text().trim());
    });

    $('.sequence__button--download').on('click', self.downloadAll);

    $('.button--submit').on('click', function (e) {
      self.clearAll(e);
      $('#clearModal').modal('hide');
    });

    $('.sequence__comparison-radio--modal').on('change', function () {
      self.view.showPartialsOptions('sequence__comparison-radio-partial--modal', 'sequence__partial-options--modal');
    });

    $('.sequence__comparison-radio').on('change', function () {
      self.view.showPartialsOptions('sequence__comparison-radio-partial', 'sequence__partial-options');
    });

    $('.sequence__button-add-header--modal').on('click', function () {
      self.view.addHeaderToComparison('sequence__input-for-rules--modal', 'partial-rules--modal', 'sequence__list-of-partial--modal');
    });

    $('.sequence__button-add-header').on('click', function () {
      self.view.addHeaderToComparison('sequence__input-for-rules', 'partial-rules', 'sequence__list-of-partial');
    });

    $('#rulesModal').delegate('.sequence__button-remove-header', 'click', self.view.removeHeaderToCompasion);

    $('#comparison').delegate('.sequence__button-remove-header', 'click', self.view.removeHeaderToCompasion);

    $('.modal__button--submit-rules').on('click', function (e) {
      self.updateComparisonRules(e, 'comparison-options--modal', 'partial-rules--modal', 'sequence__list-of-partial--modal');
    });

    $('.button--submit-rules').on('click', function (e) {
      self.updateComparisonRules(e, 'comparison-options', 'partial-rules', 'sequence__list-of-partial');
    });

    $('input[name=comparison-options--modal]').on('change', function (e) {
      self.view.clearAllHeadersToComparison(e, 'sequence__list-of-partial--modal');
    });

    $('#rulesModal').on('hidden.bs.modal', function () {
      $('.sequence__list-of-partial--modal').empty();
      self.setRulesGlobal(self.rules);
    });

    $('input[name=partial-rules--modal]').on('change', function (e) {
      self.view.toggleListItem(e, 'sequence__list-of-partial--modal');
    });

    $('input[name=partial-rules]').on('change', function (e) {
      self.view.toggleListItem(e, 'sequence__list-of-partial');
    });

    $('#myTabs a').click(function (e) {
      e.preventDefault();
      $(this).tab('show')
    });

    $('.nav-tabs a').on('hidden.bs.tab', function (e) {
      if (e.target.id === 'coupleComparison') {
        $('.sequence__list-of-partial').empty();
        self.setRulesCouple(self.sequenceRules);
      }
    });
  };
}

module.exports = SequenceController;