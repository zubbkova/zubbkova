/* global Main, StatusLight */
/**
 * ---------
 * IPC class
 * ---------
 * @constructor 
 * @param {number} id
 **/
function IPC(id) {
    this._id = id;
    this._numRetries = 0;
    this._tokenPos = 0;
    this._lastTime = new Date().getTime();
    return this;
}
IPC.prototype.run = function() {
    var lastClientProcess = new Date().getTime();
    if (IPC.clients.length > 0) {
        if (this.socketConnect()) {
            this.postConnectClients();
        }
    } else {
        if (lastClientProcess + IPC.CONNECTION_TIMEOUT < new Date().getTime()) {
            this.cleanup();
        }
    }
}
IPC.prototype.cleanup = function(){
    if (this._socket) {
        this._socket.close();
        this._socket = undefined;
    }
    IPC.nextClientId += 100;
    IPC.connected = false;
    IPC.clients = undefined;
    IPC.currentClient = undefined;
    IPC.master = undefined;
} 
IPC.prototype.processClients = function() {
    for (var i = 0; i < IPC.clients.length; i++) {
        var client = IPC.clients[i];
        switch (client._state) {
            case IPC_Client.STATE_START:
                if (!IPC.connected) 
                    break;
                IPC.clientLogin(client);
                break;
            case IPC_Client.STATE_LOGOUT:
                if (client._feed) {
                    IPC.clientLogout(client);
                }                    
                break;
        }
    }
}
/**
 * @param {string} data
 */
IPC.prototype.processInputBuffer = function(data) {
    if (typeof Main.getSession()._root._statusLights != 'undefined') {
        Main.getSession()._root._statusLights.changeStatus(1);
    }
    if (data.length === 0)
        return;
    var newDate = new Date().getTime();
    var b = (newDate - this._lastTime) > 500;
    if (b) {
        this._lastTime = newDate;
        if (IPC.currentClient) {
            if (IPC.currentClient._feed && IPC.currentClient._feed._name === "Chart") {
                if (IPC.currentClient._feed._error !== -1) {
                    Main.getSession()._root._statusLights.changeStatus(StatusLight.SL_NODATA);
                    return;
                }
            }
            IPC.currentClient.flush();
        }    
    }
    
    if (!this._sharp) 
        this._sharp = 0;
    if (data === "#") {
        this._sharp++;
    } else
        this._sharp = 0;
    if (this._sharp > 15)
        console.warn("Feed. Socket not receiving data, listening...");
    
    var c0 = data[0];
    if (c0 === '$') {
        if (IPC.currentClient)
            IPC.currentClient.flush();
        IPC.currentClient = this.getClient(data.substring(1));
        return;
    }
    if (!IPC.currentClient || !IPC.currentClient._feed)
        return;
    if (c0 === '{') {
//        console.log("IPC. received data: " + data);
        this._tokenPos = 1;
        this.handleData(data);
        
        return;
    }
    
    switch (c0) {
        case '+':
            /*
             * possible incoming error codes STREAM_ERR_TIMEOUT 0 STREAM_ERR_WINDOW_LIMIT 1
             * STREAM_ERR_DUPLICATE_PAGE 2 STREAM_ERR_CLIENT_VERSION 3 STREAM_ERR_INVALID_SID 4
             * STREAM_ERR_NOT_AVAILABLE 5 STREAM_ERR_NOT_AUTHENTICATED 6
             *
             * do not die on a 5! all the others should die.
             */
            var error = parseInt(data.substring(1, data.indexOf(":")), 10);
            console.error(error);
            IPC.currentClient._feed.onError(error);
            break;
        case 'i':
            IPC.currentClient.add({'_id': -3});
            break;
        case 'p':
            IPC.currentClient.add({'_id': -2});
            break;
    }
}
/**
 * @param {string} data
 */
IPC.prototype.handleData = function(data) {
    var farray = data.substring(1).split('~');
    if (farray.length < 3) 
        return;
    if (IPC.currentClient)
        IPC.currentClient.add({'_id': parseInt(farray[0], 10), '_contents': farray[1], '_flags': parseInt(farray[2], 10)});
}
/**
 * @param {string} tag
 */
