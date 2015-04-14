/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'),
  app = express(),
  watson = require('watson-developer-cloud-alpha'),
  bluemix = require('./config/bluemix'),
  extend = require('util')._extend;

// Bootstrap application settings
require('./config/express')(app);

// if bluemix credentials exists, then override local
var credentials = extend({
  version: 'v1', // API version
  url: 'https://gateway.watsonplatform.net/concept-expansion-beta/api',
  username: 'b16ff7a7-7ad8-4820-a47b-90887747d55b',
  password: '2V6ygJK0SG7B'
}, bluemix.getServiceCreds('concept_expansion')); // VCAP_SERVICES

// Create the service wrapper
var concept_expansion = watson.concept_expansion(credentials);

app.get('/', function(req, res) {
  res.render('index', req.query);
});

app.post('/concept/create', function(req, res) {
  var payload = {
    'seeds': req.body.seeds.trim().split('\r\n'),
    'dataset': req.body.dataset,
    'label': req.body.label,
  };

  concept_expansion.createJob(payload, function(err, result) {
    if (err)
      return res.json({ error: 'Error creating the job'});
    else
      return res.json(result);
  });
});

app.get('/concept/status', function(req, res) {
  concept_expansion.getStatus({ jobid: req.query.jobid }, function(err, result) {
    if (err)
      return res.json({ error: 'Error getting the job status' });
    else
      return res.json({ status: result.state || 'F' });
  });
});

app.post('/concept/result', function(req, res) {
  concept_expansion.getResult({ jobid: req.body.jobid }, function(err, result) {
    if (err)
      return res.json({ error: 'Error getting the job result' });
    else
      return res.json(result);
  });
});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
