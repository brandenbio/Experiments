// --------------------------------------------------------------------------------------------------
// Epistemic Reasoning (Omniscience Errors) Experiment 1
// --------------------------------------------------------------------------------------------------
// Participants: Amazon Mechanical Turk
//         Date: Aug 2023
//       Design: Branden Bio & Sangeet Khemlani
//         Code: Branden Bio
// --------------------------------------------------------------------------------------------------
// Quickstart. To create nodus-ponens experiment:
//     i) Use the terminal to navigate to the folder that stores this file
//    ii) Type node main.js in the terminal
// The terminal will display experiment information, including a link to whether the experiment can
// be taken and a status of any participants who take the study.
// --------------------------------------------------------------------------------------------------
// Contents
// 1. Setup nodus-ponens framework
// 2. Setup stimuli
// 3. Launch experiment
// --------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------
// 1. Setup nodus-ponens framework
// --------------------------------------------------------------------------------------------------

var path             = require("path");
var fs               = require('fs');
var staticDirectory  = path.resolve("static");              // Set directory of static HTML+CSS files
var dataDirectory    = path.resolve("data");              // Set directory where data will be written
var participantIndex = 0;                            // Start participant numbering at this value + 1

var np               = require("nodus-ponens")(participantIndex, staticDirectory, dataDirectory);
np.authors           = "Branden Bio & Sangeet Khemlani";
np.experimentName    = "OE1";
np.port              = 55150;

// --------------------------------------------------------------------------------------------------
// 2. Setup stimuli
// --------------------------------------------------------------------------------------------------
// Note: nodus-ponens has a special function called "loadStimuli" that is intended to take a
// participant's ID number (an integer) as input and return an array of objects representing the
// stimuli catered to that participant. In the code below, "setupStimuli" serves that purpose, and
// it calls a bunch of helper functions to do its job, e.g., "CSVtoJSON" and "assignContents". Hence
// after defining "setupStimuli", "CSVtoJSON", and "assignContents", the code sets np.loadStimuli to
// "setupStimuli".

function setupStimuli(PID)
{
   var text    = fs.readFileSync('./Design.csv').toString();           // read design into CSV string
   var design  = CSVtoJSON(text, PID);    
   var debrief_qstns = fs.readFileSync('./Debrief_Qstns.csv').toString();
   var questions = CSVtoJSON(debrief_qstns, PID);                // CSVtoJSON returns stimuli as JSON object
   var stimuli = assignContents(design);   // assign contents to the different problems in the design
   stimuli = np.randomize(stimuli); // randomize stimuli
   var stimNum = stimuli.length;
   var stims = stimuli.filter(function(stim) { if(stim["Cond"] != "AC") return stim; }); // filter out stimuli
   var ACs = stimuli.filter(function(stim) { if(stim["Cond"] == "AC") return stim; }); // filter out ACs
   var firstStimPosition = Math.floor(stimNum/3);
   var sceondStimPosition = (Math.floor(stimNum/3)*2);
   stims.splice(firstStimPosition, 0, ACs[0]);             // splice in first AC to be roughly 1/3 through
   stims.splice(sceondStimPosition, 0, ACs[1]);            // splice in second AC to be roughly 2/3 through
   // Add debrief questions to end of stimuli set
   for (i=0; i<questions.length; i++) {
      stims.push(questions[i]);
   }
   return stims;
}

function CSVtoJSON(text, PID)               // This fn imports any CSV "Design" file as a JSON object
{                                                             // and adds some columns for R analyses
   var results       = [];
   var lines         = text.split(/\r\n|\r|\n/g);
   var header        = true;
   var headerColumns = ["ParticipantID", "ClockTime", "TrialHeader"];
   var trialColumn   = ["P" + PID, new Date().toISOString(), "Trial"];

   lines.forEach(function(line) {
      if(header)
      {
         headerColumns = headerColumns.concat(line.split(','));
         header = false;
      }
	  else if(line == '') {  }
      else
      {
         var columnInfo = trialColumn.concat(line.split(','));
         var newStimulus = {};
         for(var i = 0; i < headerColumns.length; i++)
            newStimulus[headerColumns[i]] = columnInfo[i];
         results.push(newStimulus);
      }
   });
   return results;
}

function assignContents(design)            // This assigns contents to schematic versions of problems
{
	var individualsX = np.randomize(["Ash", "Casey", "Devon", "Frankie", "Riley", "Jessie", "Dakota", "Krishna", "Taylor", "Jamile", "Jaime", "Aiden", "Sammy", "Demetrice", "Alex", "Harley", "Robbie", "Kris", "Emerson", "Sasha"]);
   var propositionsP = np.randomize(["a globe", "a vase", "a map", "a sculpture", "a ball", "a kite", "an arrow", "a hat", "a jug", "a padlock", "a basket", "a bucket", "a broom", "a tube", "a frame", "a toy", "a fan", "a wreath", "a jar", "a tire"]);
   var propositionsQ = np.randomize(["apple", "pineapple", "pear", "banana", "orange", "lemon", "lime", "grapefruit", "kumquat", "raspberry", "strawberry", "kiwi", "peach", "mango", "papaya", "blackberry", "cherry", "grape", "apricot", "watermelon", ]);
   var locationsR = np.randomize(["library", "cafeteria", "coffeeshop", "office", "cafe", "restaurant", "garden", "pub", "stadium", "hallway", "walkway", "foyer", "auditorium", "storageroom", "kitchen", "tunnel", "studyroom", "greenhouse", "laboratory", "entryway"]);
   var locationsS = np.randomize(["plaza", "quad", "atrium", "ballroom", "lounge", "commons", "arena", "dormroom", "courtyard", "infirmary", "restroom", "basement", "museum", "theater", "workshop", "store", "dining hall", "closet", "field", "gym"]);
   for(i = 0; i < design.length; i++)
   {
		var X = individualsX.pop();
      var P = propositionsP.pop();
		var Q = propositionsQ.pop();
      var R = locationsR.pop();
      var S = locationsS.pop();
      var cond = design[i]["Conditional"];
      cond = cond.replace("X", X);
      cond = cond.replace("P", P + " is in the *RM*");
      cond = cond.replace("Q", "the password is " + Q);
		var cat = design[i]["Categorical"];
		cat = cat.replace("X", X);
      cat = cat.replace("P", P + " is in the *RM*");
      cat = cat.replace("not Q", "the password is not " + Q);
      var ev = design[i]["EvidenceAccess"];
      if (ev == "Evidence") {
          cond = cond.replace("*RM*", R);
          cat = cat.replace("*RM*", R);
          design[i]["EvidenceContent"] = R;
       }
       else {
          cond = cond.replace("*RM*", S);
          cat = cat.replace("*RM*", S);
          design[i]["EvidenceContent"] = S;
       }
      design[i]["IndividX"] = X;
      design[i]["PropP"] = P;
      design[i]["PropQ"] = Q;
      design[i]["LocR"] = R;
      design[i]["LocS"] = S;
      design[i]["Premise1Content"] = cond;
      design[i]["Premise2Content"] = cat;
   }
   return design;
}

// --------------------------------------------------------------------------------------------------
// 3. Launch experiment
// --------------------------------------------------------------------------------------------------

np.loadStimuli = setupStimuli;
//module.exports = np;
np.launchStudy();
