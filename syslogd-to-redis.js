//syslog to redis queue for my home network equipment.


var port = 514;
var host = '192.168.0.50';
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var redis = require('redis');
var client = redis.createClient();
var redisqueue = "homeevents";
var ts = Math.round((new Date()).getTime() / 1000);
var sourcelookup = 
{ 
	"192.168.0.3": 
		{	
			"devicetype": "wirelessAP", 
			"manufacturer": "cisco",
			"id": "1",
			"name": "living room AP"
		}, 
	"192.168.0.2":
		{	
			"devicetype": "switch",
			"manufacturer": "cisco",
			"id": 1,
			"name": "living room switch"
		},
	"192.168.0.5":
		{
			"devicetype": "switch",
			"manufacturer":"cisco",
			"id": 2,
			"name": "garage switch"
		}
};


function addslashes (str) {
  // by http://kevin.vanzonneveld.net
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

server.on('listening', function () {
    var address = server.address();
    console.log('rsyslogd server listening on ' + host + ":" + port);
});

server.on('message', function (message, remote) {
    var jsondsyslog = "{\"timestamp\": " + ts + ", \"source\": \"" + remote.address + "\", \"devicetype\": \"" +  sourcelookup[remote.address].devicetype + "\", \"payload\": { \"id\": \"" + sourcelookup[remote.address].id + "\", \"name\" : \"" + sourcelookup[remote.address].name + "\", \"data\" : \"" + addslashes(message) + "\"}}";
    client.publish(redisqueue, jsondsyslog);
});

server.bind(port,host);