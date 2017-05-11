var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var pg = require('pg');
var bodyParser = require('body-parser');
var connectionString = "postgres://mirandange:300323076@depot:5432/mirandange_jdbc";
var client = new pg.Client(connectionString);
client.connect();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

app.get('/test_database', function (request, response) {
    // SQL Query > Select Data
    var query = client.query("SELECT * FROM todo");
    var results = []
    //Stream results back one row at a time
    query.on('row', function (row) {
        results.push(row);
    });

    //After all data is returned, close connection and return results
    query.on('end', function () {
        response.json(results);
    });

    //Error console check.
    query.on('error', function (err) {
        console.log(err);
    });
});

app.post('/new_task', function (request, response) {
    var taskName = request.body.task;
    var queryString = "insert into todo (item,done) values ('" + taskName + "',false)";
    var query = client.query(queryString);
    query.on('end', function () {
        //pass in response into getID because it is a call back function
        getID(response);
    })
    query.on('error', function (err) {
        console.log(err);
    });
});

app.put('/done', function (request, response) {
    var taskNumber = request.body.taskNum;
    var queryString = "update todo set done = 'true' where id = '" + taskNumber + "'";
    var query = client.query(queryString);
    query.on('end', function () {
        response.sendStatus(200);
    })
    query.on('error', function (err) {
        console.log(err);
    });
});

app.put('/edit_task', function (request, response) {
    var taskName = request.body.editedTasks;
    var taskID = request.body.taskId;
    var queryString = "update todo set item = '" + taskName + "' where id = '" + taskID + "'";
    var query = client.query(queryString);
    query.on('end', function () {
        response.sendStatus(200);
    })
    query.on('error', function (err) {
        console.log(err);
    });
});

app.delete('/delete_task', function (request, response) {
    var idNumber = request.body.id;
    var queryString = "delete from todo where id = '" + idNumber + "'";
    var query = client.query(queryString);
    query.on('end', function () {
        response.sendStatus(200);
    })
    query.on('error', function (err) {
        console.log(err);
    });
});

app.get('/get_task', function (request, response) {
    var query = client.query("SELECT * FROM todo");
    var results = []
    query.on('row', function (row) {
        results.push(row);
    });

    query.on('end', function () {
        response.json(results);
    });

    query.on('error', function (err) {
        console.log(err);
    });
});

app.put('/todo_task_update_false', function (request, response) {
    var taskNum = request.body.taskIdFalse;
    var queryString = "update todo set done = 'false' where id = '" + taskNum + "'";
    var query = client.query(queryString);
    query.on('end', function () {
        response.sendStatus(200);
    })
    query.on('error', function (err) {
        console.log(err);
    });
});

app.put('/todo_task_update_true', function (request, response) {
    var taskNumber = request.body.taskIdTrue;
    var queryString = "update todo set done = 'true' where id = '" + taskNumber + "'";
    var query = client.query(queryString);
    query.on('end', function () {
        response.sendStatus(200);
    })
    query.on('error', function (err) {
        console.log(err);
    });
});

function getID(response) {
    var queryString = "SELECT last_value FROM todo_id_seq;";
    var query = client.query(queryString);

    query.on('row', function (row) {
        response.send(row.last_value);
    });
}