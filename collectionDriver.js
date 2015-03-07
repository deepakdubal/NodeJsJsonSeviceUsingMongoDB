var ObjectID = require('mongodb').ObjectID;

CollectionDriver = function (db) {
    this.db = db;
};

CollectionDriver.prototype.getCollection = function (collectionName, callback) {
       //    for (var item in this.db) {
        //       console.log(item);
         //    } 

    this.db.collection(collectionName, function (error, the_collection) {
        if (error) callback(error);
        else callback(null, the_collection);
    });
};

CollectionDriver.prototype.getRecords = function (collectionName,FromDate,ToDate, callback) {
 var  query = {createdDate : {$gte:new Date(FromDate),$lt:new Date(ToDate)}}

   // query =   { '_id': ObjectID('54e58b7ab3f45ee42619fbb7') } ;

  /*  this.db.collection(collectionName , function (error, the_collection) {
        if (error) callback(error);
        else callback(null, the_collection.find().toArray());
    });*/

        this.getCollection(collectionName, function (error, the_collection) { //A
        if (error) callback(error);
        else {
           /*  for (var item in the_collection) {
               console.log(item);
             }  */
            the_collection.find(query).sort({createdDate: -1}).toArray(function (error, results) { //B
                if (error) callback(error);
                else callback(null, results);
            });
        }
    });
};





CollectionDriver.prototype.findAll = function (collectionName, callback) {
    this.getCollection(collectionName, function (error, the_collection) { //A
        if (error) callback(error);
        else {
            the_collection.find().toArray(function (error, results) { //B
                if (error) callback(error);
                else callback(null, results);
            });
        }
    });
};

CollectionDriver.prototype.get = function (collectionName, id, callback) { //A
    this.getCollection(collectionName, function (error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({ error: "invalid id" });
            else the_collection.findOne({ '_id': ObjectID(id) }, function (error, doc) { //C
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};


//save new object
CollectionDriver.prototype.save = function (collectionName, obj, callback) {
   this.getCollection(collectionName, function (error, the_collection) { //A
        if (error) callback(error)
        else {
            obj.createdDate = new Date(); //B
            the_collection.insert(obj, function () { //C
                callback(null, obj);
            });
        }
    });
};

//update a specific object
CollectionDriver.prototype.update = function (collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function (error, the_collection) {
        if (error) callback(error);
        else {
            obj._id = ObjectID(entityId); //A convert to a real obj id
            obj.updated_at = new Date(); //B
            the_collection.save(obj, function (error, doc) { //C
                if (error) callback(error);
                else callback(null, obj);
            });
        }
    });
};

//delete a specific object
CollectionDriver.prototype.delete = function (collectionName, entityId, callback) {
    this.getCollection(collectionName, function (error, the_collection) { //A
        if (error) callback(error);
        else {
            the_collection.remove({ '_id': ObjectID(entityId) }, function (error, doc) { //B
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};


exports.CollectionDriver = CollectionDriver;


