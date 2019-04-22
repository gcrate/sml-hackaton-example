/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    SERVICE_URL: "https://mh0igf3cyk.execute-api.us-east-1.amazonaws.com/prod",
    ENABLE_ADD_AFTER_HOUR: 2,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
      if (!localStorage.getItem('uuid')) {
        //show register screen
        $("#register-form").show();
      } else if (!localStorage.getItem('secret')) {
        $("#text-phone").html(window.localStorage.getItem("phone"));
        $("#verify-form").show();
      } else {
        app.loadCount();
      }
    },

    reset: function() {
      localStorage.clear();
      $("#btn-register").show();
      $("#register-form .lds-ring").hide();
      $("#verify-form").hide();
      $("#main-screen").hide();
      $("#register-form").fadeIn();
    },

    register: function() {
      var valid = true;
      var name = $('#input-name').val();
      var phone = '1' + $('#input-phone').val();
      var goal = $('#input-goal').val();

      $('input').removeClass('validation-error');
      if (!name) {
        $('#input-name').addClass('validation-error');
        valid = false;
      }
      if (!phone || !/^\d{11}$/.test(phone)) {
        $('#input-phone').addClass('validation-error');
        valid = false;
      }
      if (!goal) {
        $('#input-goal').addClass('validation-error');
        valid = false;
      }
      if(valid) {
        $("#btn-register").hide();
        $("#register-form .lds-ring").show();
        $.ajax(
              {

            	  url: app.SERVICE_URL + '/register',
            	  type: 'POST',
            	  dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                   "phone": phone,
                   "goal": goal,
                   "name": name
                 }),
            	  success:
                  function(data) {
                    window.localStorage.setItem("phone", phone);
                    window.localStorage.setItem("uuid", data.uuid)
                    $("#register-form").hide();
                    $("#verify-form").fadeIn();
                    $("#text-phone").html(phone);

                  },
            	  error: function(err) {
                  alert( "error: " + JSON.stringify(err) ) ; //For now
                }
              });
        };
    },

    verify: function() {
      var pin = $('#input-pin').val();
      $('input').removeClass('validation-error');
      if(!pin) {
        $('#input-pin').addClass('validation-error');
      } else {
      $.ajax(
            {
              url: app.SERVICE_URL + '/verify',
              type: 'POST',
              dataType: 'json',
              contentType: 'application/json',
              data: JSON.stringify({ "uuid": window.localStorage.getItem("uuid"), "pin": pin }),
              success:
                function(data) {
                  window.localStorage.setItem("secret", data.secret);
                  $("#verify-form").hide();
                  app.loadCount();
                },
              error: function(err) {
                alert( "error: " + JSON.stringify(err) ) ; //For now
              }
          });
      }
    },

    loadCount: function() {
      $.ajax(
            {
              url: app.SERVICE_URL + '/get-count',
              type: 'POST',
              dataType: 'json',
              contentType: 'application/json',
              data: JSON.stringify({
                "uuid": window.localStorage.getItem("uuid"),
                "secret": window.localStorage.getItem("secret")
              }),
              success:
                function(data) {
                  console.log(data);

                  $("#goal").html(data.goal);
                  if(data.friend) {
                    $("#friendNumber").html(data.friend);
                    $("#hasFriendNumber").show();
                  } else {
                    $("#noFriendNumber").show();
                  }
                  app.refreshDisplay(data.count, data.allowReport, false);
                  $("#main-screen").fadeIn();
                },
              error: function(err) {
                alert( "error: " + JSON.stringify(err) ) ; //For now
              }
          });
    },

    refreshDisplay: function (count, allowReport, updateAnimation) {
      if(updateAnimation) {
        $("#count").fadeOut(function() {
            $("#count").html(count);
            $("#count").fadeIn();
        });
      } else {
        $("#count").html(count);
      }
      $("#failedBtn").removeClass("disabled")
      if(new Date().getHours() > app.ENABLE_ADD_AFTER_HOUR) {
        if(allowReport) {
          $("#noAddMsg").hide();
          $("#alreadyAddedMsg").hide();
          $("#successBtn").removeClass("disabled");
        } else {
          $("#noAddMsg").hide();
          $("#alreadyAddedMsg").show();
          $("#successBtn").addClass("disabled");
          if(count > 0) {
            $("#failedBtn").removeClass("disabled")
          } else {
            $("#failedBtn").addClass("disabled")
          }
        }
      } else {
        $("#noAddMsg").show();
        $("#alreadyAddedMsg").hide();
        $("#successBtn").addClass("disabled");

      }
    },

    addCount: function() {
      if(!$("#successBtn").hasClass("disabled")) {
        this.submitAction('success')
      }
    },

    resetCount: function() {
      if(!$("#failedBtn").hasClass("disabled")) {
        this.submitAction('reset')
      }
    },

    submitAction: function(action) {
      $.ajax(
            {
              url: app.SERVICE_URL + '/log-action',
              type: 'POST',
              dataType: 'json',
              contentType: 'application/json',
              data: JSON.stringify({
                "uuid": window.localStorage.getItem("uuid"),
                "secret": window.localStorage.getItem("secret"),
                "action": action
               }),
              success:
                function(data) {
                  app.refreshDisplay(data.count, false, true);
                },
              error: function(err) {
                alert( "error: " + JSON.stringify(err) ) ; //For now
              }
          });
    },

    setFriend: function() {
      var currentNumber = $("#friendNumber").html();
      var newNumber = prompt("Enter friends phone number", currentNumber);
      //TODO: Add validation
      $("#friendNumber").html(newNumber);
      if(newNumber) {
        $("#hasFriendNumber").show();
        $("#noFriendNumber").hide();
      } else {
        $("#hasFriendNumber").hide();
        $("#noFriendNumber").show();
      }
      $.ajax(
          {
            url: app.SERVICE_URL + '/set-friend',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
              "uuid": window.localStorage.getItem("uuid"),
              "secret": window.localStorage.getItem("secret"),
              "friend": newNumber
             }),
            success:
              function(data) {
                
              },
            error: function(err) {
              alert( "error: " + JSON.stringify(err) ) ; //For now
            }
        });
    }

  };
