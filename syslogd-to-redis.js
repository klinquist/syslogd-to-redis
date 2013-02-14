var port = 514;
var host = '192.168.0.50';
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var redis = require('redis');
var client = redis.createClient();
var redisqueue = "homeevents";

function addslashes (str) {
  // by http://kevin.vanzonneveld.net
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

server.on('listening', function () {
    var address = server.address();
    console.log('rsyslogd server listening on ' + host + ":" + port);
});

server.on('message', function (message, remote) {
    var jsondsyslog = "{\"source\": \"" + remote.address + "\", \"message\": \"" + message + "\"}";
    client.publish(redisqueue, addslashes(jsondsyslog));
});

server.bind(port,host);