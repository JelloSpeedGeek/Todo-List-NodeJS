$(document).ready(function (e) {

    loadTasks();

    $('#add-todo').button({
        icons: {
            primary: "ui-icon-circle-plus"
        }

    }).click(
        function () {
            $('#new-todo').dialog('open');
        });

    $('#new-todo').dialog({
        modal: true, autoOpen: false,
        buttons: {
            "Add task": function () {
                var taskName = $('#task').val();
                if (taskName === '') {
                    return false;
                }
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:8080/new_task',
                    data: JSON.stringify({
                        task: taskName
                    }),
                    contentType: "application/json",
                    success: function (id) {
                        var taskHTML = '<li><span class="done">%</span>';
                        taskHTML += '<span class="delete">x</span>';
                        taskHTML += '<span class="edit">+</span>';
                        taskHTML += '<span class="task" id = '+ id +'></span></li>';
                        var $newTask = $(taskHTML);
                        $newTask.find('.task').text(taskName);
                        $newTask.hide();
                        $('#task').val("");
                        $('#todo-list').prepend($newTask);
                        $newTask.show('clip',250).effect('highlight',1000);
                        $('#new-todo').dialog('close');
                    }
                })
            },
            "Cancel": function () {
                $(this).dialog('close');
            }
        }
    });

    var doneTaskID;
    $('#todo-list').on('click', '.done', function() {
        var $taskItem = $(this).parent('li');
        var doneTaskID = $(this).siblings('.task').attr('id');
        $.ajax({
            type: 'PUT',
            url: 'http://localhost:8080/done',
            data: JSON.stringify({
                //task: $taskItem
                taskNum: doneTaskID
            }),
            contentType: "application/json",
            success: function () {
                $taskItem.slideUp(250, function() {
                    var $this = $(this);
                    $this.detach();
                    $('#completed-list').prepend($this);
                    $this.slideDown();
                });
            }
        })
    });

    $('.sortlist').sortable({
        connectWith : '.sortlist',
        cursor : 'pointer',
        placeholder : 'ui-state-highlight',
        cancel : '.delete,.done',
        stop : function(){
            updateTodoListFalse();
            updateTodoListTrue();
        }
    });

    $('.sortlist').on('click','.delete',function() {
        console.log(this);
        $('#delete-task')
            .data({'task': this})
            .dialog('open');
    });

    $('#delete-task').dialog({
        modal: true, autoOpen: false,
        buttons: {
            "Confirm": function () {
                var taskDel = $(this).data('task');
                var sibling = $(taskDel).siblings('.task').attr('id');
                $.ajax({
                    type: 'DELETE',
                    url: 'http://localhost:8080/delete_task',
                    data: JSON.stringify({
                        id: sibling
                    }),
                    contentType: "application/json",
                    success: function () {
                        $(taskDel).parent('li').effect('puff', function() { $(taskDel).remove(); });
                        $('#delete-task').dialog('close');
                    }
                })
            },
            "Cancel": function () {
                $(this).dialog('close');
            }
        }
    });

    var taskID;
    $('#todo-list').on('click','.edit',function() {
        //.task means: contains class called task ""
        var taskName = $(this).siblings('.task');
        taskID = $(this).siblings('.task').attr('id');
        $('#editTaskName').val(taskName.text());
        $('#edit-task').data('taskName',taskName).dialog('open');
    });

    $('#edit-task').dialog({
        modal: true, autoOpen: false,
        buttons: {
            "Confirm": function () {
                var newTask = ($('#editTaskName').val());
                var task = $(this).data('taskName');
                $.ajax({
                    type: 'PUT',
                    url: 'http://localhost:8080/edit_task',
                    data: JSON.stringify({
                        editedTasks: newTask,
                        taskId: taskID
                    }),
                    contentType: "application/json",
                    success: function () {
                        //sets task to be $('#editTaskName').val()
                        task.text($('#editTaskName').val());
                        $('#edit-task').dialog('close');
                    }
                })
            },
            "Cancel": function () {
                $(this).dialog('close');
            }
        }
    });

    function loadTasks(){
        $.ajax({
            type: 'GET',
            url: 'http://localhost:8080/get_task',
            contentType: "json",
            success: function (data) {
                for (var i = 0; i < data.length; i++){
                    var object = data[i].done;
                    var taskHTML;
                    var taskHTML = '<li><span class="done">%</span>';
                    taskHTML += '<span class="delete">x</span>';
                    taskHTML += '<span class="edit">+</span>';
                    taskHTML += '<span class="task" id = '+ data[i].id +'>'+ data[i].item +'</span></li>';
                    if (object == false){
                        $('#todo-list').prepend(taskHTML);
                    }else if (object == true){
                        $('#completed-list').prepend(taskHTML);
                    }
                }
            }
        })
    }

    function updateTodoListFalse(){
        var todoList = document.getElementById("todo-list");
        var todoTasks = todoList.getElementsByTagName("li");
        for (var i = 0; i < todoTasks.length; ++i) {
            var temp = jQuery('span.task', todoTasks[i]).attr('id');
            $.ajax({
                type: 'PUT',
                url: 'http://localhost:8080/todo_task_update_false',
                data: JSON.stringify({
                    taskIdFalse: temp
                }),
                contentType: "application/json",

            })
        }
    }

    function updateTodoListTrue(){
        var completedList = document.getElementById("completed-list");
        var completedTasks = completedList.getElementsByTagName("li");
        for (var i = 0; i < completedTasks.length; ++i) {
            var tempT = jQuery('span.task', completedTasks[i]).attr('id');
            $.ajax({
                type: 'PUT',
                url: 'http://localhost:8080/todo_task_update_true',
                data: JSON.stringify({
                    taskIdTrue: tempT
                }),
                contentType: "application/json",
            })
        }
    }

}); // end ready