IPC.prototype.getClient = function(tag) {
    for (var i = 0; i < IPC.clients.length; i++) {
        var client = IPC.clients[i];
        if (client._state === IPC_Client.STATE_LOGIN && client._tag === tag) {
            return client;
        }
    }
}
IPC.prototype.socketConnect = function() {
    if (IPC.master && IPC.master._socket && IPC.master._socket.readyState <= 1) {
        IPC.connected = true;
        this._numRetries = 0;
        for (var i = 0; i < IPC.clients.length; i++) {
            var client = IPC.clients[i];
            if (client._state !== IPC_Client.STATE_LOGOUT) {
                client._state = IPC_Client.STATE_START;    
            }
        }
        return true;
    }
    var self = this;
    this._numRetries++;
    if (this._numRetries > IPC.MAX_CONNECTION_RETRIES) {
        // todo: show alert for reconnect
        this._numRetries = 0;
        return false;
    }
    if (!IPC.master)
        return;
    
    IPC.master._socket = new WebSocket(Main.getWebSocketURL());
    console.log("Feed. Socket connecting...");
    IPC.master._socket.onopen = function() {
        console.log("Feed. Socket opened.");
        IPC.ipcTag = new Date().getTime();
        this.send(JSON.stringify({'type': 'stream_request', 'ipc_tag': IPC.ipcTag}));
    }
    IPC.master._socket.onmessage = function(event) {
//        console.log("IPC. Received data: " + event.data);
        if (event.data === 'STREAM') {
            IPC.connected = true;
            self._numRetries = 0;
        } else if (IPC.master) {
            IPC.master.processInputBuffer(event.data);
        }
        if (IPC.master)
            IPC.master.processClients();
    }
    IPC.master._socket.onclose = function(event) {
        if (event.wasClean) {
            console.log("Feed. Socket closed clean.");
        } else {
            var reason;
            if (event.code == 1000)
                reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
            else if(event.code == 1001)
                reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
            else if(event.code == 1002)
                reason = "An endpoint is terminating the connection due to a protocol error";
            else if(event.code == 1003)
                reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
            else if(event.code == 1004)
                reason = "Reserved. The specific meaning might be defined in the future.";
            else if(event.code == 1005)
                reason = "No status code was actually present.";
            else if(event.code == 1006)
               reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            else if(event.code == 1007)
                reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
            else if(event.code == 1008)
                reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
            else if(event.code == 1009)
               reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
            else if(event.code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
            else if(event.code == 1011)
                reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
            else if(event.code == 1015)
                reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
            else
                reason = "Unknown reason";
            console.log("Feed. Socket closed with error:", reason);
            setTimeout(function() {
                console.log("Feed. Socket restart.");
                self.socketConnect();
            }, 3000);
        }
        Main.getSession()._root._statusLights.changeStatus(StatusLight.SL_NODATA);
    }
    return true;
}
IPC.prototype._disconnect = function() {
    if (IPC.master && IPC.master._socket) {
        console.log("Feed. Socket disconnect.", IPC.master._socket.readyState);
        IPC.master._socket.close(1000);
    }
    IPC.connected = false;
    if (IPC.master)
        IPC.master._socket = undefined;
    for (var i = 0; i < IPC.clients.length; i++) {
        var client = IPC.clients[i];
        if (client._state !== IPC_Client.STATE_LOGOUT) {
            client._state = IPC_Client.STATE_START;    
        }
    }
    this.postDisconnectClients();
}
IPC.prototype.postConnectClients = function() {
    if (IPC.connected)
        return;
    for (var i = 0; i < IPC.clients.length; i++) {
        IPC.clients[i]._feed.handleConnect();
    }
}
IPC.prototype.postDisconnectClients = function() {
    if (!IPC.connected)
        return;
    for (var i = 0; i < IPC.clients.length; i++) {
        IPC.clients[i]._feed.handleDisconnect();
    }
}
/** @static */
IPC.MAX_CONNECTION_RETRIES = 4;
/** @static */
IPC.CONNECTION_TIMEOUT = 5000;
/** @static */
IPC.MAX_CLIENTS = 90;
/** @static */
IPC.masterId = 1;
/** @static */
IPC.nextClientId = 1;
/** @static */
IPC.connected = false;
/** @static */
IPC.clients = [];
/**
 * @static
 * @param {Feed} feed
 */
IPC.register = function(feed) {
    if (!IPC.master) {
        IPC.master = new IPC(IPC.masterId++);
    }
//    console.log("clients length", this.clients.length);
    var client;
    for (var i = 0; i < IPC.clients.length; i++) {
        var c = IPC.clients[i];
        if (c._feed && c._feed._name === feed._name) {
            if (c._data === feed._dataBlock && c._state !== IPC_Client.STATE_LOGOUT) {
                client = c;
            } else {
                c._feed.stop(c._data);
            }
        }
    }
    if (!client) {
        // new one
        if (IPC.clients.length === IPC.MAX_CLIENTS) {
            console.warn("Feed. Max clients.")
            return -1;
        }
        client = new IPC_Client(IPC.nextClientId++, feed);
        IPC.clients.push(client);
        console.log("Feed. Register client for " + client._feed._name + ":", client._id, client._feed._dataBlock);
    }
    IPC.master.run();
    return client._id;
}
/**
 * @static
 * @param {string} feed_name
 * @param {string} dataBlock
 */
IPC.unregister = function(feed_name, dataBlock) {
    for (var i = 0; i < IPC.clients.length; i++) {
        var client = IPC.clients[i];
        if (client._feed && client._feed._name === feed_name && client._data === dataBlock) {
            if (client === IPC.currentClient) {
                IPC.currentClient = undefined;
            }
            client._state = IPC_Client.STATE_LOGOUT;
        }
    }
}
/**
 * @static
 * @param {IPC_Client} client
 */
IPC.clientLogin = function(client) {
    client._tag = IPC.ipcTag + "," + client._id;
    var str = JSON.stringify({'type': 'subscribe', 'client_id': client._id, 'user': IPC.userName, 'sid': IPC.sid, 'page_key': Main.getParams()["page_key"], 'app': client._feed._name, 'ipc_tag': IPC.ipcTag, 'request': client._feed._dataBlock});
    IPC.master._socket.send(str);
    client._state = IPC_Client.STATE_LOGIN;
}
/**
 * @static
 * @param {IPC_Client} client
 */
IPC.clientLogout = function(client) {
    if (IPC.currentClient && client._id === IPC.currentClient._id) {
        IPC.currentClient = undefined;
    }
    var str = JSON.stringify({type: 'unsubscribe', client_id: client._id, ipc_tag: IPC.ipcTag});
    if (IPC.master._socket.readyState === 1) {
        IPC.master._socket.send(str);
        console.log("Feed. Unregister client", client._id);
        client._feed = undefined;
        var idx;
        for (idx = 0; idx < IPC.clients.length; idx++) {
            var c = IPC.clients[idx];
            if (c._id === client._id)
                break;
        }
        if (idx < IPC.clients.length)
            IPC.clients.splice(idx, 1);
    }
}
/**
 * ----------
 * IPC_Client
 * ----------
 * @constructor 
 * @param {number} id
 * @param {Feed} feed
 */
function IPC_Client(id, feed) {
    this._id = id;
    this._data = feed._dataBlock;
    this._feed = feed;
    this._feedItems = [];
    this._state = IPC_Client.STATE_START;
}
/**
 * @param {Array} fi
 */
IPC_Client.prototype.add = function(fi) {
    this._feedItems.push(fi);
    if (this._feedItems.length > 5000) {
        console.warn("Feed client not flushing data.", this._feedItems.length);
        this.flush();
    }
}
IPC_Client.prototype.flush = function() {
    this._feed.add(this._feedItems);
    this._feedItems = [];
}
/** @static */
IPC_Client.STATE_START = 0;
/** @static */
IPC_Client.STATE_LOGIN = 1;
/** @static */
IPC_Client.STATE_LOGOUT = 2;