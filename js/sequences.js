require('bootstrap');

var SequenceModel = require('./model/sequenceModel');
var SequenceController = require('./controller/sequenceController');
var SequenceView = require('./view/sequenceView');
var template = require('./view/templates/sequenceTemplate.html');
var popup = require('./view/templates/popup.html');

function Sequences() {
  var sequenceModel = new SequenceModel();
  var sequenceView = new SequenceView(template, popup);
  var sequenceController = new SequenceController(sequenceModel, sequenceView);

  sequenceController.init();
}

Sequences();
