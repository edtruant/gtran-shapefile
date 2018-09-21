var promiseLib = require('./promise.js');
var fs = require('fs');
var writeShp = require('shp-write').write;
var shapefile = require('shapefile');
var Promise, writeFile;

exports.setPromiseLib = setPromiseLib;

exports.toGeoJson = function(fileName, options) {
    if (!Promise) { setPromiseLib(); }
    if(!fs.statSync(fileName)) { reject(new Error('Given shapefile does not exist.')); }

    return shapefile.read(fileName);
};

exports.fromGeoJson = function(geojson, fileName, options) {
    if (!Promise) { setPromiseLib(); }

    var esriWKT;
    if (options) {
        esriWKT = options.esriWKT;
    }

    var fileNameWithoutExt = fileName || 'shapefiles-export';

    if(fileNameWithoutExt.indexOf('.shp') !== -1) {
        fileNameWithoutExt = fileNameWithoutExt.replace('.shp', '');
    }

    var pointGeoms = [];
    var polyLineGeoms = [];
    var polygonGeoms = [];

    var pointProperties = [];
    var polyLineProperties = [];
    var polygonProperties = [];

    geojson.features.forEach(function(feature) {

        for (var key in feature.properties) {
            if (feature.properties.hasOwnProperty(key) && !feature.properties[key]) {
                feature.properties[key] = ' ';
            }
        }
        switch(feature.geometry.type.toUpperCase()) {
            case 'POINT':
            case 'MULTIPOINT':
                pointGeoms.push(feature.geometry.coordinates);
                pointProperties.push(feature.properties);
                break;
            case 'LINESTRING':
            case 'MULTILINESTRING':
                polyLineGeoms.push(feature.geometry.coordinates);
                polyLineProperties.push(feature.properties);
                break;
            case 'POLYGON':
            case 'MULTIPOLYGON':
                polygonGeoms.push(feature.geometry.coordinates);
                polygonProperties.push(feature.properties);
                break;
            default:
                reject(new Error('Given geometry type is not supported'));
        }
    });


  

    var promisePoints = new Promise(function(resolve, reject) {
        try {
            if (pointGeoms.length>0){

                writeShp(pointProperties, 'POINT', pointGeoms, function(err, pointfiles) {
                    if (err) {
                        reject(ex);
                    } else {
                        resolve(pointfiles);
                    }
                });
            }
        } catch(ex) {
            reject(ex);
        }
        
    }); //end of first promise for points


    var promiseLines = new Promise(function(resolve, reject) {
        try {
            if (polyLineGeoms.length>0){

                writeShp(polyLineProperties, 'POLYLINE', polyLineGeoms, function(err, linefiles) {
                    if (err) {
                        reject(ex);
                    } else {
                        resolve(linefiles);
                    }
                });
            }
        } catch(ex) {
            reject(ex);
        }
        
    }); //end of promise for lines


    var promisePolygons = new Promise(function(resolve, reject) {
        try {
            if (polygonGeoms.length>0){

                writeShp(polygonProperties, 'POLYGON', polygonGeoms, function(err, polyfiles) {
                    if (err) {
                        reject(ex);
                    } else {
                        resolve(polyfiles);
                    }
                }).then;
            }

        } catch(ex) {
            reject(ex);
        }
        
    }); //end of promise for lines


    var promiseProjection = new Promise(function(resolve, reject) {
        try {
            if (esriWKT){
                resolve(esriWKT);
            }
        } catch(ex) {
            reject(ex);
        }
        
    }); //end of first promise for points

    
    promisePolygons.then(function(polyfiles) {

        if (!polyfiles) return;

        try{
            var writeTasks = [];

            if (polyfiles){
                writeTasks.push(writeFile(fileNameWithoutExt + '.POLYGON' + '.shp', toBuffer(polyfiles.shp.buffer)));
                writeTasks.push(writeFile(fileNameWithoutExt + '.POLYGON' + '.shx', toBuffer(polyfiles.shx.buffer)));
                writeTasks.push(writeFile(fileNameWithoutExt + '.POLYGON' + '.dbf', toBuffer(polyfiles.dbf.buffer)));
            }            

            // if (esriWKT) {
            //     writeTasks.push(writeFile(fileNameWithoutExt + '.POLYGON' + '.prj', esriWKT));
            // }

            Promise.all(writeTasks)
                .then(function() {
                    return [
                        fileNameWithoutExt + '.POLYGON' + '.shp',
                        fileNameWithoutExt + '.POLYGON' + '.shx',
                        fileNameWithoutExt + '.POLYGON' + '.dbf' //FDM SHOULD ADD .PRJ FILE AS WELL, IN CONDITIONAL FORM
                    ];
                }); 

        }
        catch(ex)
        {
            return reject(ex);
        }         

    });

    promisePoints.then(function(pointfiles) {

        if (!pointfiles) return;

        try{
            // var fileNameWithoutExt = fileName || 'shapefiles-export';

            // if(fileNameWithoutExt.indexOf('.shp') !== -1) {
            //     fileNameWithoutExt = fileNameWithoutExt.replace('.shp', '');
            // }

            var writeTasks = [];
   
            if (pointfiles){
                writeTasks.push(writeFile(fileNameWithoutExt + '.POINT' + '.shp', toBuffer(pointfiles.shp.buffer)));
                writeTasks.push(writeFile(fileNameWithoutExt + '.POINT' + '.shx', toBuffer(pointfiles.shx.buffer)));
                writeTasks.push(writeFile(fileNameWithoutExt + '.POINT' + '.dbf', toBuffer(pointfiles.dbf.buffer)));
            }
     

            // if (esriWKT) {
            //     writeTasks.push(writeFile(fileNameWithoutExt + '.POINT' + '.prj', esriWKT));
            // }           

            Promise.all(writeTasks)
                .then(function () {
                    return [
                        fileNameWithoutExt + '.POINT' + '.shp',
                        fileNameWithoutExt + '.POINT' + '.shx',
                        fileNameWithoutExt + '.POINT' + '.dbf'
                    ];
                }); 


        }
        catch(ex)
        {
            return reject(ex);
        }         

    });

    promiseLines.then(function(linefiles) {

        if (!linefiles) return;

        try{        
            // var fileNameWithoutExt = fileName || 'shapefiles-export';

            // if(fileNameWithoutExt.indexOf('.shp') !== -1) {
            //     fileNameWithoutExt = fileNameWithoutExt.replace('.shp', '');
            // }

            var writeTasks = [];
              

            if (linefiles){
                writeTasks.push(writeFile(fileNameWithoutExt + '.POLYLINE' + '.shp', toBuffer(linefiles.shp.buffer)));
                writeTasks.push(writeFile(fileNameWithoutExt + '.POLYLINE' + '.shx', toBuffer(linefiles.shx.buffer)));
                writeTasks.push(writeFile(fileNameWithoutExt + '.POLYLINE' + '.dbf', toBuffer(linefiles.dbf.buffer)));
            }   

            // if (esriWKT) {
            //     writeTasks.push(writeFile(fileNameWithoutExt + '.POLYLINE' + '.prj', esriWKT));
            // }

            Promise.all(writeTasks)
                .then(function() {
                    return [                    
                        fileNameWithoutExt + '.POLYLINE' + '.shp',
                        fileNameWithoutExt + '.POLYLINE' + '.shx',
                        fileNameWithoutExt + '.POLYLINE' + '.dbf'                      
                    ];
                }); 

        }
        catch(ex)
        {
            return reject(ex);
        }
    });

    promiseProjection.then(function(esriWKT) {

        try{            
            var writeTasks = [];              
            writeTasks.push(writeFile(fileNameWithoutExt + '.prj', esriWKT));

            Promise.all(writeTasks)
                .then(function() {
                    return [                    
                        fileNameWithoutExt + '.prj'                      
                    ];
                }); 

        }
        catch(ex)
        {
            return reject(ex);
        }
    });
};

function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength),
        view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) { buffer[i] = view[i]; }
    return buffer;
}

function setPromiseLib(lib) {
    Promise = promiseLib.set(lib);
    writeFile = promiseLib.promisify(fs.writeFile);
}
