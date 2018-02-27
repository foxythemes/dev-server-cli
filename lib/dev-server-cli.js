#!/usr/bin/env node

"use strict";

var express = require('express')
  , pug = require('pug')
  , fs = require('fs')
  , pugRe = /\.pug$/;

// Include extrernal libs
const commandLineArgs = require( 'command-line-args' );

// Declare CLI options
const optionDefinitions = [
  { name: 'config-file', alias: 'c', type: String },
  { name: 'views-path', alias: 'v', type: String },
  { name: 'assets-path', alias: 'a', type: String },
  { name: 'js-path', alias: 'j', type: String },
  { name: 'port', alias: 'p', type: String }
];

// CLI arguments lib
const options = commandLineArgs( optionDefinitions, { partial: true, camelCase: true } );

var server_pages = __dirname + '../server-pages';
var conf_file_path = options.configFile;
var pug_views_path = options.viewsPath;
var assets_path = options.assetsPath;
var js_path = options.jsPath;
var port = options.port;

//HTML Escape Function
pug.filters.escape = require( '../pug-filters/pug-escape.js' );
pug.filters.php = require( '../pug-filters/pug-php.js' );

var app = express();
app.use( express.static( assets_path ) );//HTML assets folder
app.use( express.static( js_path ) );//Js local folder
app.use("/server", express.static( server_pages + '/assets') );//pug Server Error Pages

app.get('/*', function(req, res){

  if ( req.url.match(pugRe) ) {
    
    fs.exists( pug_views_path + req.url, function(exists) {

      if (exists) {//If file exists then serve it  

        var data;
        var conf_file_exists = fs.existsSync( conf_file_path );

        if( conf_file_exists ){
          try{
            data = JSON.parse( fs.readFileSync( conf_file_path , 'utf8') );
          } catch (e) {
            console.log('Error de formato en el archivo de configuración: "' + conf_file_path + '"' );
            data = {};
          }
        }else{
          data = {};
        }

        try{// If everthing is ok, then render pug files

          res.send( pug.renderFile( pug_views_path + req.url, {
            pretty: true,
            conf: data,
            basedir: pug_views_path,
            filename: pug_views_path + req.url.replace(pugRe, '')
          }));

        } catch ( error ) {//If not, render the pug error page

          var msg = error.toString();
          msg =  msg.replace(new RegExp('>','g'), '&gt;');
          msg =  msg.replace(new RegExp('\n','g'), '<br>');
          res.send( pug.renderFile( server_pages + '/pug-lang-error.pug', {
            pretty: true,
            basedir: server_pages,
            msg: msg 
          }));

        }
      } else {
        res.status(404).send('<h1>404 - File Not Found</h1>');
      }
      
    });
  } else {
    res.status(404).send('<h1>404 - File Not Found</h1>');
  }

});

app.listen(port);

console.log('Starting web server on: http://localhost:' + port + '/index.pug');

module.exports = app;