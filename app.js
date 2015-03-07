var express = require('express');
var app = express();
var path = require('path'); // User for Static Pages
var bodyParser = require('body-parser')


var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var CollectionDriver = require('./collectionDriver').CollectionDriver;
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
var jsonParser = bodyParser.json()

// parse application/x-www-form-urlencoded 
 var urlencodedParser = bodyParser.urlencoded({ extended: false })

// var mongoHost = 'localHost'; //A
var mongoHost = '192.168.100.112'; //A
var mongoPort = 27017;


var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function (err, mongoClient) { //C
    if (!mongoClient) {
        console.error("Error! Exiting... Must start MongoDB first");
        process.exit(1); //D
    }
    var db = mongoClient.db("FCDB_LOG");  //E
    collectionDriver = new CollectionDriver(db); //F
});

app.get('/:collection', function (req, res) { //A
    var params = req.params; //B
    collectionDriver.findAll(req.params.collection, function (error, objs) { //C
        if (error) { res.send(400, error); } //D
        else {
            if (req.accepts('html')) { //E
                res.render('data', { objects: objs, collection: req.params.collection }); //F
            } else {
                res.set('Content-Type', 'application/json'); //G
                res.send(200, objs); //H
            }
        }
    });
});



app.get('/:collection/:entity', function (req, res) { //I
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
        collectionDriver.get(collection, entity, function (error, objs) { //J
            if (error) { res.send(400, error); }
            else { res.send(200, objs); } //K
        });
    } else {
        res.send(400, { error: 'bad url', url: req.url });
    }
});

app.post('/:SaveErrorLog', jsonParser, function (req, res) { //A
   
    var object = req.body;
    var collection = object.cName
    //var collection = req.params.collection;
    console.log(collection);
    collectionDriver.save(collection, object, function (err, docs) {
        if (err) { res.send(400, err); }
        else { res.send(201, docs); } //B
    });
});



app.put('/:collection/:entity', function (req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
        collectionDriver.update(collection, req.body, entity, function (error, objs) { //B
            if (error) { res.send(400, error); }
            else { res.send(200, objs); } //C
        });
    } else {
        var error = { "message": "Cannot PUT a whole collection" };
        res.send(400, error);
    }
});

app.delete('/:collection/:entity', function (req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
        collectionDriver.delete(collection, entity, function (error, objs) { //B
            if (error) { res.send(400, error); }
            else { res.send(200, objs); } //C 200 b/c includes the original doc
        });
    } else {
        var error = { "message": "Cannot DELETE a whole collection" };
        res.send(400, error);
    }
});


app.get('/', function (req, res) {
  //  res.send('Default Page')
    res.render('search',null ); //F
});

app.post('/',urlencodedParser, function (req, res) {
   /*   var params = req; //B
        for (var item in req) {
          console.log(item);
          console.log(item.params);
        }
       */
       //console.log(req.res);
     //   console.log(req.body);
     var serviceName =  req.body.ServiceName;
     var fromDate =  req.body.FromDate;
     var toDate =  req.body.ToDate;

      
      collectionDriver.getRecords(serviceName,fromDate,toDate, function (error, objs) { //C
        if (error) { res.send(400, error); } //D
        else {
            if (req.accepts('html')) { //E
              if(objs != undefined)                
                res.render('search', { objects: objs, collection: serviceName, FromDate: fromDate, ToDate:toDate}); //F
                else
                res.render('search',null );
            } else {
                res.set('Content-Type', 'application/json'); //G
                res.send(200, objs); //H
            }
        }
    });


    //res.render('search',null ); //F
});


//// Try Routing
//app.get('/:a?/:b?/:c?', function (req, res) {
//    res.send(req.params.a + ' ' + req.params.b + ' ' + req.params.c);
//});


app.use(function (req, res) {
    res.render('404', { url: req.url });
});
var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)

})
