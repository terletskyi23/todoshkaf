// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

// Create event listner only when DOM (html rendered by server) is fully loaded
$(document).ready(function () {
  // Execute anonymous function (function (e)) wnen form with id #new_task is submited.
  $('form#new_task').on('submit', function (e) {
    // Do not reload page on submit (Default browser behaviour)
    e.preventDefault();

    // $(e.target) - is the jquery representation of form that where submited.
    var form   = $(e.target),
        action = form.attr('action'), // Please review these attributes using chrome dev-tools.
        method = form.attr('method'), // Please review these attributes using chrome dev-tools.
        params = form.serializeArray();


    // adding ('.json') is important, because it is an indicator for rails to handle response
    // type with particular data type.
    $('.error').remove();
    $.ajax({
      method: method,
      url: action + '.json',
      data: params
    }).success( function(data) {
      // Clear contents from form input.
      form.find('input[type="text"]').val('');
      // Insert new div into `#tasks` div with contents returned by server.
      $('#tasks').prepend('<div class="task" id="' + data.id + '"><span class="status"><button class="status-button", disabled="disabled">In Progress</button><button class="status-button">Done</button></span><p>' + data.description + '</p><button class="edit-button">Edit</button><button class="destroy-button">Delete</button></div>')
    }).fail( function(data) {
      // data object on failt will be equall to Object
      // {
      //   readyState: 4,
      //   responseText: "{"id":null,"description":"","status":null,"errors"…ank",
      //                 "is too short (minimum is 5 characters)"]}}",
      //   responseJSON: Object, status: 422, statusText: "Unprocessable Entity"
      // }
      // Basically our response is in string format, and we need to translate it into js object
      // To handle this, we can use jQuery.parseJSON() method
      var errors = jQuery.parseJSON(data.responseText).errors

      // Now we ca iterate throught server errors, and outpu 1 by 1
      for (var property in errors) {
        // On each iterateion property will be equeal to json key
        // We can use this key to get data that is maped to it
        var key_errors_array = errors[property]

        // errors[property] - is equeal to array, because 1 filed can have multiple errors returned
        for (var i in key_errors_array) {
          // <for (var something> if iterating though array is equal to array index
          // We can get vallue on index in array, the same as we would get value on key in json
          form.prepend('<p class="error">' + key_errors_array[i] + '</p>')
        }
      }
    });
  });

  $('.filter').on('click', 'button.filter-button', function () {
    var that = this;
    $(that).parent().find('button').removeAttr("disabled");
    $(that).attr('disabled', true);
    if($(that).text() != 'All'){
      $('.done').fadeOut(500);
    } else {
      $('.done').fadeIn(1000);
    };
  });

  $('#tasks').on('click', '.task button.status-button', function () {
    var that = this,
        task = $(that).parent().parent(),
        task_id = task.attr('id');
    $.ajax({
      method: 'get',
      url: 'tasks/change_status/' + task_id + '.json'
    }).success( function(data) {
      $(that).parent().find('button').removeAttr("disabled");
      $(that).attr('disabled', true);
      task.toggleClass("done");
    }).fail( function(data) {
      console.log("Cant't change status for some reason.");
      // Wont handle this for now.
    });
  });

  $('#tasks').on('click', '.task button.destroy-button', function () {
    var that = this,
        task_id = $(that).parent().attr('id');
    $.ajax({
      method: 'delete',
      url: 'tasks/' + task_id + '.json'
    }).success( function() {
      $(that).parent().remove();
    }).fail( function() {
      console.log("Cant't destroy for some reason.");
      // Wont handle this for now.
    });
  });

  $('#tasks').on('click', '.task button.edit-button', function () {
    var editobj = this,
        task_id = $(editobj).parent().attr('id'),
        description = $(editobj).parent().find('p').text().trim();
    $(editobj).parent().addClass('editable');
    $(editobj).parent().find('p').replaceWith( "<form id='ef-"+task_id+"' class='edit-form'><br><input id='task_description' type='text' name='task[description]', value='"+description+"'><button id='edit-btn-ok'>Ok</button><br><br></form>" );

    $('#ef-error'+task_id).remove();

    $(editobj).parent().find('form#ef-'+task_id).on('click', 'button#edit-btn-ok', function (e) {
      e.preventDefault();
      var that = this,
          id = $(that).parent().attr('id').substring(3),
          description = $(that).parent().find('input').val();
          $.ajax({
            method: 'PUT',
            url: 'tasks/' + id + '.json',
            data: {"description": description},
            dataType: "json",
          }).success(function(data){
            $(editobj).parent().find('form#ef-'+id).replaceWith( "<p>"+data.description+"</p>" );
            $(editobj).parent().removeClass('editable');
          }).fail( function(data) {
            var errors = jQuery.parseJSON(data.responseText).errors
            for (var property in errors) {
              var key_errors_array = errors[property]
              for (var i in key_errors_array) {
                $(editobj).parent().find('form#ef-'+id).prepend('<p id="ef-error'+task_id+'" class="edit-error">' + key_errors_array[i] + '</p>')
              }
            }
          });
    });
  });
});
