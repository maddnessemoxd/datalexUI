var $ = require('jquery');
var _ = require('lodash');

function SequenceView(template, popup) {

  var self = this;
  this.container = $('.sequence');
  this.sequenseList = $('#sequence-list');
  this.template = template;
  this.popupTemp = popup;

  this.render = function (sequenceList) {
    $('#sequence-list').empty();
    sequenceList.forEach(function(item, index) {
      if (item === 1) {
        $('#sequence-list').append('<li class="active sequence-list__button"><a data-toggle="pill" href="#'+item+'">'+item+'</a></li>');
      } else {
        $('#sequence-list').append('<li class="sequence-list__button"><a data-toggle="pill" href="#'+item+'">'+item+'</a></li>');
      }
    });
  };

  this.showPopup = function (data) {
    var template = _.template(self.popupTemp)({ update: data });
    $('.page').append(template);
    setTimeout(function () {
      $('.popup').fadeOut('slow', function () {
        $(this).remove();
      })
    }, 3000);
  };

  this.showPartialsOptions = function (partial, option) {
    var partialRadio;
    partialRadio = $('.' + partial);
    if (partialRadio.prop('checked')) {
      $('.' + option).removeClass('hidden');
      return;
    }
    $('.' + option).addClass('hidden');
  };

  this.isHeaderExist = function (headerName, type, listOfPartial) {
    var result;

    $('.' + listOfPartial).find('li.' + type).each(function (index, element) {
      if ($(element).text().slice(0, -1).trim() === headerName) {
        return result = true;
      }
    });

    return result;
  };

  this.addHeaderToComparison = function (inputRules, inputRulesCheckbox, listOfPartial) {
    var inputVal, isExist, partialType;

    inputVal = $.trim($('.' + inputRules).val());
    partialType = $('input[name=' + inputRulesCheckbox + ']:checked').val().trim();
    isExist = self.isHeaderExist(inputVal, partialType);

    if (!inputVal) {
      self.showPopup({ status: 'warning', statusText: 'Empty string' });
      return;
    } else if (isExist) {
      self.showPopup({ status: 'warning', statusText: 'Header already exists' });
      return;
    }

    $('.' + listOfPartial).append('<li class="list-group-item sequence__list-group-item ' + partialType + ' clearfix">' + inputVal + ' <span class="pull-right"><button class="close sequence__button-remove-header">&times;</button></span></li>');
    $('.' + inputRules).val('');
  };

  this.addHeaders = function (target, rule, listOfPartial) {
    target.forEach(function (element) {
      $('.' + listOfPartial).append('<li class="list-group-item sequence__list-group-item clearfix ' + rule + '">' + element + ' <span class="pull-right"><button class="close sequence__button-remove-header">&times;</button></span></li>');
    });
  };

  this.removeHeaderToCompasion = function (e) {
    var listItem;

    listItem = $(e.target).closest('li');
    listItem.remove();
  };

  this.clearAllHeadersToComparison = function (e, listOfPartial) {
    if ($(e.target).val() !== 'PARTIAL') {
      $('.' + listOfPartial).empty();
    }
  };

  this.toggleListItem = function (e, listOfPartial) {
    // var targetVal, otherRules;
    //
    // targetVal = $(e.target).val().trim();
    //
    // if (targetVal === 'include') {
    //   otherRules = 'exclude';
    // } else {
    //   otherRules = 'include';
    // }
    //
    // $('.sequence__list-of-partial').find('.' + otherRules).each(function (index, element) {
    //   $(this).hide();
    // });
    //
    // $('.sequence__list-of-partial').find('.' + targetVal).each(function (index, element) {
    //   $(this).show();
    // })


    var targetVal, otherRules;

    targetVal = $(e.target).val().trim();

    if (targetVal === 'include') {
      otherRules = 'exclude';
    } else {
      otherRules = 'include';
    }

    $('.' + listOfPartial).find('.' + otherRules).each(function (index, element) {
      $(this).hide();
    });

    $('.' + listOfPartial).find('.' + targetVal).each(function (index, element) {
      $(this).show();
    })
  };

  this.addUpdateButtons = function() {
    $('#request h3:first').append('<button class="btn btn-success button button--sequence button--update-request">Update Request</button>');
    $('#response h3:first').append('<button class="btn btn-success button button--sequence button--update-response">Update Response</button>');
  };

}

module.exports = SequenceView;