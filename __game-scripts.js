var m = {};
!(function(e) {
    (Socket = function(e) {
        pc.extend(this, pc.events),
            ((e = e || {}).url = e.url || ""),
            (this._connected = !1),
            (this.socket = new WebSocket(e.url)),
            (this.socket.onopen = this._onopen.bind(this)),
            (this.socket.onclose = this._onclose.bind(this)),
            (this.socket.onerror = this._onerror.bind(this)),
            (this.socket.onmessage = this._onmessage.bind(this));
    }),
        Object.defineProperty(Socket.prototype, "isConnected", {
            get: function() {
                return this._connected;
            },
        }),
        (Socket.ReservedNames = { connect: 1, close: 1, error: 1, message: 1 }),
        (Socket.prototype._onopen = function(e) {
            (this._connected = !0), this.fire("connect", e);
        }),
        (Socket.prototype._onclose = function(e) {
            (this._connected = !1), this.fire("close", e);
        }),
        (Socket.prototype._onerror = function(e) {
            this.fire("error", e);
        }),
        (Socket.prototype._onmessage = function(e) {
            this.fire("message", e), this.fire(e);
        }),
        (Socket.prototype.close = function(e) {
            ((e = e || {}).code = e.code || 1e3),
                (e.reason = e.reason || "unknown"),
                this.socket.close(e.code, arg.reason);
        }),
        (Socket.prototype.closeClientSide = function() {
            this.socket.close();
        }),
        (Socket.prototype.send = function(e) {
            this.socket.send(e);
        }),
        (e.net = e.net || {}),
        (e.net.ws = Socket);
})(m);
var Net = {};
((Net = Net || {}).IncomingNetMessage = function(e) {
    (this.message = CryptoJS.AES.decrypt(e.data, "hyw1L$cO:x[2_J").toString(CryptoJS.enc.Utf8)),
        (this.messageData = []),
        (this.dataOrder = 0);
    var t = this.message.split(";");
    for (i = 0; i < t.length - 1; i++) this.messageData.push(t[i]);
    this.Read = function() {
        return this.dataOrder++, this.messageData[this.dataOrder - 1];
    };
}),
    (Net.OutgoingNetMessage = function() {
        (this.messageData = []),
            (this.builtMessage = ""),
            (this.Write = function(e) {
                this.messageData.push(e);
            }),
            (this.Build = function() {
                for (i = 0; i < this.messageData.length; i++) this.builtMessage += this.messageData[i] + ";";
            }),
            (this.Send = function(e) {
                this.Build(), e.send(CryptoJS.AES.encrypt(this.builtMessage, "hyw1L$cO:x[2_J"));
            });
    });
var LobbyClient = {};

(LobbyClient = LobbyClient || {}).selectLobby = function(lobby) {
    GameClient.tronLobby =
        lobby === "diamond"
            ? "diamond"
            : lobby === "platinum"
            ? "platinum"
            : lobby === "gold"
            ? "gold"
            : lobby === "silver"
            ? "silver"
            : "bronze";

    GameClient.tronRegistrationFee =
        lobby === "diamond"
            ? 10000
            : lobby === "platinum"
            ? 5000
            : lobby === "gold"
            ? 1000
            : lobby === "silver"
            ? 500
            : 100;

    Hud.HideLobbyElements();

    GatewayClient.Socket.emit("requestLobby", {
        lobby: GameClient.tronLobby,
        playerId: window.tronWeb.defaultAddress.base58,
    });
};
var GatewayClient = pc.createScript("gatewayClient");

function Cluster(e, t, n) {
    (this.name = e), (this.address = t), (this.port = 0), (this.playersCount = n), (this.optionHTML = null);
}

(GatewayClient.Socket = null),
    (GatewayClient.receivedRankingResult = !1),
    (GatewayClient.prototype.initialize = function() {
        (GatewayClient.app = this.app),
        (GatewayClient.receivedRankingResult = !1),
        (GameClient.username = "Guest"),
        (this.gatewayAddress = "127.0.0.1"),
        (this.wasConnected = !1),
        (this.joinedRegion = !1);

        var e = this;
        (e.Socket = null), console.log("Gathering current Gateway address..");
        setTimeout(() => {
            e.Connect(e.gatewayAddress);
        }, 750);
    }),
    (GatewayClient.prototype.Connect = function(e) {
        Hud.HideLoginElements(),
            console.log("client initialized with ver.112016"),
            (GatewayClient.Socket = io.connect(
                "http://127.0.0.1:15540/",
                { secure: 0, transports: ["websocket"] }
            )),
            0 === Game.token.length
                ? GatewayClient.Socket.emit("newPlayer")
                : GatewayClient.Socket.emit("initPlayer", {
                      token: Game.token,
                  });
        var t = this;
        (this.authenticated = !1),
            GatewayClient.Socket.on("unknownToken", function() {
                Game.SetCookie("token", "", 365), (Game.token = ""), GatewayClient.Socket.emit("newPlayer");
            }),
            GatewayClient.Socket.on("getToken", function(e) {
                Game.SetCookie("token", e.token, 365),
                    (Game.token = Game.GetCookie("token")),
                    GatewayClient.Socket.emit("initPlayer", {
                        token: Game.token,
                    });
            }),
            GatewayClient.Socket.on("authenticationSuccess", function(e) {
                (Game.elo = e.curElo),
                    (Game.rankPos = e.rnkPos),
                    (this.authenticated = !0),
                    Hud.ShowLoginElements(),
                    (Hud.loginPlayerInfoRank.innerHTML = "#" + Game.rankPos),
                    (Hud.loginPlayerInfoPts.innerHTML =
                        Game.elo +
                        '<br><span style="display:block;font-weight:normal;font-size:12px;margin-top:-7px;">pts</span>'),
                    GatewayClient.Socket.emit("requestRegions");
            }),
            GatewayClient.Socket.on("getRegions", function(e) {
                var t = e.regions;
                for (this.clusters = [], i = 0; i < t.length; i++) {
                    var n = new Cluster(t[i].name, t[i].address, t[i].playersCount);
                    this.clusters.push(n);
                }
                GatewayClient.clusters = this.clusters;
            }),
            GatewayClient.Socket.on("getRegionsUpdate", function(e) {
                if (!0 === this.authenticated) {
                    for (i = 0; i < e.regions.length; i++) {
                        for (j = 0; j < this.clusters.length; j++) {
                            if (this.clusters[j].name === e.regions[i].name) {
                                this.clusters[j].playersCount = e.regions[i].playersCount;

                                break;
                            }
                        }
                    }
                }
            }),
            GatewayClient.Socket.on("getGameId", function(e) {
                if (!0 === this.authenticated) {
                    if (e.gameId) {
                        GameClient.gameId = e.gameId;
                        Hud.playButton.className = "play";
                        Hud.playButton.dataset.gameId = e.gameId;
                    }
                }
            }),
            GatewayClient.Socket.on("joinedRegion", function(e) {
                console.log("Connecting to Region"),
                    t.app.root.getChildren()[0].script.gameClient.Connect(e.address, e.port);
            }),
            GatewayClient.Socket.on("joinedOther", function(e) {
                console.log("Connecting to Region"),
                    t.app.root.getChildren()[0].script.gameClient.Connect(e.address, e.port);
            }),
            GatewayClient.Socket.on("joinedOther", function() {
                console.log("No regions available, this might be for maintenance. Try again in a few moments!");
            }),
            GatewayClient.Socket.on("getPlayersInsideMatches", function(e) {
                Hud.connectedPlayers.innerHTML =
                    "<span style='color:#28E053;background:black;border-radius:2px;padding-left:5px;padding-right:5px;box-shadow:0px 1px 0px #28E053;'>" +
                    e.count +
                    "</span> Players fighting worldwide!";
            }),
            GatewayClient.Socket.on("getRankedMatchResult", function(e) {
                (Game.elo = e.currentPoints),
                    Hud.ShowGameOver(e.won, e.ptDiff, e.diePos, e.totalPlayers, e.rnkPos),
                    (GatewayClient.receivedRankingResult = !0);
            }),
            GatewayClient.Socket.on("getRanking", function(e) {
                Hud.DrawRanking(e.players);
            }),
            GatewayClient.Socket.on("newLobby", function(e) {
                Hud.ShowLobbyElements();
            });
    }),
    (GatewayClient.RequestRegion = function(e, f) {
        GatewayClient.Socket.emit("joinRegion", { regionName: e, lobbyName: f });
    }),
    (GatewayClient.JoinNearestRegion = function() {
        var maxPlayers = -1;
        var clusterIndex = 0;

        for (i = 0; i < GatewayClient.clusters.length; i++) {
            if (GatewayClient.clusters[i].playerCount > maxPlayers) {
                clusterIndex = GatewayClient.clusters[i].playerCount > maxPlayers ? i : clusterIndex;
                maxPlayers =
                    GatewayClient.clusters[i].playerCount > maxPlayers
                        ? GatewayClient.clusters[i].playerCount
                        : maxPlayers;
            }
        }

        const _index = 0;

        GatewayClient.clusters = [GatewayClient.clusters[_index]];

        for (Hud.OnSubmitUsername(), Hud.HideLoginElements(), i = 0; i < GatewayClient.clusters.length; i++) {
            var e = new GatewayClient.PingObject(GatewayClient.clusters[i].address);
            GatewayClient.pings.push(e);
        }

        if (window.Utils.contract && GatewayClient.clusters[_index]) {
            console.log("GameClient.gameId", GameClient.gameId);

            window.Utils.contract
                .then((contract) => {
                    contract
                        .register(GameClient.gameId)
                        .send({ feeLimit: 1500, callValue: GameClient.tronRegistrationFee * 1000000 })
                        .then((response) => {
                            console.log("SC", response);

                            setTimeout(() => {
                                window.Utils.tronWeb.trx
                                    .getTransaction(response)
                                    .then((response) => {
                                        console.log("TXN", response);

                                        if (response.ret) {
                                            var errors = 0;

                                            response.ret.forEach((retvalue, index) => {
                                                if (retvalue.contractRet == "REVERT") {
                                                    errors++;
                                                }
                                            });

                                            if (!errors) {
                                                GameClient.TryConnection(GatewayClient.pings[0].address);
                                            } else {
                                                console.log("ERR");
                                                Hud.ShowLobbyElements();
                                            }
                                        } else {
                                            Hud.ShowLobbyElements();
                                            console.log("NO RET");
                                        }
                                    })
                                    .catch((err) => {
                                        Hud.ShowLobbyElements();
                                        console.log(err);
                                    });
                            }, 3500);

                            return true;
                        })
                        .catch((err) => {
                            Hud.ShowLobbyElements();
                            console.log(err);
                        });
                })
                .catch((err) => {
                    Hud.ShowLobbyElements();
                    console.log(err);
                });
        } else {
            Hud.ShowLobbyElements();
            console.log("No contract.");
        }
    }),
    (GatewayClient.PingObject = function(e) {
        (this.address = e), (this.ping = 0);
    }),
    (GatewayClient.pings = []),
    (GatewayClient.donePings = 0),
    (GatewayClient.ReceivePingForAddress = function(e, t) {
        for (i = 0; i < GatewayClient.pings.length; i++) {
            if (GatewayClient.pings[i].address === e) {
                GatewayClient.pings[i].ping = t;
                GatewayClient.donePings++;
                break;
            }
        }

        console.log(
            "GatewayClient.pings",
            GatewayClient.pings,
            GatewayClient.donePings === GatewayClient.clusters.length
        );

        GatewayClient.donePings === GatewayClient.clusters.length &&
            (GatewayClient.pings.sort(function(e, t) {
                return e.ping - t.ping;
            }),
            Game.client.Connect(GatewayClient.pings[0].address));
    }),
    (GatewayClient.prototype.onMessage = function(e) {
        var t = new Net.IncomingNetMessage(e);
        switch (t.Read()) {
            case "GET_REGION":
                // console.log("Connecting to Region: " + t.Read()),
                this.app.root.getChildren()[0].script.gameClient.Connect(t.Read(), t.Read());
                break;
            case "GET_REGION_REASSIGNED":
                // console.log("The requested region is not available. You have been reassigned to region: " + t.Read()),
                (Hud.connectionStatus.innerHTML = "Region not available, joining a random region."),
                    this.app.root.getChildren()[0].script.gameClient.Connect(t.Read(), t.Read());
                break;
            case "NOT_AVAILABLE":
                // console.log("No regions available.. this might be for maintenance. Try again in a few moments."),
                (Hud.connectionStatus.innerHTML = "No regions available"),
                    Hud.SetLoginConnectionInfo(
                        "No regions available, this might be for maintenance. Try again in a few moments!",
                        "white"
                    );
                break;
            case "GET_SERVERSINFO":
                var n = t.Read(),
                    a = parseInt(t.Read());
                for (i = 0; i < a; i++) {
                    var o = t.Read(),
                        s = t.Read();
                    switch (o) {
                        case "US":
                            Hud.optionUS.text = "US (" + s + " players)";
                            break;
                        case "Europe":
                            Hud.optionEU.text = "Europe (" + s + " players)";
                    }
                }
                Hud.connectedPlayers.innerHTML = n + " Players fighting worldwide!";
                break;
            default:
                console.log("Received unhandled packet header.");
        }
    }),
    (GatewayClient.prototype.onError = function(e) {
        console.log(e.data);
    }),
    (GatewayClient.prototype.onClose = function(e) {
        console.log("Lost connection to the Gateway.");
    }),
    (GatewayClient.prototype.onCheckConnection = function() {}),
    (GatewayClient.prototype.update = function(e) {}),
    (GatewayClient.prototype.swap = function(e) {});

var GameClient = pc.createScript("gameClient");
(GameClient.Socket = null),
    (GameClient.IngameSocket = null),
    (GameClient.tronLobby = "bronze"),
    (GameClient.tronRegistrationFee = 100),
    (GameClient.username = "Guest"),
    (GameClient.joinedServerName = null),
    (GameClient.DiePosition = 0),
    (GameClient.LastTotalPlayers = 0),
    (GameClient.MyPlayer = null),
    (GameClient.prototype.initialize = function() {
        console.log("init"), (Game.client = this);
    }),
    (GameClient.TryConnection = function(e) {
        var a = io.connect(
                "http://" + e + ":15540/",
                { secure: 0 }
            ),
            t = Date.now();
        console.log(e + " ping start time " + t),
            GatewayClient.Socket.emit("latency"),
            GatewayClient.Socket.on("latency", function() {
                var a = Date.now() - t;

                console.log(e + " ping result: " + a);

                GatewayClient.pings.sort(function(e, t) {
                    return e.ping - t.ping;
                });

                GatewayClient.pings = [GatewayClient.pings[0]];
                GatewayClient.donePings = 0;

                GatewayClient.ReceivePingForAddress(e, a);
            });
    }),
    (GameClient.prototype.Connect = function(e) {
        var a = this;
        (this.ClusterAddress = e),
            (GameClient.ClusterAddress = this.ClusterAddress),
            console.log("Joining " + e),
            (GameClient.socket = null),
            (this.Socket = GatewayClient.Socket
                ? GatewayClient.Socket
                : io.connect(
                      "http://" + e + ":15540/",
                      { secure: 0 }
                  )),
            this.Socket.on("getGameServer", function(e) {
                (GameClient.SpawnedMyPlayer = !1),
                    (a.alreadyReceivedEndState = !1),
                    (a.isConnected = !1),
                    a.Socket.emit("joinServer", {
                        id: e.serverName,
                        name: GameClient.tronLobby,
                        playerId: window.tronWeb.defaultAddress.base58,
                    }),
                    (GameClient.joinedServerName = e.serverName);
            }),
            this.Socket.emit("handshake"),
            this.Socket.on("connect_failed", function() {
                console.log("Failed " + e);
            }),
            this.Socket.on("disconnect", function() {
                console.log("Disconnect " + e);
            }),
            (GameClient.Socket = this.Socket),
            (Hud.logo.style.display = "none"),
            Hud.HideLoginElements(),
            Hud.SetMatchInfo("Joining"),
            (GatewayClient.joinedRegion = !0),
            this.Socket.on("inQueue", function() {
                console.log("In queue, server initializing."), (this.isConnected = !0);
            }),
            this.Socket.on("getBlocks", function(e) {
                for (i = 0; i < e.blocks.length; i++) {
                    var a = new Game.Block(
                        e.blocks[i].id,
                        e.blocks[i].kind,
                        e.blocks[i].x,
                        e.blocks[i].z,
                        e.blocks[i].itemToGive
                    );
                    Game.blocks.push(a);
                }
                Game.SpawnBlocks();
            }),
            this.Socket.on("getOldPlayers", function(e) {
                for (i = 0; i < e.oldPlayers.length; i++) {
                    var t = e.oldPlayers[i].id,
                        n = e.oldPlayers[i].name,
                        o = e.oldPlayers[i].x,
                        l = e.oldPlayers[i].z,
                        s = new Game.Player(t, n, o, l);
                    Game.players.push(s);
                    var r = Game.playerController.clone();
                    (r.enabled = !0),
                        r.rigidbody.teleport(s.x, 1, s.z),
                        a.app.root.addChild(r),
                        (s.entity = r),
                        r.script.movement.Init(s),
                        Hud.GenerateNameplate(s);
                }
            }),
            this.Socket.on("getId", function(e) {
                (a.isConnected = !0),
                    (GameClient.identification = e.id),
                    a.Socket.emit("finishPlayerInit", {
                        id: GameClient.identification,
                        playerName: GameClient.username,
                        serverName: GameClient.joinedServerName,
                    });
            }),
            this.Socket.on("spawnPlayer", function(e) {
                var t = new Game.Player(e.newPlayer.id, e.newPlayer.name, e.newPlayer.x, e.newPlayer.z);
                Game.players.push(t);
                var n = Game.playerController.clone();
                (n.enabled = !0),
                    n.rigidbody.teleport(t.x, 0.5, t.z),
                    a.app.root.addChild(n),
                    (t.entity = n),
                    t.id === GameClient.identification &&
                        ((GameClient.SpawnedMyPlayer = !0),
                        (t.isMine = !0),
                        (GameClient.SocketReady = !0),
                        (GameClient.MyPlayer = t)),
                    n.script.movement.Init(t),
                    Hud.GenerateNameplate(t);
            }),
            this.Socket.on("playerUpdate", function(e) {
                var a = e.player.id,
                    t = e.player.name,
                    n = e.player.x,
                    o = e.player.z,
                    l = e.player.angleY,
                    s = e.player.velocity,
                    r = e.player.availableBombs,
                    c = e.player.currentBombLength,
                    m = e.player.movement_speed,
                    d = null;
                for (i = 0; i < Game.players.length; i++)
                    if (Game.players[i].id === a) {
                        d = Game.players[i];
                        break;
                    }
                d &&
                    !0 === d.initialized &&
                    ((d.username = t),
                    (d.x = n),
                    (d.z = o),
                    (d.angleY = l),
                    (d.velocity = s),
                    (d.availableBombs = r),
                    (d.currentBombLength = c),
                    (d.movement_speed = m),
                    d.entity.script.movement.GetUpdate());
            }),
            this.Socket.on("playersUpdate", function(e) {
                for (i = 0; i < e.players.length; i++)
                    for (j = 0; j < Game.players.length; j++)
                        Game.players[j].id === e.players[i].id &&
                            ((Game.players[j].username = e.players[i].name),
                            (Game.players[j].x = e.players[i].x),
                            (Game.players[j].z = e.players[i].z),
                            (Game.players[j].angleY = e.players[i].angleY),
                            (Game.players[j].velocity = e.players[i].velocity),
                            (Game.players[j].availableBombs = e.players[i].availableBombs),
                            (Game.players[j].currentBombLength = e.players[i].currentBombLength),
                            (Game.players[j].movement_speed = e.players[i].movement_speed),
                            Game.players[j].entity.script.movement.GetUpdate());
            }),
            this.Socket.on("playerLeave", function(e) {
                var a = e.id,
                    t = null;
                for (i = 0; i < Game.players.length; i++)
                    if (Game.players[i].id === a) {
                        t = Game.players[i];
                        break;
                    }
                if (t) {
                    (t.nameplate.style.display = "none"), t.entity.destroy();
                    Game.players.splice(Game.players.indexOf(t), 1);
                    GameClient.LastTotalPlayers = Game.players.length;
                    !0 === Game.started &&
                        !1 === t.isMine &&
                        (GameClient.DiePosition--, GameClient.DiePosition < 1 && (GameClient.DiePosition = 1));
                } else console.log("Unknown player left.");
                console.log("Current players ingame: " + Game.players.length);
            }),
            this.Socket.on("serverMessage", function(e) {
                var t = e.message;
                if ("Match Started!" === t) {
                    (GameClient.DiePosition = Game.players.length),
                        (GameClient.LastTotalPlayers = Game.players.length),
                        (Game.started = !0),
                        Hud.SetMatchInfo("GO!"),
                        Game.music.sound.stop("idleMusic"),
                        Game.music.sound.play("matchMusic"),
                        setTimeout(function() {
                            Hud.HideMatchInfo();
                        }, 1500);
                    var n = Game.StartTutorial.clone();
                    (n.enabled = !0),
                        n.setPosition(
                            new pc.Vec3(
                                GameClient.MyPlayer.entity.getPosition().x,
                                GameClient.MyPlayer.entity.getPosition().y + 3,
                                GameClient.MyPlayer.entity.getPosition().z
                            )
                        ),
                        a.app.root.addChild(n);
                } else Hud.SetMatchInfo(t), console.log("Server says: " + t);
            }),
            this.Socket.on("serverClosed", function() {
                (GameClient.SocketReady = !1), location.reload();
            }),
            this.Socket.on("placeBomb", function(e) {
                var t = e.bomb.id,
                    n = e.bomb.owner.id,
                    o = e.bomb.x,
                    l = e.bomb.z,
                    s = e.bomb.owner.currentBombLength,
                    r = null;
                for (i = 0; i < Game.players.length; i++)
                    if (Game.players[i].id === n) {
                        r = Game.players[i];
                        break;
                    }
                if (r) {
                    var c = Game.bomb.clone();
                    (c.enabled = !0), c.setPosition(o, 0.5, l), a.app.root.addChild(c);
                    var m = new Game.Bomb(t, o, l, r, c, s);
                    Game.bombs.push(m), c.script.bomb.Init(r, m);
                } else console.log("Unknown placer");
            }),
            this.Socket.on("removeBomb", function(e) {
                var a = e.id;
                for (i = 0; i < Game.bombs.length; i++)
                    Game.bombs[i].id == a && (Game.bombs[i].entity.destroy(), Game.bombs.splice(i, 1));
            }),
            this.Socket.on("removeBlock", function(e) {
                var a = e.id;
                for (i = 0; i < Game.blocks.length; i++)
                    if (Game.blocks[i].id === a) {
                        Game.blocks[i].entity.script.blockController.DestroyBlock(), Game.blocks.splice(i, 1);
                        break;
                    }
            }),
            this.Socket.on("spawnPowerup", function(e) {
                var t = e.powerup.id,
                    n = e.powerup.x,
                    i = e.powerup.z,
                    o = e.powerup.item,
                    l = new Game.Powerup(t, n, i, o),
                    s = Game.powerup.clone();
                (s.enabled = !0),
                    a.app.root.addChild(s),
                    s.script.powerUp.Init(l),
                    (l.entity = s),
                    Game.powerups.push(l);
            }),
            this.Socket.on("consumePowerup", function(e) {
                var a = e.id,
                    t = e.consumerId,
                    n = null;
                for (i = 0; i < Game.players.length; i++)
                    if (Game.players[i].id === t) {
                        n = Game.players[i];
                        break;
                    }
                n ? Game.powerups[a - 1].entity.script.powerUp.Consume(n) : console.log("Unknown consumer");
            }),
            this.Socket.on("playerDead", function(e) {
                var t = e.id;
                !1 === Game.isMuted && Game.Crowd.sound.play("crowd");
                var n = null;
                for (i = 0; i < Game.players.length; i++)
                    if (Game.players[i].id === t) {
                        n = Game.players[i];
                        break;
                    }
                if (n) {
                    !0 === n.isMine &&
                        !1 === a.alreadyReceivedEndState &&
                        ((a.SocketReady = !1),
                        Game.Camera.script.gameCamera.UnsetTarget(),
                        (Game.Camera.audiolistener.enabled = !0),
                        (a.isConnected = !1),
                        Hud.SetMatchInfo("You died"),
                        Game.music.sound.stop("matchMusic"),
                        (a.alreadyReceivedEndState = !0),
                        Game.GameOver()),
                        !1 === n.isMine &&
                            (GameClient.DiePosition--, GameClient.DiePosition < 1 && (GameClient.DiePosition = 1));
                    var o = Game.actionDie.clone();
                    (o.enabled = !0), a.app.root.addChild(o);
                    var l = new pc.Vec3(n.x, 0.5, n.z);
                    o.setPosition(l), (n.nameplate.style.display = "none"), n.entity.destroy();
                    var s = Game.players.indexOf(n);
                    Game.players.splice(s, 1);
                } else console.log("Unknown dead player");
            }),
            this.Socket.on("matchEnded", function() {
                !1 === a.alreadyReceivedEndState &&
                    (Hud.SetMatchInfo("You won!"),
                    Game.music.sound.stop("matchMusic"),
                    (Game.Camera.audiolistener.enabled = !0),
                    (GameClient.SocketReady = !1),
                    (GameClient.gameId = null),
                    Game.GameOver(),
                    (a.isConnected = !1),
                    (a.alreadyReceivedEndState = !0));
            }),
            this.Socket.on("teleport", function(e) {
                var a = e.id,
                    t = e.x,
                    n = e.z,
                    o = null;
                for (i = 0; i < Game.players.length; i++)
                    if (Game.players[i].id === a) {
                        o = Game.players[i];
                        break;
                    }
                o
                    ? !0 === o.isMine
                        ? o.entity.rigidbody.teleport(new pc.Vec3(t, 0.5, n))
                        : o.entity.setPosition(new pc.Vec3(t, 0.5, n))
                    : console.log("Unknown player to teleport");
            }),
            this.Socket.on("actionHello", function(e) {
                var t = e.id,
                    n = null;
                for (i = 0; i < Game.players.length; i++)
                    if (Game.players[i].id === t) {
                        n = Game.players[i];
                        break;
                    }
                if (n) {
                    var o = Game.actionHello.clone();
                    (o.enabled = !0), a.app.root.addChild(o), o.script.actionBehaviour.Init(n);
                } else console.log("Uknown player that made the action");
            }),
            (this.isConnected = !1),
            (this.alreadyReceivedEndState = !1);
    }),
    (GameClient.ClusterAddress = ""),
    (GameClient.ClusterPort = ""),
    (GameClient.gsName = null),
    (GameClient.prototype.onConnect = function() {
        var e = new Net.OutgoingNetMessage();
        e.Write("REQUEST_GAMESERVER"),
            e.Send(this.Socket),
            (this.ConnectedToRegion = !0),
            console.log("Connected to Region!"),
            console.log("Awaiting GameServer..."),
            (Hud.connectionStatus.innerHTML = "Awaiting GameServer..");
    }),
    (GameClient.prototype.onMessage = function(e) {
        var a = new Net.IncomingNetMessage(e);
        switch (a.Read()) {
            case "GET_GAMESERVER":
                var t = a.Read();
                (this.IngameSocket = new m.net.ws({
                    url: "ws://" + this.ClusterAddress + ":" + this.ClusterPort + "/" + t,
                })),
                    (GameClient.IngameSocket = this.IngameSocket),
                    this.IngameSocket.on("connect", this.onGSConnect.bind(this)),
                    this.IngameSocket.on("message", this.onGSMessage.bind(this)),
                    this.IngameSocket.on("close", this.onGSClose.bind(this));
                break;
            case "QUEUED":
                console.log("In queue, server initializing."),
                    (Hud.connectionStatus.innerHTML = "In queue! You will enter a server in 2 seconds."),
                    (this.isConnected = !0);
        }
    }),
    (GameClient.identification = -1),
    (GameClient.prototype.onGSConnect = function() {
        console.log("Connected to GameServer!"),
            (Hud.connectionStatus.innerHTML = "Connected to a GameServer!"),
            (this.isConnected = !0),
            Hud.SetMatchInfo("Waiting for more players."),
            Game.music.sound.resume("idleMusic"),
            (this.alreadyReceivedEndState = !1);
    }),
    (GameClient.SpawnedMyPlayer = !1),
    (GameClient.prototype.onGSMessage = function(e) {
        var a = new Net.IncomingNetMessage(e);
        switch (a.Read()) {
            case "GET_ID":
                (GameClient.identification = a.Read()), (Hud.connectionStatus.innerHTML = "Identificated");
                setTimeout(function() {
                    var e = new Net.OutgoingNetMessage();
                    e.Write("REQUEST_SPAWN"), e.Write(GameClient.identification), e.Send(GameClient.IngameSocket);
                }, 1);
                break;
            case "GET_BLOCKS":
                Hud.connectionStatus.innerHTML = "Blocks retrieved";
                var t = a.Read();
                for (i = 0; i < t; i++) {
                    var n = new Game.Block(a.Read(), a.Read(), a.Read(), a.Read(), a.Read());
                    Game.blocks.push(n);
                }
                Game.SpawnBlocks();
                break;
            case "GET_EXISTING":
                Hud.connectionStatus.innerHTML = "Gathered existing player";
                var o = a.Read();
                for (i = 0; i < o; i++) {
                    var l = a.Read(),
                        s = a.Read(),
                        r = a.Read(),
                        c = a.Read(),
                        m = a.Read(),
                        d = new Game.Player(l, s, r, c, m);
                    Game.players.push(d), console.log("retrieved existing player with id: " + d.id);
                    var p = Game.playerController.clone();
                    (p.enabled = !0),
                        p.rigidbody.teleport(d.x, 1, d.z),
                        this.app.root.addChild(p),
                        (d.entity = p),
                        p.script.movement.Init(d),
                        Hud.GenerateNameplate(d);
                }
                break;
            case "SPAWN_PLAYER":
            case "PLAYER_DISCONNECTED":
                break;
            case "RETRIEVE_PLAYER_STATES":
                var y = a.Read();
                for (i = 0; i < y; i++);
                break;
            case "PLACE_BOMB":
            case "REMOVE_BOMB":
            case "DESTROY_BLOCK":
            case "RETRIEVE_POWERUP":
            case "CONSUME_POWERUP":
            case "PLAYER_DEAD":
            case "INFO":
            case "MATCH_RESULT":
            case "ACTION_HELLO":
            case "TELEPORT_PLAYER":
                break;
            case "ENCADENATE_BOMB":
                var G = a.Read();
                for (i = 0; i < Game.bombs.length; i++)
                    if (Game.bombs[i].id === G) {
                        Game.bombs[i].entity.script.bomb.Encadenate();
                        break;
                    }
                break;
            default:
                console.log("Received unhandled ingame header.");
        }
    }),
    (GameClient.prototype.onGSClose = function() {
        !1 === this.alreadyReceivedEndState
            ? (console.log("Lost connection to the GameServer unexpectedly."),
              Hud.SetMatchInfo("Lost connection unexpectedly.<br>Press F5 to restart."),
              (GameClient.SocketReady = !1))
            : (console.log("Connection to the GameServer was closed."),
              (this.isConnected = !1),
              (GameClient.SocketReady = !1));
    });
var Movement = pc.createScript("movement");
(this.movement_enabled = !0),
    (this.velocity = null),
    (this.owner = null),
    (this.movementParticles = null),
    (Movement.prototype.initialize = function() {
        (this.movementParticles = this.entity.findByName("MovementParticles")),
            (this.lastDir = "idle"),
            (this.Factor = 0.58),
            (this.lastTime = 0),
            (this.latestCorrectPos = new pc.Vec3()),
            (this.movementVector = new pc.Vec3()),
            (this.errorVector = new pc.Vec3()),
            (this.footstepTimer = 0);
    }),
    (Movement.prototype.Init = function(e) {
        (this.owner = e), (this.velocity = new pc.Vec3()), (this.alreadySentUpdate = !1);
        var t = this;
        !0 === this.owner.isMine
            ? ((this.movement_enabled = !0),
              (Game.Camera.script.gameCamera.target = this.entity),
              (Game.Camera.audiolistener.enabled = !1),
              (this.owner.stateIntervalId = setInterval(function() {
                  t.SendUpdate();
              }, 1e3)),
              (GameClient.SocketReady = !0))
            : ((this.entity.rigidbody.enabled = !1), (this.entity.audiolistener.enabled = !1));
        var i = this.entity.findByName("character");
        i && i.script.playerModelController.Init(this.owner), (this.owner.initialized = !0);
    }),
    (Movement.prototype.SendUpdate = function() {}),
    (Movement.prototype.GetUpdate = function() {
        this.alreadySentUpdate = !1;
    }),
    (Movement.prototype.update = function(e) {
        var t = 0,
            i = 0;
        if (
            !0 === this.owner.isMine &&
            ((this.entity.getPosition().y < 0 || this.entity.getPosition().y > 0.5) &&
                this.entity.rigidbody.teleport(this.entity.getPosition().x, 0.5, this.entity.getPosition().z),
            !0 === this.movement_enabled)
        ) {
            (this.app.keyboard.isPressed(pc.KEY_UP) || this.app.keyboard.isPressed(pc.KEY_W)) &&
                (i -= parseFloat(this.owner.movement_speed)),
                (this.app.keyboard.isPressed(pc.KEY_DOWN) || this.app.keyboard.isPressed(pc.KEY_S)) &&
                    (i += parseFloat(this.owner.movement_speed)),
                (this.app.keyboard.isPressed(pc.KEY_RIGHT) || this.app.keyboard.isPressed(pc.KEY_D)) &&
                    (t += parseFloat(this.owner.movement_speed)),
                (this.app.keyboard.isPressed(pc.KEY_LEFT) || this.app.keyboard.isPressed(pc.KEY_A)) &&
                    (t -= parseFloat(this.owner.movement_speed));
            var s = new pc.Vec3();

            if (
                (s
                    .set(t, -1, i)
                    .normalize()
                    .scale(this.owner.movement_speed),
                (s.y = 0),
                this.velocity.copy(s),
                (this.entity.rigidbody.linearVelocity = this.velocity),
                !0 === GameClient.SocketReady &&
                    GameClient.Socket.emit("playerUpdate", {
                        room: GameClient.joinedServerName,
                        lobby: GameClient.tronLobby,
                        id: this.owner.id,
                        x: this.entity.getPosition().x,
                        z: this.entity.getPosition().z,
                        angle: this.owner.angleY,
                        velocity: this.velocity.length(),
                    }),
                this.app.keyboard.wasPressed(pc.KEY_SPACE) && !0 === Game.started)
            ) {
                var o = Math.round(this.entity.getPosition().x),
                    n = Math.round(this.entity.getPosition().z);
                GameClient.Socket.emit("placeBomb", {
                    room: GameClient.joinedServerName,
                    lobby: GameClient.tronLobby,
                    id: this.owner.id,
                    x: o,
                    z: n,
                });
            }
            this.app.keyboard.wasPressed(pc.KEY_H) &&
                GameClient.Socket.emit("actionHello", {
                    room: GameClient.joinedServerName,
                    id: this.owner.id,
                });
        }
        var a = this.entity.getPosition(),
            r = new pc.Vec3(this.owner.x, 0.5, this.owner.z),
            p = new pc.Vec3();
        if ((p.lerp(a, r, 8 * e), !1 === this.owner.isMine && this.entity.setPosition(p), this.owner.velocity > 0.1)) {
            if (
                (this.movementParticles.particlesystem.play(),
                (this.footstepTimer += e),
                this.footstepTimer >= 0.3 && !1 === Game.isMuted)
            ) {
                var h = Math.round(pc.math.random(0, 4));
                this.entity.sound.play("footstep" + h), (this.footstepTimer = 0);
            }
        } else this.movementParticles.particlesystem.stop();
    }),
    (Movement.prototype.swap = function(e) {});
var Game = pc.createScript("game");

function OnLoggedIn() {
    (document.getElementById("loggedUsername").style.display = "block"),
        (document.getElementById("loggedUsername").innerHTML = "Welcome back, " + AKID.username),
        (document.getElementById("loggedUsername").style.left = "calc(50% - 100px)"),
        (document.getElementById("loggedUsername").style.top = "5px"),
        RequestGameToken(0);
}

function SaveTokenAndReload(e) {
    0 === e.length
        ? SaveGameToken(0, Game.token)
        : Game.GetCookie("token") !== e && (Game.SetCookie("token", e, 365), window.location.reload());
}

(Game.app = null),
    (Game.sandblock = null),
    (Game.stoneblock = null),
    (Game.playerController = null),
    (Game.Camera = null),
    (Game.bomb = null),
    (Game.explosion = null),
    (Game.powerup = null),
    (Game.explosionParticles = null),
    (Game.blocks = []),
    (Game.players = []),
    (Game.bombs = []),
    (Game.powerups = []),
    (Game.music = null),
    (Game.actionHello = null),
    (Game.actionDie = null),
    (Game.alreadySpawnedIds = []),
    (Game.isMuted = !1),
    (Game.Crowd = null),
    (Game.token = ""),
    (Game.StartTutorial = null),
    (Game.elo = 0),
    (Game.plays = 0),
    (Game.wholePlays = 0),
    (Game.prototype.initialize = function() {
        console.log(Game.GetCookie("token"));
        var e = Game.GetParameterByName("login");
        null !== e && (console.log("Logging into: " + e), (Game.token = e), Game.SetCookie("token", e, 365));
        var a = {};
        window.addEventListener(
            "keydown",
            function(e) {
                switch (((a[e.keyCode] = !0), e.keyCode)) {
                    case 37:
                    case 39:
                    case 38:
                    case 40:
                    case 32:
                        e.preventDefault();
                }
            },
            !1
        ),
            window.addEventListener(
                "keyup",
                function(e) {
                    a[e.keyCode] = !1;
                },
                !1
            ),
            (Game.app = this.app),
            (Game.sandblock = this.app.root.findByName("sandblock")),
            (Game.stoneblock = this.app.root.findByName("stoneblock")),
            (Game.playerController = this.app.root.findByName("PlayerController")),
            (Game.bomb = this.app.root.findByName("Bomb")),
            (Game.explosion = this.app.root.findByName("Explosion")),
            (Game.powerup = this.app.root.findByName("PowerUp")),
            (Game.Camera = this.app.root.findByName("Camera")),
            (Game.explosionParticles = this.app.root.findByName("ExplosionParticles")),
            (Game.music = this.app.root.findByName("Music")),
            (Game.actionHello = this.app.root.findByName("action-hello")),
            (Game.actionDie = this.app.root.findByName("action-die")),
            (Game.Crowd = this.app.root.findByName("Crowd")),
            (Game.StartTutorial = this.app.root.findByName("StartTutorial")),
            Game.music.sound.play("idleMusic"),
            (Game.started = !1),
            (Game.isMuted = !1),
            (Game.token = window.tronWeb.defaultAddress.base58),
            (Game.elo = 0),
            setTimeout(function() {
                Game.GetCookie("username").length > 0 && (Hud.loginUsernameInput.value = Game.GetCookie("username"));
            }, 500),
            (Game.plays = 0),
            (Game.wholePlays = 0);
    }),
    (Game.GetParameterByName = function(e) {
        e = e.replace(/[\[\]]/g, "\\$&");
        var a = new RegExp("[?&]" + e + "(=([^&#]*)|&|#|$)").exec(window.location.href);
        return a ? (a[2] ? decodeURIComponent(a[2].replace(/\+/g, " ")) : "") : null;
    }),
    (Game.RequestRanking = function() {
        GatewayClient.Socket.emit("requestRanking");
    }),
    (Game.MuteUnMute = function() {
        !1 === Game.isMuted ? (Game.music.sound.enabled = !0) : (Game.music.sound.enabled = !1);
    }),
    (Game.Restart = function() {
        (Game.started = !1),
            GameClient.Socket.emit("leaveRoom", {
                room: GameClient.joinedServerName,
                id: GameClient.identification,
            }),
            setTimeout(function() {
                Game.prototype.CleanUp();
            }, 500);
    }),
    (Game.GameOver = function() {
        1 === Game.players.length && (GameClient.DiePosition = 1),
            GatewayClient.Socket.emit("calculateRankedMatch", {
                token: Game.token,
                diePos: GameClient.DiePosition,
                totalPlayers: GameClient.LastTotalPlayers,
                id: GameClient.identification,
                room: GameClient.joinedServerName,
                lobby: GameClient.tronLobby,
            }),
            setTimeout(function() {
                !1 === GatewayClient.receivedRankingResult &&
                    GatewayClient.Socket.emit("calculateRankedMatch", {
                        token: Game.token,
                        diePos: GameClient.DiePosition,
                        totalPlayers: GameClient.LastTotalPlayers,
                        id: GameClient.identification,
                        room: GameClient.joinedServerName,
                        lobby: GameClient.tronLobby,
                    });
            }, 1200),
            Game.Restart();
    }),
    (Game.prototype.CleanUp = function() {
        for (GameClient.SpawnedMyPlayer = !1, i = 0; i < Game.players.length; i++)
            clearInterval(Game.players[i].stateIntervalId),
                Game.players[i].entity.destroy(),
                (Game.players[i].nameplate.style.display = "none");
        for (Game.players.splice(0, Game.players.length), i = 0; i < Game.blocks.length; i++)
            null !== Game.blocks[i].entity && Game.blocks[i].entity.destroy();
        for (Game.blocks.splice(0, Game.blocks.length), i = 0; i < Game.bombs.length; i++)
            null !== Game.bombs[i].entity && Game.bombs[i].entity.destroy();
        for (Game.bombs.splice(0, Game.bombs.length), i = 0; i < Game.powerups.length; i++)
            null !== Game.powerups[i].entity && Game.powerups[i].entity.destroy();
        Game.powerups.splice(0, Game.powerups.length);
    }),
    (Game.prototype.OnReplay = function() {
        GameClient.Socket.emit("handshake");
        Hud.SetMatchInfo("Joining another match");
    }),
    (Game.Overlaps = function(e) {
        for (i = 0; i < Game.blocks.length; i++) {
            var a = parseInt(e.x),
                t = parseInt(e.z),
                o = parseInt(Game.blocks[i].x),
                n = parseInt(Game.blocks[i].z);
            if (o === a && n === t) return Game.blocks[i];
        }
    }),
    (Game.ContainsPlayer = function(e) {
        var a = [];
        for (i = 0; i < Game.players.length; i++)
            if (
                null !== Game.players[i].entity &&
                null !== Game.players[i] &&
                void 0 !== Game.players[i] &&
                void 0 !== Game.players[i].entity
            ) {
                var t = new pc.Vec3(),
                    o = !1,
                    n = !1;
                (t = Game.players[i].entity.getPosition()).x < e.x + 0.5 && t.x > e.x - 0.5 && (o = !0),
                    t.z < e.z + 0.5 && t.z > e.z - 0.5 && (n = !0),
                    !0 === o && !0 === n && a.push(Game.players[i]);
            }
        return a;
    }),
    (Game.ContainsBomb = function(e) {
        for (i = 0; i < Game.bombs.length; i++)
            if (
                null !== Game.bombs[i].entity &&
                null !== Game.bombs[i] &&
                void 0 !== Game.bombs[i] &&
                void 0 !== Game.bombs[i].entity
            ) {
                var a = new pc.Vec3(),
                    t = !1,
                    o = !1;
                if (
                    ((a = Game.bombs[i].entity.getPosition()).x < e.x + 0.5 && a.x > e.x - 0.5 && (t = !0),
                    a.z < e.z + 0.5 && a.z > e.z - 0.5 && (o = !0),
                    !0 === t && !0 === o)
                )
                    return Game.bombs[i];
            }
        return null;
    }),
    (Game.SetCookie = function(e, a, t) {
        var i = new Date();
        i.setTime(i.getTime() + 24 * t * 60 * 60 * 1e3);
        var o = "expires=" + i.toUTCString();
        document.cookie = e + "=" + a + ";" + o + ";path=/";
    }),
    (Game.GetCookie = function(e) {
        for (var a = e + "=", t = document.cookie.split(";"), i = 0; i < t.length; i++) {
            for (var o = t[i]; " " === o.charAt(0); ) o = o.substring(1);
            if (0 === o.indexOf(a)) return o.substring(a.length, o.length);
        }
        return "";
    }),
    (Game.Distance = function(e, a) {
        return Math.sqrt((e.x - a.x) * (e.x - a.x) + (e.z - a.z) * (e.z - a.z));
    }),
    (Game.IsOutsideOfArena = function(e) {
        var a = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7],
            t = !1,
            o = !1;
        for (i = 0; i < a.length; i++) e.x === a[i] && (t = !0), e.z === a[i] && (o = !0);
        return !0 !== t || !0 !== o;
    }),
    (Game.Block = function(e, a, t, i, o) {
        (this.id = e), (this.kind = a), (this.x = t), (this.z = i), (this.itemToGive = o), (this.entity = null);
    }),
    (Game.SpawnBlocks = function() {
        for (i = 0; i < Game.blocks.length; i++)
            switch (Game.blocks[i].kind) {
                case 0:
                    var e = Game.stoneblock.clone();
                    Game.app.root.addChild(e),
                        (e.enabled = !0),
                        e.rigidbody.teleport(Game.blocks[i].x, 0.5, Game.blocks[i].z),
                        (Game.blocks[i].entity = e),
                        e.script.blockController.Init(Game.blocks[i]);
                    break;
                case 1:
                    var a = Game.sandblock.clone();
                    Game.app.root.addChild(a),
                        (a.enabled = !0),
                        a.rigidbody.teleport(Game.blocks[i].x, 0.5, Game.blocks[i].z),
                        (Game.blocks[i].entity = a),
                        a.script.blockController.Init(Game.blocks[i]);
            }
    }),
    (Game.Player = function(e, a, t, i) {
        (this.id = e),
            (this.username = a),
            (this.x = t),
            (this.z = i),
            (this.angleY = 0),
            (this.velocity = 0),
            (this.entity = null),
            (this.isMine = !1),
            (this.availableBombs = 1),
            (this.currentBombLength = 1),
            (this.movement_speed = 3),
            (this.stateIntervalId = 0),
            (this.nameplate = null),
            (this.alreadyDied = !1),
            (this.initialized = !1);
    }),
    (Game.Bomb = function(e, a, t, i, o, n) {
        (this.id = e), (this.x = a), (this.z = t), (this.owner = i), (this.entity = o), (this.length = n);
    }),
    (Game.Powerup = function(e, a, t, i) {
        (this.id = e), (this.x = a), (this.z = t), (this.item = i), (this.entity = null);
    });
var FaceDirection = pc.createScript("faceDirection");
FaceDirection.prototype.initialize = function() {};
var lerpedAngle = 0,
    lastAngle = 0;
FaceDirection.prototype.update = function(e) {};
var PlayerModelController = pc.createScript("playerModelController");
(PlayerModelController.animationStates = {
    idle: { animation: "char_idle.json" },
    run: { animation: "char_run.json" },
}),
    (PlayerModelController.prototype.initialize = function() {
        (this.blendTime = 0.2), this.setState("idle");
    }),
    (PlayerModelController.prototype.setState = function(t) {
        var e = PlayerModelController.animationStates;
        this.state !== t && ((this.state = t), this.entity.animation.play(e[t].animation, this.blendTime));
    }),
    (this.owner = null),
    (this.lerpedAngle = 0),
    (this.lastAngle = 0),
    (PlayerModelController.prototype.Init = function(t) {
        (this.owner = t), (this.owner.angleY = 0), (this.lerpedAngle = 0), (this.lastAngle = 0);
    }),
    (PlayerModelController.prototype.update = function(t) {
        var e = this.entity.getRotation(),
            n = null;
        if (!0 === this.owner.isMine) {
            if (this.entity.parent.script.movement.velocity.length() > 0.1) {
                var i =
                    Math.atan2(
                        this.entity.parent.script.movement.velocity.x,
                        this.entity.parent.script.movement.velocity.z
                    ) * pc.math.RAD_TO_DEG;
                (n = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, i)), (this.owner.angleY = i), (this.lastAngle = i);
            } else n = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, this.lastAngle);
            this.entity.parent.script.movement.velocity.length() > 0.1 ? this.setState("run") : this.setState("idle");
        } else
            (n = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, this.owner.angleY)),
                this.owner.velocity > 0.1 ? this.setState("run") : this.setState("idle");
        var l = new pc.Quat().slerp(e, n, 0.2);
        this.entity.setRotation(l);
    });
var Bomb = pc.createScript("bomb");
(this.owner = null),
    (this.bomb = null),
    (this.bombLength = 0),
    (this.alreadyTimedOut = !1),
    (this.lifeTime = 0),
    (this.bombModel = null),
    (this.targetBombScale = 0),
    (Bomb.prototype.initialize = function() {
        (this.alreadyTimedOut = !1),
            this.entity.collision.on("triggerleave", this.OnTriggerLeave, this),
            !0 === Game.isMuted && (this.entity.sound.enabled = !1),
            (this.bombModel = this.entity.findByName("bomb")),
            (this.lifeTime = 0);
    }),
    (Bomb.prototype.Init = function(e, t) {
        if (
            ((this.owner = e),
            (this.bomb = t),
            (this.bombLength = this.bomb.length),
            !0 === this.owner.isMine || this.entity.addComponent("rigidbody", { type: "static" }),
            null !== this.owner)
        ) {
            var i = this;
            setTimeout(function() {
                i.onTimeOut();
            }, 2e3);
        }
    }),
    (Bomb.prototype.OnTriggerLeave = function(e) {
        e.script.movement.owner.id === this.owner.id && this.entity.addComponent("rigidbody", { type: "static" });
    }),
    (Bomb.prototype.Encadenate = function() {
        console.log("Bomb encadenated!"), this.onTimeOut();
    }),
    (Bomb.prototype.onTimeOut = function() {
        if (!1 === this.alreadyTimedOut) {
            !0 === this.owner.isMine &&
                GameClient.Socket.emit("removeBomb", {
                    room: GameClient.joinedServerName,
                    id: this.bomb.id,
                });
            var e = Game.explosion.clone(),
                t = new pc.Vec3();
            t.copy(this.entity.getPosition()),
                t.sub(new pc.Vec3(0, 0.5, 0)),
                (e.enabled = !0),
                this.app.root.addChild(e),
                e.setPosition(t),
                e.script.explosion.Init(this.bomb.id, !0, this.owner, this.bomb.length, 0),
                (alreadyTimedOut = !0);
        }
    }),
    (Bomb.prototype.update = function(e) {
        !1 === GameClient.SocketReady && this.entity.destroy(),
            (this.lifeTime += e),
            this.lifeTime < 0.35
                ? (this.targetBombScale = 0.505)
                : this.lifeTime > 0.35 && this.lifeTime < 0.7
                ? (this.targetBombScale = 0.405)
                : this.lifeTime > 0.7 && this.lifeTime < 1
                ? (this.targetBombScale = 0.505)
                : this.lifeTime > 1 && this.lifeTime < 1.2
                ? (this.targetBombScale = 0.405)
                : this.lifeTime > 1.2 && this.lifeTime < 1.4
                ? (this.targetBombScale = 0.505)
                : this.lifeTime > 1.4 && this.lifeTime < 1.6
                ? (this.targetBombScale = 0.405)
                : this.lifeTime > 1.6 && (this.targetBombScale = 0.655);
        var t = new pc.Vec3();
        t.lerp(
            this.bombModel.getLocalScale(),
            new pc.Vec3(this.targetBombScale, this.targetBombScale, this.targetBombScale),
            0.1
        ),
            this.bombModel.setLocalScale(t);
    });
var Explosion = pc.createScript("explosion");
(this.isFirst = !1),
    (this.lengthCount = 0),
    (this.owner = null),
    (Explosion.prototype.initialize = function() {
        !1 === GameClient.SocketReady && this.entity.destroy(), !0 === Game.isMuted && (this.entity.sound.enabled = !1);
    }),
    (Explosion.prototype.onTriggerenter = function(i) {
        null !== i && i.script.bomb && this.bombId !== i.script.bomb.id && this.owner.isMine;
    }),
    (Explosion.prototype.Init = function(i, t, e, o, s) {
        if (
            ((this.bombId = i),
            (this.isFirst = t),
            (this.owner = e),
            (this.lengthCount = parseInt(o)),
            !0 === GameClient.SocketReady)
        ) {
            var n = this;
            setTimeout(function() {
                n.OnTimeOut(t, s);
            }, 100);
        }
        var l = Game.ContainsBomb(this.entity.getPosition());
        l && this.onTriggerenter(l.entity);
    }),
    (Explosion.prototype.OnTimeOut = function(t, e, o) {
        var s = null,
            n = null,
            l = null,
            a = new pc.Vec3(),
            r = new pc.Vec3(),
            p = new pc.Vec3(),
            c = new pc.Vec3();
        for (
            a.copy(this.entity.getPosition()),
                r.copy(this.entity.getPosition()),
                p.copy(this.entity.getPosition()),
                c.copy(this.entity.getPosition()),
                a.sub(new pc.Vec3(1, 0, 0)),
                r.add(new pc.Vec3(1, 0, 0)),
                p.add(new pc.Vec3(0, 0, 1)),
                c.sub(new pc.Vec3(0, 0, 1)),
                explosionParticles = Game.explosionParticles.clone(),
                explosionParticles.enabled = !0,
                explosionParticles.setPosition(this.entity.getPosition()),
                this.app.root.addChild(explosionParticles),
                explosionParticles.particlesystem.play(),
                i = 0;
            i < Game.players.length;
            i++
        )
            if (Game.players[i].id === GameClient.identification) {
                var d = Game.Distance(Game.players[i].entity.getPosition(), this.entity.getPosition());
                GameCamera.shake = 5 / (d - 0.5);
                break;
            }
        this.lengthCount > 0 &&
            (this.lengthCount--,
            !0 === t
                ? (!1 === Game.IsOutsideOfArena(a) &&
                      ((s = Game.Overlaps(a))
                          ? (s.entity.script.blockController.Hit(this.owner.isMine),
                            0 !== s.entity.script.blockController.block.kind &&
                                ((explosionParticles = Game.explosionParticles.clone()),
                                (explosionParticles.enabled = !0),
                                explosionParticles.setPosition(s.entity.getPosition()),
                                this.app.root.addChild(explosionParticles),
                                explosionParticles.particlesystem.play()))
                          : ((n = Game.explosion.clone()),
                            (l = new pc.Vec3())
                                .copy(this.entity.right)
                                .scale(-1)
                                .add(this.entity.getPosition()),
                            (n.enabled = !0),
                            this.app.root.addChild(n),
                            n.setPosition(l),
                            n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, 0))),
                  !1 === Game.IsOutsideOfArena(r) &&
                      ((s = Game.Overlaps(r))
                          ? (s.entity.script.blockController.Hit(this.owner.isMine),
                            0 !== s.entity.script.blockController.block.kind &&
                                ((explosionParticles = Game.explosionParticles.clone()),
                                (explosionParticles.enabled = !0),
                                explosionParticles.setPosition(s.entity.getPosition()),
                                this.app.root.addChild(explosionParticles),
                                explosionParticles.particlesystem.play()))
                          : ((n = Game.explosion.clone()),
                            (l = new pc.Vec3())
                                .copy(this.entity.right)
                                .scale(1)
                                .add(this.entity.getPosition()),
                            (n.enabled = !0),
                            this.app.root.addChild(n),
                            n.setPosition(l),
                            n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, 1))),
                  !1 === Game.IsOutsideOfArena(p) &&
                      ((s = Game.Overlaps(p))
                          ? (s.entity.script.blockController.Hit(this.owner.isMine),
                            0 !== s.entity.script.blockController.block.kind &&
                                ((explosionParticles = Game.explosionParticles.clone()),
                                (explosionParticles.enabled = !0),
                                explosionParticles.setPosition(s.entity.getPosition()),
                                this.app.root.addChild(explosionParticles),
                                explosionParticles.particlesystem.play()))
                          : ((n = Game.explosion.clone()),
                            (l = new pc.Vec3())
                                .copy(this.entity.forward)
                                .scale(-1)
                                .add(this.entity.getPosition()),
                            (n.enabled = !0),
                            this.app.root.addChild(n),
                            n.setPosition(l),
                            n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, 2))),
                  !1 === Game.IsOutsideOfArena(c) &&
                      ((s = Game.Overlaps(c))
                          ? (s.entity.script.blockController.Hit(this.owner.isMine),
                            0 !== s.entity.script.blockController.block.kind &&
                                ((explosionParticles = Game.explosionParticles.clone()),
                                (explosionParticles.enabled = !0),
                                explosionParticles.setPosition(s.entity.getPosition()),
                                this.app.root.addChild(explosionParticles),
                                explosionParticles.particlesystem.play()))
                          : ((n = Game.explosion.clone()),
                            (l = new pc.Vec3())
                                .copy(this.entity.forward)
                                .scale(1)
                                .add(this.entity.getPosition()),
                            (n.enabled = !0),
                            this.app.root.addChild(n),
                            n.setPosition(l),
                            n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, 3))))
                : (void 0 !== this.entity && void 0 !== this.entity.sound && (this.entity.sound.enabled = !1),
                  0 === e
                      ? !1 === Game.IsOutsideOfArena(a) &&
                        ((s = Game.Overlaps(a))
                            ? (s.entity.script.blockController.Hit(this.owner.isMine),
                              0 !== s.entity.script.blockController.block.kind &&
                                  ((explosionParticles = Game.explosionParticles.clone()),
                                  (explosionParticles.enabled = !0),
                                  explosionParticles.setPosition(s.entity.getPosition()),
                                  this.app.root.addChild(explosionParticles),
                                  explosionParticles.particlesystem.play()))
                            : ((n = Game.explosion.clone()),
                              (l = new pc.Vec3())
                                  .copy(this.entity.right)
                                  .scale(-1)
                                  .add(this.entity.getPosition()),
                              (n.enabled = !0),
                              this.app.root.addChild(n),
                              n.setPosition(l),
                              n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, e)))
                      : 1 === e
                      ? !1 === Game.IsOutsideOfArena(r) &&
                        ((s = Game.Overlaps(r))
                            ? (s.entity.script.blockController.Hit(this.owner.isMine),
                              0 !== s.entity.script.blockController.block.kind &&
                                  ((explosionParticles = Game.explosionParticles.clone()),
                                  (explosionParticles.enabled = !0),
                                  explosionParticles.setPosition(s.entity.getPosition()),
                                  this.app.root.addChild(explosionParticles),
                                  explosionParticles.particlesystem.play()))
                            : ((n = Game.explosion.clone()),
                              (l = new pc.Vec3())
                                  .copy(this.entity.right)
                                  .scale(1)
                                  .add(this.entity.getPosition()),
                              (n.enabled = !0),
                              this.app.root.addChild(n),
                              n.setPosition(l),
                              n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, e)))
                      : 2 === e
                      ? !1 === Game.IsOutsideOfArena(p) &&
                        ((s = Game.Overlaps(p))
                            ? (s.entity.script.blockController.Hit(this.owner.isMine),
                              0 !== s.entity.script.blockController.block.kind &&
                                  ((explosionParticles = Game.explosionParticles.clone()),
                                  (explosionParticles.enabled = !0),
                                  explosionParticles.setPosition(s.entity.getPosition()),
                                  this.app.root.addChild(explosionParticles),
                                  explosionParticles.particlesystem.play()))
                            : ((n = Game.explosion.clone()),
                              (l = new pc.Vec3())
                                  .copy(this.entity.forward)
                                  .scale(-1)
                                  .add(this.entity.getPosition()),
                              (n.enabled = !0),
                              this.app.root.addChild(n),
                              n.setPosition(l),
                              n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, 2)))
                      : 3 === e &&
                        !1 === Game.IsOutsideOfArena(c) &&
                        ((s = Game.Overlaps(c))
                            ? (s.entity.script.blockController.Hit(this.owner.isMine),
                              0 !== s.entity.script.blockController.block.kind &&
                                  ((explosionParticles = Game.explosionParticles.clone()),
                                  (explosionParticles.enabled = !0),
                                  explosionParticles.setPosition(s.entity.getPosition()),
                                  this.app.root.addChild(explosionParticles),
                                  explosionParticles.particlesystem.play()))
                            : ((n = Game.explosion.clone()),
                              (l = new pc.Vec3())
                                  .copy(this.entity.forward)
                                  .scale(1)
                                  .add(this.entity.getPosition()),
                              (n.enabled = !0),
                              this.app.root.addChild(n),
                              n.setPosition(l),
                              n.script.explosion.Init(this.bombId, !1, this.owner, this.lengthCount, 3))))),
            setTimeout(this.DestroyExplosion, 450, this.entity);
    }),
    (Explosion.prototype.DestroyExplosion = function(i) {
        i.destroy();
    }),
    (Explosion.prototype.update = function(t) {
        if (!1 !== GameClient.SocketReady) {
            if (!0 === this.owner.isMine) {
                var e = Game.ContainsPlayer(this.entity.getPosition());

                for (i = 0; i < e.length; i++)
                    GameClient.Socket.emit("playerDead", {
                        room: GameClient.joinedServerName,
                        id: e[i].id,
                    });
            }
        } else this.entity.destroy();
    });
var GameCamera = pc.createScript("gameCamera");
(GameCamera.prototype.initialize = function() {
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onSelect, this),
        (this.target = null),
        (this.idlePos = new pc.Vec3()),
        (this.idlePos = this.app.root.findByName("CameraIdleRef").getPosition()),
        (this.lerpedPos = new pc.Vec3()),
        (this.lerpFactor = 5),
        (this.shakeOffset = new pc.Vec3()),
        (this.targetPos = new pc.Vec3()),
        (GameCamera.shake = 0);
}),
    (GameCamera.prototype.onSelect = function(t) {
        var e = this.entity.camera.screenToWorld(t.x, t.y, this.entity.camera.nearClip),
            a = this.entity.camera.screenToWorld(t.x, t.y, this.entity.camera.farClip);
        this.app.systems.rigidbody.raycastFirst(e, a);
    }),
    (GameCamera.prototype.update = function(t) {
        GameCamera.shake > 0
            ? ((GameCamera.shake -= 15 * t),
              (this.shakeOffset = new pc.Vec3(
                  pc.math.random(-0.45, 0.45),
                  pc.math.random(-0.45, 0.45),
                  pc.math.random(-0.45, 0.45)
              )))
            : (this.shakeOffset = new pc.Vec3(0, 0, 0)),
            !0 === Game.started
                ? null === this.target
                    ? ((this.targetPos = this.idlePos), (lerpFactor = 5))
                    : (this.targetPos
                          .copy(this.entity.forward)
                          .scale(-65)
                          .add(this.target.getPosition()),
                      (lerpFactor = 10))
                : ((this.targetPos = this.idlePos), (lerpFactor = 5));
        var e = new pc.Vec3();
        (e = this.targetPos),
            !1 === Game.started
                ? GameCamera.shake > 0
                    ? e.add(this.shakeOffset)
                    : ((this.idlePos = new pc.Vec3()),
                      (this.idlePos = this.app.root.findByName("CameraIdleRef").getPosition()),
                      (e = this.idlePos))
                : null === this.target
                ? GameCamera.shake > 0
                    ? e.add(this.shakeOffset)
                    : ((this.idlePos = new pc.Vec3()),
                      (this.idlePos = this.app.root.findByName("CameraIdleRef").getPosition()),
                      (e = this.idlePos))
                : ((this.targetPos = new pc.Vec3()),
                  GameCamera.shake > 0
                      ? (this.targetPos
                            .copy(this.entity.forward)
                            .scale(-65)
                            .add(this.target.getPosition()),
                        this.targetPos.add(this.shakeOffset))
                      : this.targetPos
                            .copy(this.entity.forward)
                            .scale(-65)
                            .add(this.target.getPosition()),
                  (e = this.targetPos)),
            this.lerpedPos.lerp(this.entity.getPosition(), e, lerpFactor * t),
            this.entity.setPosition(this.lerpedPos);
    }),
    (GameCamera.prototype.UnsetTarget = function() {
        this.target = null;
    });
var BlockController = pc.createScript("blockController");
(this.block = null),
    (BlockController.prototype.initialize = function() {}),
    (BlockController.prototype.Init = function(o) {
        this.block = o;
    }),
    (BlockController.prototype.Hit = function(o) {
        0 !== this.block.kind &&
            !0 === o &&
            (GameClient.Socket.emit("destroyBlock", {
                room: GameClient.joinedServerName,
                id: this.block.id,
            }),
            (this.entity.enabled = !1));
    }),
    (BlockController.prototype.DestroyBlock = function() {
        this.entity.destroy();
    }),
    (BlockController.prototype.update = function(o) {});
var LookAtcamera = pc.createScript("lookAtcamera");
(LookAtcamera.prototype.initialize = function() {}),
    (LookAtcamera.prototype.update = function(e) {
        var t = new pc.Vec3();
        ((t = Game.Camera.getEulerAngles()).x += 90), this.entity.setEulerAngles(t);
    });
var PowerUp = pc.createScript("powerUp");
PowerUp.attributes.add("materials", {
    type: "asset",
    assetType: "material",
    array: !0,
}),
    (PowerUp.prototype.initialize = function() {
        (this.powerup = null),
            (this.kind = 0),
            (this.sprite = this.entity.findByName("PowerUpSprite")),
            (this.hasBeenConsumed = !1),
            (this.entityThatConsumedIt = null),
            (this.timer = 0),
            this.entity.collision.on("triggerenter", this.onTriggerEnter, this);
    }),
    (PowerUp.prototype.Init = function(t) {
        (this.powerup = t),
            this.entity.setPosition(this.powerup.x, 0.5, this.powerup.z),
            (this.sprite.model.materialAsset = this.materials[parseInt(this.powerup.item)]);
    }),
    (PowerUp.prototype.Consume = function(t) {
        (this.entityThatConsumedIt = t), (this.hasBeenConsumed = !0), this.entity.sound.play("consume");
    }),
    (PowerUp.prototype.onTriggerEnter = function(t) {
        t.script.movement &&
            !0 === t.script.movement.owner.isMine &&
            !1 === this.hasBeenConsumed &&
            GameClient.Socket.emit("consumePowerup", {
                room: GameClient.joinedServerName,
                id: this.powerup.id,
                consumerId: GameClient.identification,
            });
    }),
    (PowerUp.prototype.update = function(t) {
        if (!0 === this.hasBeenConsumed) {
            if (((this.timer += t), this.entityThatConsumedIt)) {
                var e = new pc.Vec3();
                e.lerp(this.entity.getPosition(), this.entityThatConsumedIt.entity.getPosition(), 0.2);
                var i = new pc.Vec3();
                i.lerp(this.entity.getLocalScale(), new pc.Vec3(0, 0, 0), 0.2),
                    this.entity.setPosition(e),
                    this.entity.setLocalScale(i);
            }
            this.timer > 0.15 && this.entity.destroy();
        }
    });
var CryptoJS =
    CryptoJS ||
    (function(t, e) {
        var r = {},
            i = (r.lib = {}),
            n = function() {},
            s = (i.Base = {
                extend: function(t) {
                    n.prototype = this;
                    var e = new n();
                    return (
                        t && e.mixIn(t),
                        e.hasOwnProperty("init") ||
                            (e.init = function() {
                                e.$super.init.apply(this, arguments);
                            }),
                        (e.init.prototype = e),
                        (e.$super = this),
                        e
                    );
                },
                create: function() {
                    var t = this.extend();
                    return t.init.apply(t, arguments), t;
                },
                init: function() {},
                mixIn: function(t) {
                    for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
                    t.hasOwnProperty("toString") && (this.toString = t.toString);
                },
                clone: function() {
                    return this.init.prototype.extend(this);
                },
            }),
            o = (i.WordArray = s.extend({
                init: function(t, e) {
                    (t = this.words = t || []), (this.sigBytes = null != e ? e : 4 * t.length);
                },
                toString: function(t) {
                    return (t || a).stringify(this);
                },
                concat: function(t) {
                    var e = this.words,
                        r = t.words,
                        i = this.sigBytes;
                    if (((t = t.sigBytes), this.clamp(), i % 4))
                        for (var n = 0; n < t; n++)
                            e[(i + n) >>> 2] |= ((r[n >>> 2] >>> (24 - (n % 4) * 8)) & 255) << (24 - ((i + n) % 4) * 8);
                    else if (65535 < r.length) for (n = 0; n < t; n += 4) e[(i + n) >>> 2] = r[n >>> 2];
                    else e.push.apply(e, r);
                    return (this.sigBytes += t), this;
                },
                clamp: function() {
                    var e = this.words,
                        r = this.sigBytes;
                    (e[r >>> 2] &= 4294967295 << (32 - (r % 4) * 8)), (e.length = t.ceil(r / 4));
                },
                clone: function() {
                    var t = s.clone.call(this);
                    return (t.words = this.words.slice(0)), t;
                },
                random: function(e) {
                    for (var r = [], i = 0; i < e; i += 4) r.push((4294967296 * t.random()) | 0);
                    return new o.init(r, e);
                },
            })),
            c = (r.enc = {}),
            a = (c.Hex = {
                stringify: function(t) {
                    var e = t.words;
                    t = t.sigBytes;
                    for (var r = [], i = 0; i < t; i++) {
                        var n = (e[i >>> 2] >>> (24 - (i % 4) * 8)) & 255;
                        r.push((n >>> 4).toString(16)), r.push((15 & n).toString(16));
                    }
                    return r.join("");
                },
                parse: function(t) {
                    for (var e = t.length, r = [], i = 0; i < e; i += 2)
                        r[i >>> 3] |= parseInt(t.substr(i, 2), 16) << (24 - (i % 8) * 4);
                    return new o.init(r, e / 2);
                },
            }),
            f = (c.Latin1 = {
                stringify: function(t) {
                    var e = t.words;
                    t = t.sigBytes;
                    for (var r = [], i = 0; i < t; i++)
                        r.push(String.fromCharCode((e[i >>> 2] >>> (24 - (i % 4) * 8)) & 255));
                    return r.join("");
                },
                parse: function(t) {
                    for (var e = t.length, r = [], i = 0; i < e; i++)
                        r[i >>> 2] |= (255 & t.charCodeAt(i)) << (24 - (i % 4) * 8);
                    return new o.init(r, e);
                },
            }),
            h = (c.Utf8 = {
                stringify: function(t) {
                    try {
                        return decodeURIComponent(escape(f.stringify(t)));
                    } catch (t) {
                        throw Error("Malformed UTF-8 data");
                    }
                },
                parse: function(t) {
                    return f.parse(unescape(encodeURIComponent(t)));
                },
            }),
            p = (i.BufferedBlockAlgorithm = s.extend({
                reset: function() {
                    (this._data = new o.init()), (this._nDataBytes = 0);
                },
                _append: function(t) {
                    "string" == typeof t && (t = h.parse(t)), this._data.concat(t), (this._nDataBytes += t.sigBytes);
                },
                _process: function(e) {
                    var r = this._data,
                        i = r.words,
                        n = r.sigBytes,
                        s = this.blockSize,
                        c = n / (4 * s);
                    if (
                        ((e = (c = e ? t.ceil(c) : t.max((0 | c) - this._minBufferSize, 0)) * s),
                        (n = t.min(4 * e, n)),
                        e)
                    ) {
                        for (var a = 0; a < e; a += s) this._doProcessBlock(i, a);
                        (a = i.splice(0, e)), (r.sigBytes -= n);
                    }
                    return new o.init(a, n);
                },
                clone: function() {
                    var t = s.clone.call(this);
                    return (t._data = this._data.clone()), t;
                },
                _minBufferSize: 0,
            }));
        i.Hasher = p.extend({
            cfg: s.extend(),
            init: function(t) {
                (this.cfg = this.cfg.extend(t)), this.reset();
            },
            reset: function() {
                p.reset.call(this), this._doReset();
            },
            update: function(t) {
                return this._append(t), this._process(), this;
            },
            finalize: function(t) {
                return t && this._append(t), this._doFinalize();
            },
            blockSize: 16,
            _createHelper: function(t) {
                return function(e, r) {
                    return new t.init(r).finalize(e);
                };
            },
            _createHmacHelper: function(t) {
                return function(e, r) {
                    return new u.HMAC.init(t, r).finalize(e);
                };
            },
        });
        var u = (r.algo = {});
        return r;
    })(Math);
!(function() {
    var t = CryptoJS,
        e = t.lib.WordArray;
    t.enc.Base64 = {
        stringify: function(t) {
            var e = t.words,
                r = t.sigBytes,
                i = this._map;
            t.clamp(), (t = []);
            for (var n = 0; n < r; n += 3)
                for (
                    var s =
                            (((e[n >>> 2] >>> (24 - (n % 4) * 8)) & 255) << 16) |
                            (((e[(n + 1) >>> 2] >>> (24 - ((n + 1) % 4) * 8)) & 255) << 8) |
                            ((e[(n + 2) >>> 2] >>> (24 - ((n + 2) % 4) * 8)) & 255),
                        o = 0;
                    4 > o && n + 0.75 * o < r;
                    o++
                )
                    t.push(i.charAt((s >>> (6 * (3 - o))) & 63));
            if ((e = i.charAt(64))) for (; t.length % 4; ) t.push(e);
            return t.join("");
        },
        parse: function(t) {
            var r = t.length,
                i = this._map;
            (n = i.charAt(64)) && (-1 != (n = t.indexOf(n)) && (r = n));
            for (var n = [], s = 0, o = 0; o < r; o++)
                if (o % 4) {
                    var c = i.indexOf(t.charAt(o - 1)) << ((o % 4) * 2),
                        a = i.indexOf(t.charAt(o)) >>> (6 - (o % 4) * 2);
                    (n[s >>> 2] |= (c | a) << (24 - (s % 4) * 8)), s++;
                }
            return e.create(n, s);
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    };
})(),
    (function(t) {
        function p(t, e, r, i, n, s, o) {
            return (((t = t + ((e & r) | (~e & i)) + n + o) << s) | (t >>> (32 - s))) + e;
        }

        function d(t, e, r, i, n, s, o) {
            return (((t = t + ((e & i) | (r & ~i)) + n + o) << s) | (t >>> (32 - s))) + e;
        }

        function l(t, e, r, i, n, s, o) {
            return (((t = t + (e ^ r ^ i) + n + o) << s) | (t >>> (32 - s))) + e;
        }

        function s(t, e, r, i, n, s, o) {
            return (((t = t + (r ^ (e | ~i)) + n + o) << s) | (t >>> (32 - s))) + e;
        }

        for (var e = CryptoJS, r = (n = e.lib).WordArray, i = n.Hasher, n = e.algo, o = [], c = 0; 64 > c; c++)
            o[c] = (4294967296 * t.abs(t.sin(c + 1))) | 0;
        (n = n.MD5 = i.extend({
            _doReset: function() {
                this._hash = new r.init([1732584193, 4023233417, 2562383102, 271733878]);
            },
            _doProcessBlock: function(t, e) {
                for (var r = 0; 16 > r; r++) {
                    var i = t[(a = e + r)];
                    t[a] = (16711935 & ((i << 8) | (i >>> 24))) | (4278255360 & ((i << 24) | (i >>> 8)));
                }
                r = this._hash.words;
                var n,
                    c,
                    a = t[e + 0],
                    f = ((i = t[e + 1]), t[e + 2]),
                    h = t[e + 3],
                    u = t[e + 4],
                    y = t[e + 5],
                    _ = t[e + 6],
                    v = t[e + 7],
                    g = t[e + 8],
                    B = t[e + 9],
                    x = t[e + 10],
                    S = t[e + 11],
                    k = t[e + 12],
                    m = t[e + 13],
                    z = t[e + 14],
                    C = t[e + 15],
                    w = r[0],
                    D = s(
                        (D = s(
                            (D = s(
                                (D = s(
                                    (D = l(
                                        (D = l(
                                            (D = l(
                                                (D = l(
                                                    (D = d(
                                                        (D = d(
                                                            (D = d(
                                                                (D = d(
                                                                    (D = p(
                                                                        (D = p(
                                                                            (D = p(
                                                                                (D = p(
                                                                                    (D = r[1]),
                                                                                    (c = p(
                                                                                        (c = r[2]),
                                                                                        (n = p(
                                                                                            (n = r[3]),
                                                                                            (w = p(
                                                                                                w,
                                                                                                D,
                                                                                                c,
                                                                                                n,
                                                                                                a,
                                                                                                7,
                                                                                                o[0]
                                                                                            )),
                                                                                            D,
                                                                                            c,
                                                                                            i,
                                                                                            12,
                                                                                            o[1]
                                                                                        )),
                                                                                        w,
                                                                                        D,
                                                                                        f,
                                                                                        17,
                                                                                        o[2]
                                                                                    )),
                                                                                    n,
                                                                                    w,
                                                                                    h,
                                                                                    22,
                                                                                    o[3]
                                                                                )),
                                                                                (c = p(
                                                                                    c,
                                                                                    (n = p(
                                                                                        n,
                                                                                        (w = p(w, D, c, n, u, 7, o[4])),
                                                                                        D,
                                                                                        c,
                                                                                        y,
                                                                                        12,
                                                                                        o[5]
                                                                                    )),
                                                                                    w,
                                                                                    D,
                                                                                    _,
                                                                                    17,
                                                                                    o[6]
                                                                                )),
                                                                                n,
                                                                                w,
                                                                                v,
                                                                                22,
                                                                                o[7]
                                                                            )),
                                                                            (c = p(
                                                                                c,
                                                                                (n = p(
                                                                                    n,
                                                                                    (w = p(w, D, c, n, g, 7, o[8])),
                                                                                    D,
                                                                                    c,
                                                                                    B,
                                                                                    12,
                                                                                    o[9]
                                                                                )),
                                                                                w,
                                                                                D,
                                                                                x,
                                                                                17,
                                                                                o[10]
                                                                            )),
                                                                            n,
                                                                            w,
                                                                            S,
                                                                            22,
                                                                            o[11]
                                                                        )),
                                                                        (c = p(
                                                                            c,
                                                                            (n = p(
                                                                                n,
                                                                                (w = p(w, D, c, n, k, 7, o[12])),
                                                                                D,
                                                                                c,
                                                                                m,
                                                                                12,
                                                                                o[13]
                                                                            )),
                                                                            w,
                                                                            D,
                                                                            z,
                                                                            17,
                                                                            o[14]
                                                                        )),
                                                                        n,
                                                                        w,
                                                                        C,
                                                                        22,
                                                                        o[15]
                                                                    )),
                                                                    (c = d(
                                                                        c,
                                                                        (n = d(
                                                                            n,
                                                                            (w = d(w, D, c, n, i, 5, o[16])),
                                                                            D,
                                                                            c,
                                                                            _,
                                                                            9,
                                                                            o[17]
                                                                        )),
                                                                        w,
                                                                        D,
                                                                        S,
                                                                        14,
                                                                        o[18]
                                                                    )),
                                                                    n,
                                                                    w,
                                                                    a,
                                                                    20,
                                                                    o[19]
                                                                )),
                                                                (c = d(
                                                                    c,
                                                                    (n = d(
                                                                        n,
                                                                        (w = d(w, D, c, n, y, 5, o[20])),
                                                                        D,
                                                                        c,
                                                                        x,
                                                                        9,
                                                                        o[21]
                                                                    )),
                                                                    w,
                                                                    D,
                                                                    C,
                                                                    14,
                                                                    o[22]
                                                                )),
                                                                n,
                                                                w,
                                                                u,
                                                                20,
                                                                o[23]
                                                            )),
                                                            (c = d(
                                                                c,
                                                                (n = d(
                                                                    n,
                                                                    (w = d(w, D, c, n, B, 5, o[24])),
                                                                    D,
                                                                    c,
                                                                    z,
                                                                    9,
                                                                    o[25]
                                                                )),
                                                                w,
                                                                D,
                                                                h,
                                                                14,
                                                                o[26]
                                                            )),
                                                            n,
                                                            w,
                                                            g,
                                                            20,
                                                            o[27]
                                                        )),
                                                        (c = d(
                                                            c,
                                                            (n = d(
                                                                n,
                                                                (w = d(w, D, c, n, m, 5, o[28])),
                                                                D,
                                                                c,
                                                                f,
                                                                9,
                                                                o[29]
                                                            )),
                                                            w,
                                                            D,
                                                            v,
                                                            14,
                                                            o[30]
                                                        )),
                                                        n,
                                                        w,
                                                        k,
                                                        20,
                                                        o[31]
                                                    )),
                                                    (c = l(
                                                        c,
                                                        (n = l(
                                                            n,
                                                            (w = l(w, D, c, n, y, 4, o[32])),
                                                            D,
                                                            c,
                                                            g,
                                                            11,
                                                            o[33]
                                                        )),
                                                        w,
                                                        D,
                                                        S,
                                                        16,
                                                        o[34]
                                                    )),
                                                    n,
                                                    w,
                                                    z,
                                                    23,
                                                    o[35]
                                                )),
                                                (c = l(
                                                    c,
                                                    (n = l(n, (w = l(w, D, c, n, i, 4, o[36])), D, c, u, 11, o[37])),
                                                    w,
                                                    D,
                                                    v,
                                                    16,
                                                    o[38]
                                                )),
                                                n,
                                                w,
                                                x,
                                                23,
                                                o[39]
                                            )),
                                            (c = l(
                                                c,
                                                (n = l(n, (w = l(w, D, c, n, m, 4, o[40])), D, c, a, 11, o[41])),
                                                w,
                                                D,
                                                h,
                                                16,
                                                o[42]
                                            )),
                                            n,
                                            w,
                                            _,
                                            23,
                                            o[43]
                                        )),
                                        (c = l(
                                            c,
                                            (n = l(n, (w = l(w, D, c, n, B, 4, o[44])), D, c, k, 11, o[45])),
                                            w,
                                            D,
                                            C,
                                            16,
                                            o[46]
                                        )),
                                        n,
                                        w,
                                        f,
                                        23,
                                        o[47]
                                    )),
                                    (c = s(
                                        c,
                                        (n = s(n, (w = s(w, D, c, n, a, 6, o[48])), D, c, v, 10, o[49])),
                                        w,
                                        D,
                                        z,
                                        15,
                                        o[50]
                                    )),
                                    n,
                                    w,
                                    y,
                                    21,
                                    o[51]
                                )),
                                (c = s(
                                    c,
                                    (n = s(n, (w = s(w, D, c, n, k, 6, o[52])), D, c, h, 10, o[53])),
                                    w,
                                    D,
                                    x,
                                    15,
                                    o[54]
                                )),
                                n,
                                w,
                                i,
                                21,
                                o[55]
                            )),
                            (c = s(
                                c,
                                (n = s(n, (w = s(w, D, c, n, g, 6, o[56])), D, c, C, 10, o[57])),
                                w,
                                D,
                                _,
                                15,
                                o[58]
                            )),
                            n,
                            w,
                            m,
                            21,
                            o[59]
                        )),
                        (c = s(
                            c,
                            (n = s(n, (w = s(w, D, c, n, u, 6, o[60])), D, c, S, 10, o[61])),
                            w,
                            D,
                            f,
                            15,
                            o[62]
                        )),
                        n,
                        w,
                        B,
                        21,
                        o[63]
                    );
                (r[0] = (r[0] + w) | 0), (r[1] = (r[1] + D) | 0), (r[2] = (r[2] + c) | 0), (r[3] = (r[3] + n) | 0);
            },
            _doFinalize: function() {
                var e = this._data,
                    r = e.words,
                    i = 8 * this._nDataBytes,
                    n = 8 * e.sigBytes;
                r[n >>> 5] |= 128 << (24 - (n % 32));
                var s = t.floor(i / 4294967296);
                for (
                    r[15 + (((n + 64) >>> 9) << 4)] =
                        (16711935 & ((s << 8) | (s >>> 24))) | (4278255360 & ((s << 24) | (s >>> 8))),
                        r[14 + (((n + 64) >>> 9) << 4)] =
                            (16711935 & ((i << 8) | (i >>> 24))) | (4278255360 & ((i << 24) | (i >>> 8))),
                        e.sigBytes = 4 * (r.length + 1),
                        this._process(),
                        r = (e = this._hash).words,
                        i = 0;
                    4 > i;
                    i++
                )
                    (n = r[i]), (r[i] = (16711935 & ((n << 8) | (n >>> 24))) | (4278255360 & ((n << 24) | (n >>> 8))));
                return e;
            },
            clone: function() {
                var t = i.clone.call(this);
                return (t._hash = this._hash.clone()), t;
            },
        })),
            (e.MD5 = i._createHelper(n)),
            (e.HmacMD5 = i._createHmacHelper(n));
    })(Math),
    (function() {
        var t,
            e = CryptoJS,
            r = (t = e.lib).Base,
            i = t.WordArray,
            n = ((t = e.algo).EvpKDF = r.extend({
                cfg: r.extend({ keySize: 4, hasher: t.MD5, iterations: 1 }),
                init: function(t) {
                    this.cfg = this.cfg.extend(t);
                },
                compute: function(t, e) {
                    for (
                        var r = (c = this.cfg).hasher.create(),
                            n = i.create(),
                            s = n.words,
                            o = c.keySize,
                            c = c.iterations;
                        s.length < o;

                    ) {
                        a && r.update(a);
                        var a = r.update(t).finalize(e);
                        r.reset();
                        for (var f = 1; f < c; f++) (a = r.finalize(a)), r.reset();
                        n.concat(a);
                    }
                    return (n.sigBytes = 4 * o), n;
                },
            }));
        e.EvpKDF = function(t, e, r) {
            return n.create(r).compute(t, e);
        };
    })(),
    CryptoJS.lib.Cipher ||
        (function(t) {
            var e = (d = CryptoJS).lib,
                r = e.Base,
                i = e.WordArray,
                n = e.BufferedBlockAlgorithm,
                s = d.enc.Base64,
                o = d.algo.EvpKDF,
                c = (e.Cipher = n.extend({
                    cfg: r.extend(),
                    createEncryptor: function(t, e) {
                        return this.create(this._ENC_XFORM_MODE, t, e);
                    },
                    createDecryptor: function(t, e) {
                        return this.create(this._DEC_XFORM_MODE, t, e);
                    },
                    init: function(t, e, r) {
                        (this.cfg = this.cfg.extend(r)), (this._xformMode = t), (this._key = e), this.reset();
                    },
                    reset: function() {
                        n.reset.call(this), this._doReset();
                    },
                    process: function(t) {
                        return this._append(t), this._process();
                    },
                    finalize: function(t) {
                        return t && this._append(t), this._doFinalize();
                    },
                    keySize: 4,
                    ivSize: 4,
                    _ENC_XFORM_MODE: 1,
                    _DEC_XFORM_MODE: 2,
                    _createHelper: function(t) {
                        return {
                            encrypt: function(e, r, i) {
                                return ("string" == typeof r ? l : u).encrypt(t, e, r, i);
                            },
                            decrypt: function(e, r, i) {
                                return ("string" == typeof r ? l : u).decrypt(t, e, r, i);
                            },
                        };
                    },
                }));
            e.StreamCipher = c.extend({
                _doFinalize: function() {
                    return this._process(!0);
                },
                blockSize: 1,
            });
            var a = (d.mode = {}),
                f = function(t, e, r) {
                    var i = this._iv;
                    i ? (this._iv = void 0) : (i = this._prevBlock);
                    for (var n = 0; n < r; n++) t[e + n] ^= i[n];
                },
                h = (e.BlockCipherMode = r.extend({
                    createEncryptor: function(t, e) {
                        return this.Encryptor.create(t, e);
                    },
                    createDecryptor: function(t, e) {
                        return this.Decryptor.create(t, e);
                    },
                    init: function(t, e) {
                        (this._cipher = t), (this._iv = e);
                    },
                })).extend();
            (h.Encryptor = h.extend({
                processBlock: function(t, e) {
                    var r = this._cipher,
                        i = r.blockSize;
                    f.call(this, t, e, i), r.encryptBlock(t, e), (this._prevBlock = t.slice(e, e + i));
                },
            })),
                (h.Decryptor = h.extend({
                    processBlock: function(t, e) {
                        var r = this._cipher,
                            i = r.blockSize,
                            n = t.slice(e, e + i);
                        r.decryptBlock(t, e), f.call(this, t, e, i), (this._prevBlock = n);
                    },
                })),
                (a = a.CBC = h),
                (h = (d.pad = {}).Pkcs7 = {
                    pad: function(t, e) {
                        for (
                            var r,
                                n = ((r = (r = 4 * e) - (t.sigBytes % r)) << 24) | (r << 16) | (r << 8) | r,
                                s = [],
                                o = 0;
                            o < r;
                            o += 4
                        )
                            s.push(n);
                        (r = i.create(s, r)), t.concat(r);
                    },
                    unpad: function(t) {
                        t.sigBytes -= 255 & t.words[(t.sigBytes - 1) >>> 2];
                    },
                }),
                (e.BlockCipher = c.extend({
                    cfg: c.cfg.extend({ mode: a, padding: h }),
                    reset: function() {
                        c.reset.call(this);
                        var t = (e = this.cfg).iv,
                            e = e.mode;
                        if (this._xformMode == this._ENC_XFORM_MODE) var r = e.createEncryptor;
                        else (r = e.createDecryptor), (this._minBufferSize = 1);
                        this._mode = r.call(e, this, t && t.words);
                    },
                    _doProcessBlock: function(t, e) {
                        this._mode.processBlock(t, e);
                    },
                    _doFinalize: function() {
                        var t = this.cfg.padding;
                        if (this._xformMode == this._ENC_XFORM_MODE) {
                            t.pad(this._data, this.blockSize);
                            var e = this._process(!0);
                        } else (e = this._process(!0)), t.unpad(e);
                        return e;
                    },
                    blockSize: 4,
                }));
            var p = (e.CipherParams = r.extend({
                    init: function(t) {
                        this.mixIn(t);
                    },
                    toString: function(t) {
                        return (t || this.formatter).stringify(this);
                    },
                })),
                u = ((a = (d.format = {}).OpenSSL = {
                    stringify: function(t) {
                        var e = t.ciphertext;
                        return ((t = t.salt)
                            ? i
                                  .create([1398893684, 1701076831])
                                  .concat(t)
                                  .concat(e)
                            : e
                        ).toString(s);
                    },
                    parse: function(t) {
                        var e = (t = s.parse(t)).words;
                        if (1398893684 == e[0] && 1701076831 == e[1]) {
                            var r = i.create(e.slice(2, 4));
                            e.splice(0, 4), (t.sigBytes -= 16);
                        }
                        return p.create({ ciphertext: t, salt: r });
                    },
                }),
                (e.SerializableCipher = r.extend({
                    cfg: r.extend({ format: a }),
                    encrypt: function(t, e, r, i) {
                        i = this.cfg.extend(i);
                        var n = t.createEncryptor(r, i);
                        return (
                            (e = n.finalize(e)),
                            (n = n.cfg),
                            p.create({
                                ciphertext: e,
                                key: r,
                                iv: n.iv,
                                algorithm: t,
                                mode: n.mode,
                                padding: n.padding,
                                blockSize: t.blockSize,
                                formatter: i.format,
                            })
                        );
                    },
                    decrypt: function(t, e, r, i) {
                        return (
                            (i = this.cfg.extend(i)),
                            (e = this._parse(e, i.format)),
                            t.createDecryptor(r, i).finalize(e.ciphertext)
                        );
                    },
                    _parse: function(t, e) {
                        return "string" == typeof t ? e.parse(t, this) : t;
                    },
                }))),
                d = ((d.kdf = {}).OpenSSL = {
                    execute: function(t, e, r, n) {
                        return (
                            n || (n = i.random(8)),
                            (t = o.create({ keySize: e + r }).compute(t, n)),
                            (r = i.create(t.words.slice(e), 4 * r)),
                            (t.sigBytes = 4 * e),
                            p.create({ key: t, iv: r, salt: n })
                        );
                    },
                }),
                l = (e.PasswordBasedCipher = u.extend({
                    cfg: u.cfg.extend({ kdf: d }),
                    encrypt: function(t, e, r, i) {
                        return (
                            (r = (i = this.cfg.extend(i)).kdf.execute(r, t.keySize, t.ivSize)),
                            (i.iv = r.iv),
                            (t = u.encrypt.call(this, t, e, r.key, i)).mixIn(r),
                            t
                        );
                    },
                    decrypt: function(t, e, r, i) {
                        return (
                            (i = this.cfg.extend(i)),
                            (e = this._parse(e, i.format)),
                            (r = i.kdf.execute(r, t.keySize, t.ivSize, e.salt)),
                            (i.iv = r.iv),
                            u.decrypt.call(this, t, e, r.key, i)
                        );
                    },
                }));
        })(),
    (function() {
        for (
            var t = CryptoJS,
                e = t.lib.BlockCipher,
                r = t.algo,
                i = [],
                n = [],
                s = [],
                o = [],
                c = [],
                a = [],
                f = [],
                h = [],
                p = [],
                u = [],
                d = [],
                l = 0;
            256 > l;
            l++
        )
            d[l] = 128 > l ? l << 1 : (l << 1) ^ 283;
        var y = 0,
            _ = 0;
        for (l = 0; 256 > l; l++) {
            var v = ((v = _ ^ (_ << 1) ^ (_ << 2) ^ (_ << 3) ^ (_ << 4)) >>> 8) ^ (255 & v) ^ 99;
            (i[y] = v), (n[v] = y);
            var g = d[y],
                B = d[g],
                x = d[B],
                S = (257 * d[v]) ^ (16843008 * v);
            (s[y] = (S << 24) | (S >>> 8)),
                (o[y] = (S << 16) | (S >>> 16)),
                (c[y] = (S << 8) | (S >>> 24)),
                (a[y] = S),
                (S = (16843009 * x) ^ (65537 * B) ^ (257 * g) ^ (16843008 * y)),
                (f[v] = (S << 24) | (S >>> 8)),
                (h[v] = (S << 16) | (S >>> 16)),
                (p[v] = (S << 8) | (S >>> 24)),
                (u[v] = S),
                y ? ((y = g ^ d[d[d[x ^ g]]]), (_ ^= d[d[_]])) : (y = _ = 1);
        }
        var k = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
        r = r.AES = e.extend({
            _doReset: function() {
                for (
                    var t = (r = this._key).words,
                        e = r.sigBytes / 4,
                        r = 4 * ((this._nRounds = e + 6) + 1),
                        n = (this._keySchedule = []),
                        s = 0;
                    s < r;
                    s++
                )
                    if (s < e) n[s] = t[s];
                    else {
                        var o = n[s - 1];
                        s % e
                            ? 6 < e &&
                              4 == s % e &&
                              (o =
                                  (i[o >>> 24] << 24) |
                                  (i[(o >>> 16) & 255] << 16) |
                                  (i[(o >>> 8) & 255] << 8) |
                                  i[255 & o])
                            : ((o =
                                  (i[(o = (o << 8) | (o >>> 24)) >>> 24] << 24) |
                                  (i[(o >>> 16) & 255] << 16) |
                                  (i[(o >>> 8) & 255] << 8) |
                                  i[255 & o]),
                              (o ^= k[(s / e) | 0] << 24)),
                            (n[s] = n[s - e] ^ o);
                    }
                for (t = this._invKeySchedule = [], e = 0; e < r; e++)
                    (s = r - e),
                        (o = e % 4 ? n[s] : n[s - 4]),
                        (t[e] =
                            4 > e || 4 >= s
                                ? o
                                : f[i[o >>> 24]] ^ h[i[(o >>> 16) & 255]] ^ p[i[(o >>> 8) & 255]] ^ u[i[255 & o]]);
            },
            encryptBlock: function(t, e) {
                this._doCryptBlock(t, e, this._keySchedule, s, o, c, a, i);
            },
            decryptBlock: function(t, e) {
                var r = t[e + 1];
                (t[e + 1] = t[e + 3]),
                    (t[e + 3] = r),
                    this._doCryptBlock(t, e, this._invKeySchedule, f, h, p, u, n),
                    (r = t[e + 1]),
                    (t[e + 1] = t[e + 3]),
                    (t[e + 3] = r);
            },
            _doCryptBlock: function(t, e, r, i, n, s, o, c) {
                for (
                    var a = this._nRounds,
                        f = t[e] ^ r[0],
                        h = t[e + 1] ^ r[1],
                        p = t[e + 2] ^ r[2],
                        u = t[e + 3] ^ r[3],
                        d = 4,
                        l = 1;
                    l < a;
                    l++
                ) {
                    var y = i[f >>> 24] ^ n[(h >>> 16) & 255] ^ s[(p >>> 8) & 255] ^ o[255 & u] ^ r[d++],
                        _ = i[h >>> 24] ^ n[(p >>> 16) & 255] ^ s[(u >>> 8) & 255] ^ o[255 & f] ^ r[d++],
                        v = i[p >>> 24] ^ n[(u >>> 16) & 255] ^ s[(f >>> 8) & 255] ^ o[255 & h] ^ r[d++];
                    (u = i[u >>> 24] ^ n[(f >>> 16) & 255] ^ s[(h >>> 8) & 255] ^ o[255 & p] ^ r[d++]),
                        (f = y),
                        (h = _),
                        (p = v);
                }
                (y =
                    ((c[f >>> 24] << 24) | (c[(h >>> 16) & 255] << 16) | (c[(p >>> 8) & 255] << 8) | c[255 & u]) ^
                    r[d++]),
                    (_ =
                        ((c[h >>> 24] << 24) | (c[(p >>> 16) & 255] << 16) | (c[(u >>> 8) & 255] << 8) | c[255 & f]) ^
                        r[d++]),
                    (v =
                        ((c[p >>> 24] << 24) | (c[(u >>> 16) & 255] << 16) | (c[(f >>> 8) & 255] << 8) | c[255 & h]) ^
                        r[d++]),
                    (u =
                        ((c[u >>> 24] << 24) | (c[(f >>> 16) & 255] << 16) | (c[(h >>> 8) & 255] << 8) | c[255 & p]) ^
                        r[d++]),
                    (t[e] = y),
                    (t[e + 1] = _),
                    (t[e + 2] = v),
                    (t[e + 3] = u);
            },
            keySize: 8,
        });
        t.AES = e._createHelper(r);
    })(); // hud.js
var Hud = pc.createScript("hud");

this.infoBoxText = "Info Text";
this.alreadyShownFirstTwo = false;

// initialize code called once per entity
Hud.prototype.initialize = function() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    this.infoBoxText = "infoText";

    // create the ui elements
    // MAIN-DIV
    var hudDiv = document.createElement("div");
    hudDiv.style.position = "absolute";
    hudDiv.style.width = "100%";
    hudDiv.style.height = "100%";
    hudDiv.id = "ui";
    document.body.appendChild(hudDiv);
    // CENTERED-DIV
    Hud.centerOfScreen = document.createElement("div");
    Hud.centerOfScreen.id = "center";
    Hud.centerOfScreen.style.position = "absolute";
    Hud.centerOfScreen.style.top = "5%";
    Hud.centerOfScreen.style.width = "100%";
    Hud.centerOfScreen.style.display = "block";
    hudDiv.appendChild(Hud.centerOfScreen);
    // logo
    Hud.logo = document.createElement("div");
    Hud.logo.style.backgroundImage =
        "url('https://tk-assets.sfo2.digitaloceanspaces.com/bombertron/bombertron/bombertron.png')";
    Hud.logo.style.backgroundSize = "contain";
    //Hud.logo.style.backgroundColor = "gray";
    Hud.logo.style.backgroundPosition = "center";
    Hud.logo.style.backgroundRepeat = "no-repeat";
    Hud.logo.style.display = "block";
    Hud.logo.style.maxWidth = "600px";
    Hud.logo.style.height = "200px";
    Hud.logo.style.margin = "0px auto";
    Hud.centerOfScreen.appendChild(Hud.logo);

    // players connected
    Hud.world = document.createElement("div");
    Hud.world.style.display = "block";
    Hud.world.id = "world";
    // Hud.world.innerHTML = "<span style='display:block;height:8px;width:100%'></span>";
    Hud.centerOfScreen.appendChild(Hud.world);

    // Connected players overall
    Hud.connectedPlayers = document.createElement("p");
    Hud.connectedPlayers.style.display = "block";
    Hud.connectedPlayers.style.color = "white";
    Hud.connectedPlayers.style.fontFamily = "futura-pt";
    Hud.connectedPlayers.style.fontSize = "14px";
    Hud.connectedPlayers.style.textAlign = "center";
    Hud.connectedPlayers.style.width = "400px";
    Hud.connectedPlayers.innerHTML = "· Gathering data ·";
    Hud.world.appendChild(Hud.connectedPlayers);

    // login
    Hud.login = document.createElement("div");
    Hud.login.style.display = "block";
    Hud.login.id = "login";
    Hud.login.innerHTML = "<span style='display:block;height:8px;width:100%'></span>";
    Hud.centerOfScreen.appendChild(Hud.login);

    Hud.loginPlayerInfo = document.createElement("div");
    Hud.loginPlayerInfo.style.display = "block";
    Hud.loginPlayerInfo.style.width = "94.5%";
    Hud.loginPlayerInfo.style.height = "70px";
    Hud.loginPlayerInfo.style.margin = "0px auto";
    Hud.loginPlayerInfo.style.borderRadius = "3px";
    Hud.loginPlayerInfo.style.backgroundColor = "#F2F2F2";
    Hud.loginPlayerInfo.style.boxShadow = "0px 0px 1px black";
    Hud.login.appendChild(Hud.loginPlayerInfo);

    Hud.loginPlayerInfoRank = document.createElement("div");
    Hud.loginPlayerInfoRank.style.display = "inline-block";
    Hud.loginPlayerInfoRank.style.width = "60px";
    Hud.loginPlayerInfoRank.style.height = "60px";
    Hud.loginPlayerInfoRank.style.borderRadius = "100px";
    Hud.loginPlayerInfoRank.style.backgroundColor = "white";
    Hud.loginPlayerInfoRank.style.marginLeft = "10px";
    Hud.loginPlayerInfoRank.style.marginTop = "5px";
    Hud.loginPlayerInfoRank.style.textAlign = "center";
    Hud.loginPlayerInfoRank.style.lineHeight = "60px";
    Hud.loginPlayerInfoRank.style.color = "#FF8000";
    Hud.loginPlayerInfoRank.style.fontWeight = "bold";
    Hud.loginPlayerInfoRank.style.boxShadow = "0px 0px 5px orange";
    Hud.loginPlayerInfoRank.innerHTML = "#777";
    Hud.loginPlayerInfo.appendChild(Hud.loginPlayerInfoRank);

    Hud.loginUsernameInput = document.createElement("input");
    Hud.loginUsernameInput.style.display = "inline-block";
    Hud.loginUsernameInput.className = "username";
    Hud.loginUsernameInput.placeholder = "Name here";
    Hud.loginPlayerInfo.appendChild(Hud.loginUsernameInput);

    Hud.loginPlayerInfoPts = document.createElement("p");
    Hud.loginPlayerInfoPts.style.display = "inline-block";
    Hud.loginPlayerInfoPts.style.position = "absolute";
    Hud.loginPlayerInfoPts.style.marginLeft = "255px";
    Hud.loginPlayerInfoPts.style.fontWeight = "bold";
    Hud.loginPlayerInfoPts.style.fontSize = "20px";
    Hud.loginPlayerInfoPts.style.width = "50px";
    Hud.loginPlayerInfoPts.style.textAlign = "center";
    Hud.loginPlayerInfoPts.innerHTML =
        '777<br><span style="display:block;font-weight:normal;font-size:12px;margin-top:-7px;">pts</span>';
    Hud.loginPlayerInfo.appendChild(Hud.loginPlayerInfoPts);

    Hud.diamondButton = document.createElement("a");
    Hud.diamondButton.id = "diamond";
    Hud.diamondButton.className = window.tronWeb ? "diamond" : "diamond trx-disabled";
    Hud.diamondButton.innerHTML = "Diamond Lobby (10K TRX)";
    Hud.diamondButton.href = "#";
    Hud.diamondButton.onclick = () => {
        LobbyClient.selectLobby("diamond");

        return false;
    };
    Hud.login.appendChild(Hud.diamondButton);

    Hud.platinumButton = document.createElement("a");
    Hud.platinumButton.id = "platinum";
    Hud.platinumButton.className = window.tronWeb ? "platinum" : "platinum trx-disabled";
    Hud.platinumButton.innerHTML = "Platinum Lobby (5K TRX)";
    Hud.platinumButton.href = "#";
    Hud.platinumButton.onclick = () => {
        LobbyClient.selectLobby("platinum");

        return false;
    };
    Hud.login.appendChild(Hud.platinumButton);

    Hud.goldButton = document.createElement("a");
    Hud.goldButton.id = "gold";
    Hud.goldButton.className = window.tronWeb ? "gold" : "gold trx-disabled";
    Hud.goldButton.innerHTML = "Gold Lobby (1K TRX)";
    Hud.goldButton.href = "#";
    Hud.goldButton.onclick = () => {
        LobbyClient.selectLobby("gold");

        return false;
    };
    Hud.login.appendChild(Hud.goldButton);

    Hud.silverButton = document.createElement("a");
    Hud.silverButton.id = "silver";
    Hud.silverButton.className = window.tronWeb ? "silver" : "silver trx-disabled";
    Hud.silverButton.innerHTML = "Silver Lobby (500 TRX)";
    Hud.silverButton.href = "#";
    Hud.silverButton.onclick = () => {
        LobbyClient.selectLobby("silver");

        return false;
    };
    Hud.login.appendChild(Hud.silverButton);

    Hud.bronzeButton = document.createElement("a");
    Hud.bronzeButton.id = "bronze";
    Hud.bronzeButton.className = window.tronWeb ? "bronze" : "bronze trx-disabled";
    Hud.bronzeButton.innerHTML = "Bronze Lobby (100 TRX)";
    Hud.bronzeButton.href = "#";
    Hud.bronzeButton.onclick = () => {
        LobbyClient.selectLobby("bronze");

        return false;
    };
    Hud.login.appendChild(Hud.bronzeButton);

    Hud.playButton = document.createElement("a");
    Hud.playButton.id = "play";
    Hud.playButton.className = GameClient.gameId ? "play" : "play trx-disabled";
    Hud.playButton.innerHTML = "Play";
    Hud.playButton.href = "#";
    Hud.playButton.onclick = (event) => {
        const gameId = GameClient.gameId
            ? GameClient.gameId
            : event.target.dataset.gameId
            ? event.target.dataset.gameId
            : null;

        if (gameId) {
            GatewayClient.JoinNearestRegion();
        }

        return false;
    };
    Hud.login.appendChild(Hud.playButton);

    Hud.seeRankingBttn = document.createElement("a");
    Hud.seeRankingBttn.id = "ranking";
    Hud.seeRankingBttn.className = "ranking";
    Hud.seeRankingBttn.innerHTML = "Ranking";
    Hud.seeRankingBttn.href = "#";
    Hud.seeRankingBttn.onclick = () => {
        Hud.ShowRanking();

        return false;
    };
    Hud.login.appendChild(Hud.seeRankingBttn);

    // Game Over Screen
    Hud.gameOver = document.createElement("div");
    Hud.gameOver.id = "gameover";
    Hud.centerOfScreen.appendChild(Hud.gameOver);

    Hud.gameOverH1 = document.createElement("h1");
    Hud.gameOverH1.style.textAlign = "center";
    Hud.gameOverH1.style.textShadow = "3px 3px 0px #EDC872";
    Hud.gameOverH1.style.color = "black";
    Hud.gameOverH1.style.fontFamily = "futura-pt";
    Hud.gameOverH1.style.width = "100%";
    Hud.gameOverH1.innerHTML = "Game Over";
    Hud.gameOver.appendChild(Hud.gameOverH1);

    Hud.positionInfo = document.createElement("p");
    Hud.positionInfo.style.textAlign = "center";

    Hud.gameOver.appendChild(Hud.positionInfo);

    Hud.playAgain = document.createElement("a");
    Hud.playAgain.className = "play";
    Hud.playAgain.innerHTML = "Start Over";
    Hud.playAgain.href = "#";
    Hud.playAgain.onclick = () => {
        Game.plays++;
        Game.wholePlays++;

        Hud.HideGameOver();

        LobbyClient.selectLobby(GameClient.tronLobby);

        Hud.ShowLoginElements();

        // Game.prototype.OnReplay();
    };
    Hud.gameOver.appendChild(Hud.playAgain);

    Hud.returnToMenu = document.createElement("a");
    Hud.returnToMenu.className = "returntomenu";
    Hud.returnToMenu.innerHTML = "Main Menu";
    Hud.returnToMenu.href = "#";
    Hud.returnToMenu.onclick = function() {
        window.location.reload();
    };
    Hud.gameOver.appendChild(Hud.returnToMenu);

    Hud.gameOverBottomSpace = document.createElement("div");
    Hud.gameOverBottomSpace.style.display = "block";
    Hud.gameOverBottomSpace.style.width = "336px";
    Hud.gameOverBottomSpace.style.height = "5px";
    Hud.gameOver.appendChild(Hud.gameOverBottomSpace);

    // Match Info
    Hud.matchInfo = document.createElement("h1");
    Hud.matchInfo.style.position = "absolute";
    Hud.matchInfo.style.textAlign = "center";
    Hud.matchInfo.style.textShadow = "3px 3px 0px #EDC872";
    Hud.matchInfo.style.color = "white";
    Hud.matchInfo.style.fontFamily = "futura-pt";
    Hud.matchInfo.style.width = "100%";
    hudDiv.appendChild(Hud.matchInfo);

    // tool icons
    Hud.toolBar = document.createElement("div");
    Hud.toolBar.href = "#";
    Hud.toolBar.id = "tk-menu";
    Hud.toolBar.className = "tk-menu";
    Hud.toolBar.style.position = "absolute";
    Hud.toolBar.style.top = "5px";
    Hud.toolBar.style.right = "10px";
    Hud.toolBar.style.width = "42px";
    Hud.toolBar.style.height = "auto";
    Hud.toolBar.style.display = "block";
    Hud.toolBar.style.overflow = "hidden";

    Hud.switchSound = document.createElement("a");
    Hud.switchSound.href = "#";
    Hud.switchSound.style.width = "32px";
    Hud.switchSound.style.height = "32px";
    Hud.switchSound.style.display = "block";
    Hud.switchSound.style.marginTop = "5px";
    Hud.switchSound.style.marginLeft = "auto";
    Hud.switchSound.style.marginRight = "auto";
    Hud.switchSound.style.overflow = "hidden";
    Hud.switchSound.innerHTML =
        '<img src="https://tk-assets.sfo2.cdn.digitaloceanspaces.com/bombertron/header/menu-sound.png" style="display:block;width:32px;height:32px;"/>';
    Hud.switchSound.onclick = function() {
        if (Game.isMuted === false) {
            Game.isMuted = true;
            Game.MuteUnMute();
            Hud.switchSound.innerHTML =
                '<img src="https://tk-assets.sfo2.cdn.digitaloceanspaces.com/bombertron/header/menu-sound.png" style="display:block;width:32px;height:32px;"/>';
        } else {
            Game.isMuted = false;
            Game.MuteUnMute();
            Hud.switchSound.innerHTML =
                '<img src="https://tk-assets.sfo2.cdn.digitaloceanspaces.com/bombertron/header/menu-sound.png" style="display:block;width:32px;height:32px;"/>';
        }
    };
    Hud.toolBar.appendChild(Hud.switchSound);

    // email
    Hud.email = document.createElement("a");
    Hud.email.alt = "Contact Us!";
    Hud.email.href = "#";
    Hud.email.style.width = "32px";
    Hud.email.style.height = "32px";
    Hud.email.style.display = "block";
    Hud.email.style.marginTop = "5px";
    Hud.email.style.marginLeft = "auto";
    Hud.email.style.marginRight = "auto";
    Hud.email.style.overflow = "hidden";
    Hud.email.innerHTML =
        '<img src="https://tk-assets.sfo2.cdn.digitaloceanspaces.com/bombertron/header/menu-email.png" style="display:block;width:32px;height:32px;"/>';
    Hud.email.onclick = function() {
        var win = window.open("mailto:info@trophyking.io");
    };
    Hud.toolBar.appendChild(Hud.email);

    // twitter button
    Hud.twitter = document.createElement("a");
    Hud.twitter.href = "#";
    Hud.twitter.style.right = "5px";
    Hud.twitter.style.width = "32px";
    Hud.twitter.style.height = "32px";
    Hud.twitter.style.display = "block";
    Hud.twitter.style.marginTop = "5px";
    Hud.twitter.style.marginLeft = "auto";
    Hud.twitter.style.marginRight = "auto";
    Hud.twitter.style.overflow = "hidden";
    Hud.twitter.innerHTML =
        '<img src="https://tk-assets.sfo2.cdn.digitaloceanspaces.com/bombertron/header/menu-twitter.png" style="display:block;width:32px;height:32px;"/>';
    Hud.twitter.onclick = function() {
        var win = window.open("https://twitter.com/trophykingio", "_blank");
        win.focus();
    };
    Hud.toolBar.appendChild(Hud.twitter);

    // telegram button
    Hud.telegram = document.createElement("a");
    Hud.telegram.href = "#";
    Hud.telegram.style.width = "32px";
    Hud.telegram.style.height = "32px";
    Hud.telegram.style.display = "block";
    Hud.telegram.style.marginTop = "5px";
    Hud.telegram.style.marginLeft = "auto";
    Hud.telegram.style.marginBottom = "5px";
    Hud.telegram.style.marginRight = "auto";
    Hud.telegram.style.overflow = "hidden";
    Hud.telegram.innerHTML =
        '<img src="https://tk-assets.sfo2.cdn.digitaloceanspaces.com/bombertron/header/menu-telegram.png" style="display:block;width:32px;height:32px;"/>';
    Hud.telegram.onclick = function() {
        var win = window.open("https://t.me/trophyking", "_blank");
        win.focus();
    };
    Hud.toolBar.appendChild(Hud.telegram);

    hudDiv.appendChild(Hud.toolBar);
    Hud.HideGameOver();

    // ranking
    Hud.ranking = document.createElement("div");
    Hud.ranking.id = "ranking";
    Hud.ranking.style.display = "none";
    Hud.centerOfScreen.appendChild(Hud.ranking);

    Hud.rankingTitle = document.createElement("h1");
    Hud.rankingTitle.innerHTML = "Top 100 Players";
    Hud.rankingTitle.style.textAlign = "center";
    Hud.rankingTitle.style.marginBottom = "2px";
    Hud.ranking.appendChild(Hud.rankingTitle);

    Hud.rankingReturn = document.createElement("a");
    Hud.rankingReturn.className = "ranking-return";
    Hud.rankingReturn.innerHTML = "<";
    Hud.rankingReturn.href = "#";
    Hud.rankingReturn.onclick = function() {
        Hud.HideRanking();
    };
    Hud.ranking.appendChild(Hud.rankingReturn);

    Hud.rankingContainer = document.createElement("div");
    Hud.rankingContainer.style.width = "390px";
    Hud.rankingContainer.style.margin = "0px auto";
    Hud.rankingContainer.style.backgroundColor = "#F0F0F0";
    Hud.rankingContainer.style.borderRadius = "5px";
    Hud.rankingContainer.style.height = "400px";
    Hud.rankingContainer.style.overflow = "scroll";
    Hud.rankingContainer.style.overflowX = "hidden";
    Hud.ranking.appendChild(Hud.rankingContainer);

    Hud.rankingTable = document.createElement("table");
    Hud.rankingTable.setAttribute("class", "ranking-table");
    Hud.rankingTable.style.width = "100%";

    Hud.additionalTableHTML = "";
    Hud.rankingTable.innerHTML += Hud.additionalTableHTML;

    Hud.rankingContainer.appendChild(Hud.rankingTable);
};

Hud.additionalTableHTML = "";

Hud.ShowRanking = function() {
    Hud.ranking.style.display = "block";
    Hud.HideLoginElements();
    Game.RequestRanking();
};

Hud.HideRanking = function() {
    Hud.ranking.style.display = "none";
    Hud.ShowLoginElements();
};

Hud.DrawRanking = function(players) {
    players.sort(function(a, b) {
        return b.points - a.points;
    });
    Hud.additionalTableHTML = "";
    for (i = 0; i < players.length; i++) {
        if (i % 2 === 0) {
            Hud.additionalTableHTML +=
                "<tr style='background-color:#FFE100;'><td style='text-align:center;'>" +
                (i + 1) +
                "</td><td style='padding-left:5px;'>" +
                players[i].username +
                "</td><td style='text-align:right;padding-right:5px;'>" +
                players[i].points +
                "</td></tr>";
        } else {
            Hud.additionalTableHTML +=
                "<tr style='background-color:#FFC400;'><td style='text-align:center;'>" +
                (i + 1) +
                "</td><td style='padding-left:5px;'>" +
                players[i].username +
                "</td><td style='text-align:right;padding-right:5px;'>" +
                players[i].points +
                "</td></tr>";
        }
    }
    Hud.rankingTable.innerHTML =
        "<tr><th style='text-align:left;width:35px;'>Rank</th><th style='text-align:left;padding-left:5px;'>Name</th><th style='text-align:right;'>Points</th></tr>" +
        Hud.additionalTableHTML;
};

Hud.lastUsername = "";
Hud.OnSubmitUsername = function() {
    GameClient.username = "<span style='color:orange'>" + Game.elo + "</span> ] ";

    if (Hud.loginUsernameInput.value.length > 0 && Hud.loginUsernameInput.value.length < 25) {
        Hud.lastUsername = Hud.loginUsernameInput.value.replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
        GameClient.username += Hud.lastUsername;
        Game.SetCookie("username", Hud.lastUsername, 365);
    } else {
        Hud.lastUsername = "Guest";
        GameClient.username += "Guest";
    }

    GatewayClient.Socket.emit("setUsername", {
        token: Game.token,
        username: Hud.lastUsername,
    });
};

Hud.SetLoginConnectionInfo = function(msg, color) {
    Hud.loginConnectionInfo.style.color = color;
    Hud.loginConnectionInfo.innerHTML = msg;
};

Hud.HideLobbyElements = function() {
    if (Hud.login) {
        document.getElementById("diamond").style.display = "none";
        document.getElementById("platinum").style.display = "none";
        document.getElementById("gold").style.display = "none";
        document.getElementById("silver").style.display = "none";
        document.getElementById("bronze").style.display = "none";

        document.getElementById("play").style.display = "inline-block";
        document.getElementById("ranking").style.display = "inline-block";
    }
};

Hud.HideLoginElements = function() {
    if (Hud.login) {
        Hud.playButton.className = "play trx-disabled";
        Hud.login.style.display = "none";
    }
};

Hud.ShowLobbyElements = function() {
    if (Hud.logo) {
        Hud.logo.style.display = "block";
    }

    if (Hud.login) {
        Hud.login.style.display = "block";

        document.getElementById("diamond").style.display = "inline-block";
        document.getElementById("platinum").style.display = "inline-block";
        document.getElementById("gold").style.display = "inline-block";
        document.getElementById("silver").style.display = "inline-block";
        document.getElementById("bronze").style.display = "inline-block";

        document.getElementById("play").style.display = "none";
        document.getElementById("ranking").style.display = "none";
    }
};

Hud.ShowLoginElements = function() {
    if (Hud.logo) {
        Hud.logo.style.display = "block";
    }

    if (Hud.login) {
        Hud.login.style.display = "block";
    }
};

Hud.HideGameOver = function() {
    if (Hud.gameOver) {
        Hud.gameOver.style.display = "none";
    }
};

Hud.ShowGameOver = function(won, ptDiff, diePos, totalPlayers, rnkPos) {
    GameClient.username = "<span style='color:orange'>" + Game.elo + "</span> ] " + Hud.lastUsername;

    Hud.gameOver.style.display = "block";
    Hud.positionInfo.innerHTML = "You ended up in place <b>#" + diePos + "</b> of " + totalPlayers + " players.";

    if (won === 1) {
        Hud.positionInfo.innerHTML += "<br>You gained <b style='color:green;'>" + ptDiff + "pts</b> in the Ranking.";
    } else {
        Hud.positionInfo.innerHTML += "<br>You lost <b style='color:red;'>" + ptDiff + "pts</b> in the Ranking.";
    }

    Hud.positionInfo.innerHTML +=
        "<br><br>Your current worldwide rank is<br><span style='font-size:32px;color:#75CDEB'>#" + rnkPos + "</span>";
};

Hud.GenerateNameplate = function(player) {
    this.newNameplate = document.createElement("p");
    this.newNameplate.style.position = "absolute";
    this.newNameplate.style.fontWeight = "bold";
    this.newNameplate.style.color = "white";
    this.newNameplate.style.textShadow = "0px 0px 5px black";
    this.newNameplate.innerHTML = player.username;
    document.body.appendChild(this.newNameplate);
    player.nameplate = this.newNameplate;
};

Hud.SetMatchInfo = function(msg) {
    Hud.matchInfo.innerHTML = msg;
};

Hud.HideMatchInfo = function() {
    Hud.matchInfo.innerHTML = "";
};

// update code called every frame
Hud.prototype.update = function(dt) {
    for (i = 0; i < Game.players.length; i++) {
        if (
            Game.players[i] !== undefined &&
            Game.players[i].entity !== undefined &&
            Game.players[i].nameplate !== undefined &&
            Game.players[i] !== null &&
            Game.players[i].nameplate !== null
        ) {
            if (Game.players[i].entity !== null) {
                var screenPos = new pc.Vec3();
                Game.Camera.camera.worldToScreen(Game.players[i].entity.getPosition(), screenPos);
                Game.players[i].nameplate.innerHTML = Game.players[i].username;
                Game.players[i].nameplate.style.left = screenPos.x - 20 + "px";
                Game.players[i].nameplate.style.top = screenPos.y - 100 + "px";
            } else {
                Game.players[i].nameplate.style.display = "none";
            }
        }
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// Hud.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var Audio = pc.createScript("audio");
Audio.attributes.add("sounds", {
    type: "asset",
    assetType: "sound",
    array: !0,
}),
    (Audio.prototype.initialize = function() {}),
    (Audio.prototype.update = function(o) {}),
    (Audio.Play = function(o) {}),
    (Audio.PlayRandom = function(o) {});
var ActionBehaviour = pc.createScript("actionBehaviour");
(ActionBehaviour.prototype.initialize = function() {
    this.entity.setLocalScale(new pc.Vec3(0, 0, 0)), (this.timer = 0), (this.owner = null);
}),
    (ActionBehaviour.prototype.Init = function(t) {
        this.owner = t;
    }),
    (ActionBehaviour.prototype.update = function(t) {
        this.timer += t;
        var e = new pc.Vec3();
        if (
            (this.timer < 2
                ? e.lerp(this.entity.getLocalScale(), new pc.Vec3(1, 1, 1), 0.2)
                : this.timer > 2 && e.lerp(this.entity.getLocalScale(), new pc.Vec3(0, 0, 0), 0.2),
            null !== this.owner)
        ) {
            var i = new pc.Vec3();
            (i = this.owner.entity.getPosition()).add(new pc.Vec3(0, 2, -1)), this.entity.setPosition(i);
        }
        this.entity.setLocalScale(e), this.timer >= 5 && this.entity.destroy();
    });
!(function(t) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        ("undefined" != typeof window
            ? window
            : "undefined" != typeof global
            ? global
            : "undefined" != typeof self
            ? self
            : this
        ).io = t();
    }
})(function() {
    return (function e(t, n, r) {
        function s(i, a) {
            if (!n[i]) {
                if (!t[i]) {
                    var c = "function" == typeof require && require;
                    if (!a && c) return c(i, !0);
                    if (o) return o(i, !0);
                    var p = new Error("Cannot find module '" + i + "'");
                    throw ((p.code = "MODULE_NOT_FOUND"), p);
                }
                var u = (n[i] = { exports: {} });
                t[i][0].call(
                    u.exports,
                    function(e) {
                        var n = t[i][1][e];
                        return s(n || e);
                    },
                    u,
                    u.exports,
                    e,
                    t,
                    n,
                    r
                );
            }
            return n[i].exports;
        }

        for (var o = "function" == typeof require && require, i = 0; i < r.length; i++) s(r[i]);
        return s;
    })(
        {
            1: [
                function(t, e, n) {
                    e.exports = t("./lib/");
                },
                { "./lib/": 2 },
            ],
            2: [
                function(t, e, n) {
                    (e.exports = t("./socket")), (e.exports.parser = t("engine.io-parser"));
                },
                { "./socket": 3, "engine.io-parser": 19 },
            ],
            3: [
                function(t, e, n) {
                    (function(n) {
                        var r = t("./transports"),
                            o = t("component-emitter"),
                            i = t("debug")("engine.io-client:socket"),
                            s = t("indexof"),
                            a = t("engine.io-parser"),
                            c = t("parseuri"),
                            p = t("parsejson"),
                            u = t("parseqs");

                        function Socket(t, e) {
                            if (!(this instanceof Socket)) return new Socket(t, e);
                            (e = e || {}),
                                t && "object" == typeof t && ((e = t), (t = null)),
                                t
                                    ? ((t = c(t)),
                                      (e.hostname = t.host),
                                      (e.secure = "https" == t.protocol || "wss" == t.protocol),
                                      (e.port = t.port),
                                      t.query && (e.query = t.query))
                                    : e.host && (e.hostname = c(e.host).host),
                                (this.secure =
                                    null != e.secure ? e.secure : n.location && "https:" == location.protocol),
                                e.hostname && !e.port && (e.port = this.secure ? "443" : "80"),
                                (this.agent = e.agent || !1),
                                (this.hostname = e.hostname || (n.location ? location.hostname : "localhost")),
                                (this.port =
                                    e.port || (n.location && location.port ? location.port : this.secure ? 443 : 80)),
                                (this.query = e.query || {}),
                                "string" == typeof this.query && (this.query = u.decode(this.query)),
                                (this.upgrade = !1 !== e.upgrade),
                                (this.path = (e.path || "/engine.io").replace(/\/$/, "") + "/"),
                                (this.forceJSONP = !!e.forceJSONP),
                                (this.jsonp = !1 !== e.jsonp),
                                (this.forceBase64 = !!e.forceBase64),
                                (this.enablesXDR = !!e.enablesXDR),
                                (this.timestampParam = e.timestampParam || "t"),
                                (this.timestampRequests = e.timestampRequests),
                                (this.transports = e.transports || ["polling", "websocket"]),
                                (this.readyState = ""),
                                (this.writeBuffer = []),
                                (this.policyPort = e.policyPort || 843),
                                (this.rememberUpgrade = e.rememberUpgrade || !1),
                                (this.binaryType = null),
                                (this.onlyBinaryUpgrades = e.onlyBinaryUpgrades),
                                (this.perMessageDeflate = !1 !== e.perMessageDeflate && (e.perMessageDeflate || {})),
                                !0 === this.perMessageDeflate && (this.perMessageDeflate = {}),
                                this.perMessageDeflate &&
                                    null == this.perMessageDeflate.threshold &&
                                    (this.perMessageDeflate.threshold = 1024),
                                (this.pfx = e.pfx || null),
                                (this.key = e.key || null),
                                (this.passphrase = e.passphrase || null),
                                (this.cert = e.cert || null),
                                (this.ca = e.ca || null),
                                (this.ciphers = e.ciphers || null),
                                (this.rejectUnauthorized =
                                    void 0 === e.rejectUnauthorized ? null : e.rejectUnauthorized);
                            var r = "object" == typeof n && n;
                            r.global === r &&
                                e.extraHeaders &&
                                Object.keys(e.extraHeaders).length > 0 &&
                                (this.extraHeaders = e.extraHeaders),
                                this.open();
                        }

                        (e.exports = Socket),
                            (Socket.priorWebsocketSuccess = !1),
                            o(Socket.prototype),
                            (Socket.protocol = a.protocol),
                            (Socket.Socket = Socket),
                            (Socket.Transport = t("./transport")),
                            (Socket.transports = t("./transports")),
                            (Socket.parser = t("engine.io-parser")),
                            (Socket.prototype.createTransport = function(t) {
                                i('creating transport "%s"', t);
                                var e = (function clone(t) {
                                    var e = {};
                                    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
                                    return e;
                                })(this.query);
                                return (
                                    (e.EIO = a.protocol),
                                    (e.transport = t),
                                    this.id && (e.sid = this.id),
                                    new r[t]({
                                        agent: this.agent,
                                        hostname: this.hostname,
                                        port: this.port,
                                        secure: this.secure,
                                        path: this.path,
                                        query: e,
                                        forceJSONP: this.forceJSONP,
                                        jsonp: this.jsonp,
                                        forceBase64: this.forceBase64,
                                        enablesXDR: this.enablesXDR,
                                        timestampRequests: this.timestampRequests,
                                        timestampParam: this.timestampParam,
                                        policyPort: this.policyPort,
                                        socket: this,
                                        pfx: this.pfx,
                                        key: this.key,
                                        passphrase: this.passphrase,
                                        cert: this.cert,
                                        ca: this.ca,
                                        ciphers: this.ciphers,
                                        rejectUnauthorized: this.rejectUnauthorized,
                                        perMessageDeflate: this.perMessageDeflate,
                                        extraHeaders: this.extraHeaders,
                                    })
                                );
                            }),
                            (Socket.prototype.open = function() {
                                var t;
                                if (
                                    this.rememberUpgrade &&
                                    Socket.priorWebsocketSuccess &&
                                    -1 != this.transports.indexOf("websocket")
                                )
                                    t = "websocket";
                                else {
                                    if (0 === this.transports.length) {
                                        var e = this;
                                        return void setTimeout(function() {
                                            e.emit("error", "No transports available");
                                        }, 0);
                                    }
                                    t = this.transports[0];
                                }
                                this.readyState = "opening";
                                try {
                                    t = this.createTransport(t);
                                } catch (t) {
                                    return this.transports.shift(), void this.open();
                                }
                                t.open(), this.setTransport(t);
                            }),
                            (Socket.prototype.setTransport = function(t) {
                                i("setting transport %s", t.name);
                                var e = this;
                                this.transport &&
                                    (i("clearing existing transport %s", this.transport.name),
                                    this.transport.removeAllListeners()),
                                    (this.transport = t),
                                    t
                                        .on("drain", function() {
                                            e.onDrain();
                                        })
                                        .on("packet", function(t) {
                                            e.onPacket(t);
                                        })
                                        .on("error", function(t) {
                                            e.onError(t);
                                        })
                                        .on("close", function() {
                                            e.onClose("transport close");
                                        });
                            }),
                            (Socket.prototype.probe = function(t) {
                                i('probing transport "%s"', t);
                                var e = this.createTransport(t, { probe: 1 }),
                                    n = !1,
                                    r = this;

                                function onTransportOpen() {
                                    if (r.onlyBinaryUpgrades) {
                                        var o = !this.supportsBinary && r.transport.supportsBinary;
                                        n = n || o;
                                    }
                                    n ||
                                        (i('probe transport "%s" opened', t),
                                        e.send([{ type: "ping", data: "probe" }]),
                                        e.once("packet", function(o) {
                                            if (!n)
                                                if ("pong" == o.type && "probe" == o.data) {
                                                    if (
                                                        (i('probe transport "%s" pong', t),
                                                        (r.upgrading = !0),
                                                        r.emit("upgrading", e),
                                                        !e)
                                                    )
                                                        return;
                                                    (Socket.priorWebsocketSuccess = "websocket" == e.name),
                                                        i('pausing current transport "%s"', r.transport.name),
                                                        r.transport.pause(function() {
                                                            n ||
                                                                ("closed" != r.readyState &&
                                                                    (i("changing transport and sending upgrade packet"),
                                                                    cleanup(),
                                                                    r.setTransport(e),
                                                                    e.send([
                                                                        {
                                                                            type: "upgrade",
                                                                        },
                                                                    ]),
                                                                    r.emit("upgrade", e),
                                                                    (e = null),
                                                                    (r.upgrading = !1),
                                                                    r.flush()));
                                                        });
                                                } else {
                                                    i('probe transport "%s" failed', t);
                                                    var s = new Error("probe error");
                                                    (s.transport = e.name), r.emit("upgradeError", s);
                                                }
                                        }));
                                }

                                function freezeTransport() {
                                    n || ((n = !0), cleanup(), e.close(), (e = null));
                                }

                                function onerror(n) {
                                    var o = new Error("probe error: " + n);
                                    (o.transport = e.name),
                                        freezeTransport(),
                                        i('probe transport "%s" failed because of error: %s', t, n),
                                        r.emit("upgradeError", o);
                                }

                                function onTransportClose() {
                                    onerror("transport closed");
                                }

                                function onclose() {
                                    onerror("socket closed");
                                }

                                function onupgrade(t) {
                                    e &&
                                        t.name != e.name &&
                                        (i('"%s" works - aborting "%s"', t.name, e.name), freezeTransport());
                                }

                                function cleanup() {
                                    e.removeListener("open", onTransportOpen),
                                        e.removeListener("error", onerror),
                                        e.removeListener("close", onTransportClose),
                                        r.removeListener("close", onclose),
                                        r.removeListener("upgrading", onupgrade);
                                }

                                (Socket.priorWebsocketSuccess = !1),
                                    e.once("open", onTransportOpen),
                                    e.once("error", onerror),
                                    e.once("close", onTransportClose),
                                    this.once("close", onclose),
                                    this.once("upgrading", onupgrade),
                                    e.open();
                            }),
                            (Socket.prototype.onOpen = function() {
                                if (
                                    (i("socket open"),
                                    (this.readyState = "open"),
                                    (Socket.priorWebsocketSuccess = "websocket" == this.transport.name),
                                    this.emit("open"),
                                    this.flush(),
                                    "open" == this.readyState && this.upgrade && this.transport.pause)
                                ) {
                                    i("starting upgrade probes");
                                    for (var t = 0, e = this.upgrades.length; t < e; t++) this.probe(this.upgrades[t]);
                                }
                            }),
                            (Socket.prototype.onPacket = function(t) {
                                if ("opening" == this.readyState || "open" == this.readyState)
                                    switch (
                                        (i('socket receive: type "%s", data "%s"', t.type, t.data),
                                        this.emit("packet", t),
                                        this.emit("heartbeat"),
                                        t.type)
                                    ) {
                                        case "open":
                                            this.onHandshake(p(t.data));
                                            break;
                                        case "pong":
                                            this.setPing(), this.emit("pong");
                                            break;
                                        case "error":
                                            var e = new Error("server error");
                                            (e.code = t.data), this.onError(e);
                                            break;
                                        case "message":
                                            this.emit("data", t.data), this.emit("message", t.data);
                                    }
                                else i('packet received with socket readyState "%s"', this.readyState);
                            }),
                            (Socket.prototype.onHandshake = function(t) {
                                this.emit("handshake", t),
                                    (this.id = t.sid),
                                    (this.transport.query.sid = t.sid),
                                    (this.upgrades = this.filterUpgrades(t.upgrades)),
                                    (this.pingInterval = t.pingInterval),
                                    (this.pingTimeout = t.pingTimeout),
                                    this.onOpen(),
                                    "closed" != this.readyState &&
                                        (this.setPing(),
                                        this.removeListener("heartbeat", this.onHeartbeat),
                                        this.on("heartbeat", this.onHeartbeat));
                            }),
                            (Socket.prototype.onHeartbeat = function(t) {
                                clearTimeout(this.pingTimeoutTimer);
                                var e = this;
                                e.pingTimeoutTimer = setTimeout(function() {
                                    "closed" != e.readyState && e.onClose("ping timeout");
                                }, t || e.pingInterval + e.pingTimeout);
                            }),
                            (Socket.prototype.setPing = function() {
                                var t = this;
                                clearTimeout(t.pingIntervalTimer),
                                    (t.pingIntervalTimer = setTimeout(function() {
                                        i("writing ping packet - expecting pong within %sms", t.pingTimeout),
                                            t.ping(),
                                            t.onHeartbeat(t.pingTimeout);
                                    }, t.pingInterval));
                            }),
                            (Socket.prototype.ping = function() {
                                var t = this;
                                this.sendPacket("ping", function() {
                                    t.emit("ping");
                                });
                            }),
                            (Socket.prototype.onDrain = function() {
                                this.writeBuffer.splice(0, this.prevBufferLen),
                                    (this.prevBufferLen = 0),
                                    0 === this.writeBuffer.length ? this.emit("drain") : this.flush();
                            }),
                            (Socket.prototype.flush = function() {
                                "closed" != this.readyState &&
                                    this.transport.writable &&
                                    !this.upgrading &&
                                    this.writeBuffer.length &&
                                    (i("flushing %d packets in socket", this.writeBuffer.length),
                                    this.transport.send(this.writeBuffer),
                                    (this.prevBufferLen = this.writeBuffer.length),
                                    this.emit("flush"));
                            }),
                            (Socket.prototype.write = Socket.prototype.send = function(t, e, n) {
                                return this.sendPacket("message", t, e, n), this;
                            }),
                            (Socket.prototype.sendPacket = function(t, e, n, r) {
                                if (
                                    ("function" == typeof e && ((r = e), (e = void 0)),
                                    "function" == typeof n && ((r = n), (n = null)),
                                    "closing" != this.readyState && "closed" != this.readyState)
                                ) {
                                    (n = n || {}).compress = !1 !== n.compress;
                                    var o = { type: t, data: e, options: n };
                                    this.emit("packetCreate", o),
                                        this.writeBuffer.push(o),
                                        r && this.once("flush", r),
                                        this.flush();
                                }
                            }),
                            (Socket.prototype.close = function() {
                                if ("opening" == this.readyState || "open" == this.readyState) {
                                    this.readyState = "closing";
                                    var t = this;
                                    this.writeBuffer.length
                                        ? this.once("drain", function() {
                                              this.upgrading ? waitForUpgrade() : close();
                                          })
                                        : this.upgrading
                                        ? waitForUpgrade()
                                        : close();
                                }

                                function close() {
                                    t.onClose("forced close"),
                                        i("socket closing - telling transport to close"),
                                        t.transport.close();
                                }

                                function cleanupAndClose() {
                                    t.removeListener("upgrade", cleanupAndClose),
                                        t.removeListener("upgradeError", cleanupAndClose),
                                        close();
                                }

                                function waitForUpgrade() {
                                    t.once("upgrade", cleanupAndClose), t.once("upgradeError", cleanupAndClose);
                                }

                                return this;
                            }),
                            (Socket.prototype.onError = function(t) {
                                i("socket error %j", t),
                                    (Socket.priorWebsocketSuccess = !1),
                                    this.emit("error", t),
                                    this.onClose("transport error", t);
                            }),
                            (Socket.prototype.onClose = function(t, e) {
                                if (
                                    "opening" == this.readyState ||
                                    "open" == this.readyState ||
                                    "closing" == this.readyState
                                ) {
                                    i('socket close with reason: "%s"', t);
                                    clearTimeout(this.pingIntervalTimer),
                                        clearTimeout(this.pingTimeoutTimer),
                                        this.transport.removeAllListeners("close"),
                                        this.transport.close(),
                                        this.transport.removeAllListeners(),
                                        (this.readyState = "closed"),
                                        (this.id = null),
                                        this.emit("close", t, e),
                                        (this.writeBuffer = []),
                                        (this.prevBufferLen = 0);
                                }
                            }),
                            (Socket.prototype.filterUpgrades = function(t) {
                                for (var e = [], n = 0, r = t.length; n < r; n++)
                                    ~s(this.transports, t[n]) && e.push(t[n]);
                                return e;
                            });
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {
                    "./transport": 4,
                    "./transports": 5,
                    "component-emitter": 15,
                    debug: 17,
                    "engine.io-parser": 19,
                    indexof: 23,
                    parsejson: 26,
                    parseqs: 27,
                    parseuri: 28,
                },
            ],
            4: [
                function(t, e, n) {
                    var r = t("engine.io-parser"),
                        o = t("component-emitter");

                    function Transport(t) {
                        (this.path = t.path),
                            (this.hostname = t.hostname),
                            (this.port = t.port),
                            (this.secure = t.secure),
                            (this.query = t.query),
                            (this.timestampParam = t.timestampParam),
                            (this.timestampRequests = t.timestampRequests),
                            (this.readyState = ""),
                            (this.agent = t.agent || !1),
                            (this.socket = t.socket),
                            (this.enablesXDR = t.enablesXDR),
                            (this.pfx = t.pfx),
                            (this.key = t.key),
                            (this.passphrase = t.passphrase),
                            (this.cert = t.cert),
                            (this.ca = t.ca),
                            (this.ciphers = t.ciphers),
                            (this.rejectUnauthorized = t.rejectUnauthorized),
                            (this.extraHeaders = t.extraHeaders);
                    }

                    (e.exports = Transport),
                        o(Transport.prototype),
                        (Transport.prototype.onError = function(t, e) {
                            var n = new Error(t);
                            return (n.type = "TransportError"), (n.description = e), this.emit("error", n), this;
                        }),
                        (Transport.prototype.open = function() {
                            return (
                                ("closed" != this.readyState && "" != this.readyState) ||
                                    ((this.readyState = "opening"), this.doOpen()),
                                this
                            );
                        }),
                        (Transport.prototype.close = function() {
                            return (
                                ("opening" != this.readyState && "open" != this.readyState) ||
                                    (this.doClose(), this.onClose()),
                                this
                            );
                        }),
                        (Transport.prototype.send = function(t) {
                            if ("open" != this.readyState) throw new Error("Transport not open");
                            this.write(t);
                        }),
                        (Transport.prototype.onOpen = function() {
                            (this.readyState = "open"), (this.writable = !0), this.emit("open");
                        }),
                        (Transport.prototype.onData = function(t) {
                            var e = r.decodePacket(t, this.socket.binaryType);
                            this.onPacket(e);
                        }),
                        (Transport.prototype.onPacket = function(t) {
                            this.emit("packet", t);
                        }),
                        (Transport.prototype.onClose = function() {
                            (this.readyState = "closed"), this.emit("close");
                        });
                },
                { "component-emitter": 15, "engine.io-parser": 19 },
            ],
            5: [
                function(t, e, n) {
                    (function(e) {
                        var r = t("xmlhttprequest-ssl"),
                            o = t("./polling-xhr"),
                            i = t("./polling-jsonp"),
                            s = t("./websocket");
                        (n.polling = function polling(t) {
                            var n = !1,
                                s = !1,
                                a = !1 !== t.jsonp;
                            if (e.location) {
                                var c = "https:" == location.protocol,
                                    p = location.port;
                                p || (p = c ? 443 : 80),
                                    (n = t.hostname != location.hostname || p != t.port),
                                    (s = t.secure != c);
                            }
                            {
                                if (((t.xdomain = n), (t.xscheme = s), "open" in new r(t) && !t.forceJSONP))
                                    return new o(t);
                                if (!a) throw new Error("JSONP disabled");
                                return new i(t);
                            }
                        }),
                            (n.websocket = s);
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {
                    "./polling-jsonp": 6,
                    "./polling-xhr": 7,
                    "./websocket": 9,
                    "xmlhttprequest-ssl": 10,
                },
            ],
            6: [
                function(t, e, n) {
                    (function(n) {
                        var r = t("./polling"),
                            o = t("component-inherit");
                        e.exports = JSONPPolling;
                        var i,
                            s = /\n/g,
                            a = /\\n/g;

                        function empty() {}

                        function JSONPPolling(t) {
                            r.call(this, t),
                                (this.query = this.query || {}),
                                i || (n.___eio || (n.___eio = []), (i = n.___eio)),
                                (this.index = i.length);
                            var e = this;
                            i.push(function(t) {
                                e.onData(t);
                            }),
                                (this.query.j = this.index),
                                n.document &&
                                    n.addEventListener &&
                                    n.addEventListener(
                                        "beforeunload",
                                        function() {
                                            e.script && (e.script.onerror = empty);
                                        },
                                        !1
                                    );
                        }

                        o(JSONPPolling, r),
                            (JSONPPolling.prototype.supportsBinary = !1),
                            (JSONPPolling.prototype.doClose = function() {
                                this.script && (this.script.parentNode.removeChild(this.script), (this.script = null)),
                                    this.form &&
                                        (this.form.parentNode.removeChild(this.form),
                                        (this.form = null),
                                        (this.iframe = null)),
                                    r.prototype.doClose.call(this);
                            }),
                            (JSONPPolling.prototype.doPoll = function() {
                                var t = this,
                                    e = document.createElement("script");
                                this.script && (this.script.parentNode.removeChild(this.script), (this.script = null)),
                                    (e.async = !0),
                                    (e.src = this.uri()),
                                    (e.onerror = function(e) {
                                        t.onError("jsonp poll error", e);
                                    });
                                var n = document.getElementsByTagName("script")[0];
                                n ? n.parentNode.insertBefore(e, n) : (document.head || document.body).appendChild(e),
                                    (this.script = e),
                                    "undefined" != typeof navigator &&
                                        /gecko/i.test(navigator.userAgent) &&
                                        setTimeout(function() {
                                            var t = document.createElement("iframe");
                                            document.body.appendChild(t), document.body.removeChild(t);
                                        }, 100);
                            }),
                            (JSONPPolling.prototype.doWrite = function(t, e) {
                                var n = this;
                                if (!this.form) {
                                    var r,
                                        o = document.createElement("form"),
                                        i = document.createElement("textarea"),
                                        c = (this.iframeId = "eio_iframe_" + this.index);
                                    (o.className = "socketio"),
                                        (o.style.position = "absolute"),
                                        (o.style.top = "-1000px"),
                                        (o.style.left = "-1000px"),
                                        (o.target = c),
                                        (o.method = "POST"),
                                        o.setAttribute("accept-charset", "utf-8"),
                                        (i.name = "d"),
                                        o.appendChild(i),
                                        document.body.appendChild(o),
                                        (this.form = o),
                                        (this.area = i);
                                }

                                function complete() {
                                    initIframe(), e();
                                }

                                function initIframe() {
                                    if (n.iframe)
                                        try {
                                            n.form.removeChild(n.iframe);
                                        } catch (t) {
                                            n.onError("jsonp polling iframe removal error", t);
                                        }
                                    try {
                                        var t = '<iframe src="javascript:0" name="' + n.iframeId + '">';
                                        r = document.createElement(t);
                                    } catch (t) {
                                        ((r = document.createElement("iframe")).name = n.iframeId),
                                            (r.src = "javascript:0");
                                    }
                                    (r.id = n.iframeId), n.form.appendChild(r), (n.iframe = r);
                                }

                                (this.form.action = this.uri()),
                                    initIframe(),
                                    (t = t.replace(a, "\\\n")),
                                    (this.area.value = t.replace(s, "\\n"));
                                try {
                                    this.form.submit();
                                } catch (t) {}
                                this.iframe.attachEvent
                                    ? (this.iframe.onreadystatechange = function() {
                                          "complete" == n.iframe.readyState && complete();
                                      })
                                    : (this.iframe.onload = complete);
                            });
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                { "./polling": 8, "component-inherit": 16 },
            ],
            7: [
                function(t, e, n) {
                    (function(n) {
                        var r = t("xmlhttprequest-ssl"),
                            o = t("./polling"),
                            i = t("component-emitter"),
                            s = t("component-inherit"),
                            a = t("debug")("engine.io-client:polling-xhr");

                        function empty() {}

                        function XHR(t) {
                            if ((o.call(this, t), n.location)) {
                                var e = "https:" == location.protocol,
                                    r = location.port;
                                r || (r = e ? 443 : 80),
                                    (this.xd = t.hostname != n.location.hostname || r != t.port),
                                    (this.xs = t.secure != e);
                            } else this.extraHeaders = t.extraHeaders;
                        }

                        function Request(t) {
                            (this.method = t.method || "GET"),
                                (this.uri = t.uri),
                                (this.xd = !!t.xd),
                                (this.xs = !!t.xs),
                                (this.async = !1 !== t.async),
                                (this.data = null != t.data ? t.data : null),
                                (this.agent = t.agent),
                                (this.isBinary = t.isBinary),
                                (this.supportsBinary = t.supportsBinary),
                                (this.enablesXDR = t.enablesXDR),
                                (this.pfx = t.pfx),
                                (this.key = t.key),
                                (this.passphrase = t.passphrase),
                                (this.cert = t.cert),
                                (this.ca = t.ca),
                                (this.ciphers = t.ciphers),
                                (this.rejectUnauthorized = t.rejectUnauthorized),
                                (this.extraHeaders = t.extraHeaders),
                                this.create();
                        }

                        function unloadHandler() {
                            for (var t in Request.requests)
                                Request.requests.hasOwnProperty(t) && Request.requests[t].abort();
                        }

                        (e.exports = XHR),
                            (e.exports.Request = Request),
                            s(XHR, o),
                            (XHR.prototype.supportsBinary = !0),
                            (XHR.prototype.request = function(t) {
                                return (
                                    ((t = t || {}).uri = this.uri()),
                                    (t.xd = this.xd),
                                    (t.xs = this.xs),
                                    (t.agent = this.agent || !1),
                                    (t.supportsBinary = this.supportsBinary),
                                    (t.enablesXDR = this.enablesXDR),
                                    (t.pfx = this.pfx),
                                    (t.key = this.key),
                                    (t.passphrase = this.passphrase),
                                    (t.cert = this.cert),
                                    (t.ca = this.ca),
                                    (t.ciphers = this.ciphers),
                                    (t.rejectUnauthorized = this.rejectUnauthorized),
                                    (t.extraHeaders = this.extraHeaders),
                                    new Request(t)
                                );
                            }),
                            (XHR.prototype.doWrite = function(t, e) {
                                var n = "string" != typeof t && void 0 !== t,
                                    r = this.request({
                                        method: "POST",
                                        data: t,
                                        isBinary: n,
                                    }),
                                    o = this;
                                r.on("success", e),
                                    r.on("error", function(t) {
                                        o.onError("xhr post error", t);
                                    }),
                                    (this.sendXhr = r);
                            }),
                            (XHR.prototype.doPoll = function() {
                                a("xhr poll");
                                var t = this.request(),
                                    e = this;
                                t.on("data", function(t) {
                                    e.onData(t);
                                }),
                                    t.on("error", function(t) {
                                        e.onError("xhr poll error", t);
                                    }),
                                    (this.pollXhr = t);
                            }),
                            i(Request.prototype),
                            (Request.prototype.create = function() {
                                var t = {
                                    agent: this.agent,
                                    xdomain: this.xd,
                                    xscheme: this.xs,
                                    enablesXDR: this.enablesXDR,
                                };
                                (t.pfx = this.pfx),
                                    (t.key = this.key),
                                    (t.passphrase = this.passphrase),
                                    (t.cert = this.cert),
                                    (t.ca = this.ca),
                                    (t.ciphers = this.ciphers),
                                    (t.rejectUnauthorized = this.rejectUnauthorized);
                                var e = (this.xhr = new r(t)),
                                    o = this;
                                try {
                                    a("xhr open %s: %s", this.method, this.uri),
                                        e.open(this.method, this.uri, this.async);
                                    try {
                                        if (this.extraHeaders)
                                            for (var i in (e.setDisableHeaderCheck(!0), this.extraHeaders))
                                                this.extraHeaders.hasOwnProperty(i) &&
                                                    e.setRequestHeader(i, this.extraHeaders[i]);
                                    } catch (t) {}
                                    if (
                                        (this.supportsBinary && (e.responseType = "arraybuffer"), "POST" == this.method)
                                    )
                                        try {
                                            this.isBinary
                                                ? e.setRequestHeader("Content-type", "application/octet-stream")
                                                : e.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                                        } catch (t) {}
                                    "withCredentials" in e && (e.withCredentials = !0),
                                        this.hasXDR()
                                            ? ((e.onload = function() {
                                                  o.onLoad();
                                              }),
                                              (e.onerror = function() {
                                                  o.onError(e.responseText);
                                              }))
                                            : (e.onreadystatechange = function() {
                                                  4 == e.readyState &&
                                                      (200 == e.status || 1223 == e.status
                                                          ? o.onLoad()
                                                          : setTimeout(function() {
                                                                o.onError(e.status);
                                                            }, 0));
                                              }),
                                        a("xhr data %s", this.data),
                                        e.send(this.data);
                                } catch (t) {
                                    return void setTimeout(function() {
                                        o.onError(t);
                                    }, 0);
                                }
                                n.document &&
                                    ((this.index = Request.requestsCount++), (Request.requests[this.index] = this));
                            }),
                            (Request.prototype.onSuccess = function() {
                                this.emit("success"), this.cleanup();
                            }),
                            (Request.prototype.onData = function(t) {
                                this.emit("data", t), this.onSuccess();
                            }),
                            (Request.prototype.onError = function(t) {
                                this.emit("error", t), this.cleanup(!0);
                            }),
                            (Request.prototype.cleanup = function(t) {
                                if (void 0 !== this.xhr && null !== this.xhr) {
                                    if (
                                        (this.hasXDR()
                                            ? (this.xhr.onload = this.xhr.onerror = empty)
                                            : (this.xhr.onreadystatechange = empty),
                                        t)
                                    )
                                        try {
                                            this.xhr.abort();
                                        } catch (t) {}
                                    n.document && delete Request.requests[this.index], (this.xhr = null);
                                }
                            }),
                            (Request.prototype.onLoad = function() {
                                var t;
                                try {
                                    var e;
                                    try {
                                        e = this.xhr.getResponseHeader("Content-Type").split(";")[0];
                                    } catch (t) {}
                                    if ("application/octet-stream" === e) t = this.xhr.response;
                                    else if (this.supportsBinary)
                                        try {
                                            t = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
                                        } catch (e) {
                                            for (
                                                var n = new Uint8Array(this.xhr.response), r = [], o = 0, i = n.length;
                                                o < i;
                                                o++
                                            )
                                                r.push(n[o]);
                                            t = String.fromCharCode.apply(null, r);
                                        }
                                    else t = this.xhr.responseText;
                                } catch (t) {
                                    this.onError(t);
                                }
                                null != t && this.onData(t);
                            }),
                            (Request.prototype.hasXDR = function() {
                                return void 0 !== n.XDomainRequest && !this.xs && this.enablesXDR;
                            }),
                            (Request.prototype.abort = function() {
                                this.cleanup();
                            }),
                            n.document &&
                                ((Request.requestsCount = 0),
                                (Request.requests = {}),
                                n.attachEvent
                                    ? n.attachEvent("onunload", unloadHandler)
                                    : n.addEventListener && n.addEventListener("beforeunload", unloadHandler, !1));
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {
                    "./polling": 8,
                    "component-emitter": 15,
                    "component-inherit": 16,
                    debug: 17,
                    "xmlhttprequest-ssl": 10,
                },
            ],
            8: [
                function(t, e, n) {
                    var r = t("../transport"),
                        o = t("parseqs"),
                        i = t("engine.io-parser"),
                        s = t("component-inherit"),
                        a = t("yeast"),
                        c = t("debug")("engine.io-client:polling");
                    e.exports = Polling;
                    var p = null != new (t("xmlhttprequest-ssl"))({ xdomain: !1 }).responseType;

                    function Polling(t) {
                        var e = t && t.forceBase64;
                        (p && !e) || (this.supportsBinary = !1), r.call(this, t);
                    }

                    s(Polling, r),
                        (Polling.prototype.name = "polling"),
                        (Polling.prototype.doOpen = function() {
                            this.poll();
                        }),
                        (Polling.prototype.pause = function(t) {
                            var e = this;

                            function pause() {
                                c("paused"), (e.readyState = "paused"), t();
                            }

                            if (((this.readyState = "pausing"), this.polling || !this.writable)) {
                                var n = 0;
                                this.polling &&
                                    (c("we are currently polling - waiting to pause"),
                                    n++,
                                    this.once("pollComplete", function() {
                                        c("pre-pause polling complete"), --n || pause();
                                    })),
                                    this.writable ||
                                        (c("we are currently writing - waiting to pause"),
                                        n++,
                                        this.once("drain", function() {
                                            c("pre-pause writing complete"), --n || pause();
                                        }));
                            } else pause();
                        }),
                        (Polling.prototype.poll = function() {
                            c("polling"), (this.polling = !0), this.doPoll(), this.emit("poll");
                        }),
                        (Polling.prototype.onData = function(t) {
                            var e = this;
                            c("polling got data %s", t);
                            i.decodePayload(t, this.socket.binaryType, function(t, n, r) {
                                if (("opening" == e.readyState && e.onOpen(), "close" == t.type))
                                    return e.onClose(), !1;
                                e.onPacket(t);
                            }),
                                "closed" != this.readyState &&
                                    ((this.polling = !1),
                                    this.emit("pollComplete"),
                                    "open" == this.readyState
                                        ? this.poll()
                                        : c('ignoring poll - transport state "%s"', this.readyState));
                        }),
                        (Polling.prototype.doClose = function() {
                            var t = this;

                            function close() {
                                c("writing close packet"), t.write([{ type: "close" }]);
                            }

                            "open" == this.readyState
                                ? (c("transport open - closing"), close())
                                : (c("transport not open - deferring close"), this.once("open", close));
                        }),
                        (Polling.prototype.write = function(t) {
                            var e = this;
                            this.writable = !1;
                            var n = function() {
                                (e.writable = !0), e.emit("drain");
                            };
                            e = this;
                            i.encodePayload(t, this.supportsBinary, function(t) {
                                e.doWrite(t, n);
                            });
                        }),
                        (Polling.prototype.uri = function() {
                            var t = this.query || {},
                                e = this.secure ? "https" : "http",
                                n = "";
                            return (
                                !1 !== this.timestampRequests && (t[this.timestampParam] = a()),
                                this.supportsBinary || t.sid || (t.b64 = 1),
                                (t = o.encode(t)),
                                this.port &&
                                    (("https" == e && 443 != this.port) || ("http" == e && 80 != this.port)) &&
                                    (n = ":" + this.port),
                                t.length && (t = "?" + t),
                                e +
                                    "://" +
                                    (-1 !== this.hostname.indexOf(":") ? "[" + this.hostname + "]" : this.hostname) +
                                    n +
                                    this.path +
                                    t
                            );
                        });
                },
                {
                    "../transport": 4,
                    "component-inherit": 16,
                    debug: 17,
                    "engine.io-parser": 19,
                    parseqs: 27,
                    "xmlhttprequest-ssl": 10,
                    yeast: 30,
                },
            ],
            9: [
                function(t, e, n) {
                    (function(n) {
                        var r = t("../transport"),
                            o = t("engine.io-parser"),
                            i = t("parseqs"),
                            s = t("component-inherit"),
                            a = t("yeast"),
                            c = t("debug")("engine.io-client:websocket"),
                            p = n.WebSocket || n.MozWebSocket,
                            u = p;
                        if (!u && "undefined" == typeof window)
                            try {
                                u = t("ws");
                            } catch (t) {}

                        function WS(t) {
                            t && t.forceBase64 && (this.supportsBinary = !1),
                                (this.perMessageDeflate = t.perMessageDeflate),
                                r.call(this, t);
                        }

                        (e.exports = WS),
                            s(WS, r),
                            (WS.prototype.name = "websocket"),
                            (WS.prototype.supportsBinary = !0),
                            (WS.prototype.doOpen = function() {
                                if (this.check()) {
                                    var t = this.uri(),
                                        e = {
                                            agent: this.agent,
                                            perMessageDeflate: this.perMessageDeflate,
                                        };
                                    (e.pfx = this.pfx),
                                        (e.key = this.key),
                                        (e.passphrase = this.passphrase),
                                        (e.cert = this.cert),
                                        (e.ca = this.ca),
                                        (e.ciphers = this.ciphers),
                                        (e.rejectUnauthorized = this.rejectUnauthorized),
                                        this.extraHeaders && (e.headers = this.extraHeaders),
                                        (this.ws = p ? new u(t) : new u(t, void 0, e)),
                                        void 0 === this.ws.binaryType && (this.supportsBinary = !1),
                                        this.ws.supports && this.ws.supports.binary
                                            ? ((this.supportsBinary = !0), (this.ws.binaryType = "buffer"))
                                            : (this.ws.binaryType = "arraybuffer"),
                                        this.addEventListeners();
                                }
                            }),
                            (WS.prototype.addEventListeners = function() {
                                var t = this;
                                (this.ws.onopen = function() {
                                    t.onOpen();
                                }),
                                    (this.ws.onclose = function() {
                                        t.onClose();
                                    }),
                                    (this.ws.onmessage = function(e) {
                                        t.onData(e.data);
                                    }),
                                    (this.ws.onerror = function(e) {
                                        t.onError("websocket error", e);
                                    });
                            }),
                            "undefined" != typeof navigator &&
                                /iPad|iPhone|iPod/i.test(navigator.userAgent) &&
                                (WS.prototype.onData = function(t) {
                                    var e = this;
                                    setTimeout(function() {
                                        r.prototype.onData.call(e, t);
                                    }, 0);
                                }),
                            (WS.prototype.write = function(t) {
                                var e = this;
                                this.writable = !1;
                                for (var r = t.length, i = 0, s = r; i < s; i++)
                                    !(function(t) {
                                        o.encodePacket(t, e.supportsBinary, function(o) {
                                            if (!p) {
                                                var i = {};
                                                if (
                                                    (t.options && (i.compress = t.options.compress),
                                                    e.perMessageDeflate)
                                                )
                                                    ("string" == typeof o ? n.Buffer.byteLength(o) : o.length) <
                                                        e.perMessageDeflate.threshold && (i.compress = !1);
                                            }
                                            try {
                                                p ? e.ws.send(o) : e.ws.send(o, i);
                                            } catch (t) {
                                                c("websocket closed before onclose event");
                                            }
                                            --r || done();
                                        });
                                    })(t[i]);

                                function done() {
                                    e.emit("flush"),
                                        setTimeout(function() {
                                            (e.writable = !0), e.emit("drain");
                                        }, 0);
                                }
                            }),
                            (WS.prototype.onClose = function() {
                                r.prototype.onClose.call(this);
                            }),
                            (WS.prototype.doClose = function() {
                                void 0 !== this.ws && this.ws.close();
                            }),
                            (WS.prototype.uri = function() {
                                var t = this.query || {},
                                    e = this.secure ? "wss" : "ws",
                                    n = "";
                                return (
                                    this.port &&
                                        (("wss" == e && 443 != this.port) || ("ws" == e && 80 != this.port)) &&
                                        (n = ":" + this.port),
                                    this.timestampRequests && (t[this.timestampParam] = a()),
                                    this.supportsBinary || (t.b64 = 1),
                                    (t = i.encode(t)).length && (t = "?" + t),
                                    e +
                                        "://" +
                                        (-1 !== this.hostname.indexOf(":")
                                            ? "[" + this.hostname + "]"
                                            : this.hostname) +
                                        n +
                                        this.path +
                                        t
                                );
                            }),
                            (WS.prototype.check = function() {
                                return !(!u || ("__initialize" in u && this.name === WS.prototype.name));
                            });
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {
                    "../transport": 4,
                    "component-inherit": 16,
                    debug: 17,
                    "engine.io-parser": 19,
                    parseqs: 27,
                    ws: void 0,
                    yeast: 30,
                },
            ],
            10: [
                function(t, e, n) {
                    var r = t("has-cors");
                    e.exports = function(t) {
                        var e = t.xdomain,
                            n = t.xscheme,
                            o = t.enablesXDR;
                        try {
                            if ("undefined" != typeof XMLHttpRequest && (!e || r)) return new XMLHttpRequest();
                        } catch (t) {}
                        try {
                            if ("undefined" != typeof XDomainRequest && !n && o) return new XDomainRequest();
                        } catch (t) {}
                        if (!e)
                            try {
                                return new ActiveXObject("Microsoft.XMLHTTP");
                            } catch (t) {}
                    };
                },
                { "has-cors": 22 },
            ],
            11: [
                function(t, e, n) {
                    function noop() {}

                    e.exports = function after(t, e, n) {
                        var r = !1;
                        return (n = n || noop), (proxy.count = t), 0 === t ? e() : proxy;

                        function proxy(t, o) {
                            if (proxy.count <= 0) throw new Error("after called too many times");
                            --proxy.count, t ? ((r = !0), e(t), (e = n)) : 0 !== proxy.count || r || e(null, o);
                        }
                    };
                },
                {},
            ],
            12: [
                function(t, e, n) {
                    e.exports = function(t, e, n) {
                        var r = t.byteLength;
                        if (((e = e || 0), (n = n || r), t.slice)) return t.slice(e, n);
                        if ((e < 0 && (e += r), n < 0 && (n += r), n > r && (n = r), e >= r || e >= n || 0 === r))
                            return new ArrayBuffer(0);
                        for (var o = new Uint8Array(t), i = new Uint8Array(n - e), s = e, a = 0; s < n; s++, a++)
                            i[a] = o[s];
                        return i.buffer;
                    };
                },
                {},
            ],
            13: [
                function(t, e, n) {
                    !(function(t) {
                        "use strict";
                        (n.encode = function(e) {
                            var n,
                                r = new Uint8Array(e),
                                o = r.length,
                                i = "";
                            for (n = 0; n < o; n += 3)
                                (i += t[r[n] >> 2]),
                                    (i += t[((3 & r[n]) << 4) | (r[n + 1] >> 4)]),
                                    (i += t[((15 & r[n + 1]) << 2) | (r[n + 2] >> 6)]),
                                    (i += t[63 & r[n + 2]]);
                            return (
                                o % 3 == 2
                                    ? (i = i.substring(0, i.length - 1) + "=")
                                    : o % 3 == 1 && (i = i.substring(0, i.length - 2) + "=="),
                                i
                            );
                        }),
                            (n.decode = function(e) {
                                var n,
                                    r,
                                    o,
                                    i,
                                    s,
                                    a = 0.75 * e.length,
                                    c = e.length,
                                    p = 0;
                                "=" === e[e.length - 1] && (a--, "=" === e[e.length - 2] && a--);
                                var u = new ArrayBuffer(a),
                                    f = new Uint8Array(u);
                                for (n = 0; n < c; n += 4)
                                    (r = t.indexOf(e[n])),
                                        (o = t.indexOf(e[n + 1])),
                                        (i = t.indexOf(e[n + 2])),
                                        (s = t.indexOf(e[n + 3])),
                                        (f[p++] = (r << 2) | (o >> 4)),
                                        (f[p++] = ((15 & o) << 4) | (i >> 2)),
                                        (f[p++] = ((3 & i) << 6) | (63 & s));
                                return u;
                            });
                    })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
                },
                {},
            ],
            14: [
                function(t, e, n) {
                    (function(t) {
                        var n = t.BlobBuilder || t.WebKitBlobBuilder || t.MSBlobBuilder || t.MozBlobBuilder,
                            r = (function() {
                                try {
                                    return 2 === new Blob(["hi"]).size;
                                } catch (t) {
                                    return !1;
                                }
                            })(),
                            o =
                                r &&
                                (function() {
                                    try {
                                        return 2 === new Blob([new Uint8Array([1, 2])]).size;
                                    } catch (t) {
                                        return !1;
                                    }
                                })(),
                            i = n && n.prototype.append && n.prototype.getBlob;

                        function mapArrayBufferViews(t) {
                            for (var e = 0; e < t.length; e++) {
                                var n = t[e];
                                if (n.buffer instanceof ArrayBuffer) {
                                    var r = n.buffer;
                                    if (n.byteLength !== r.byteLength) {
                                        var o = new Uint8Array(n.byteLength);
                                        o.set(new Uint8Array(r, n.byteOffset, n.byteLength)), (r = o.buffer);
                                    }
                                    t[e] = r;
                                }
                            }
                        }

                        function BlobBuilderConstructor(t, e) {
                            e = e || {};
                            var r = new n();
                            mapArrayBufferViews(t);
                            for (var o = 0; o < t.length; o++) r.append(t[o]);
                            return e.type ? r.getBlob(e.type) : r.getBlob();
                        }

                        function BlobConstructor(t, e) {
                            return mapArrayBufferViews(t), new Blob(t, e || {});
                        }

                        e.exports = r ? (o ? t.Blob : BlobConstructor) : i ? BlobBuilderConstructor : void 0;
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {},
            ],
            15: [
                function(t, e, n) {
                    function Emitter(t) {
                        if (t)
                            return (function mixin(t) {
                                for (var e in Emitter.prototype) t[e] = Emitter.prototype[e];
                                return t;
                            })(t);
                    }

                    (e.exports = Emitter),
                        (Emitter.prototype.on = Emitter.prototype.addEventListener = function(t, e) {
                            return (
                                (this._callbacks = this._callbacks || {}),
                                (this._callbacks[t] = this._callbacks[t] || []).push(e),
                                this
                            );
                        }),
                        (Emitter.prototype.once = function(t, e) {
                            var n = this;

                            function on() {
                                n.off(t, on), e.apply(this, arguments);
                            }

                            return (this._callbacks = this._callbacks || {}), (on.fn = e), this.on(t, on), this;
                        }),
                        (Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(
                            t,
                            e
                        ) {
                            if (((this._callbacks = this._callbacks || {}), 0 == arguments.length))
                                return (this._callbacks = {}), this;
                            var n,
                                r = this._callbacks[t];
                            if (!r) return this;
                            if (1 == arguments.length) return delete this._callbacks[t], this;
                            for (var o = 0; o < r.length; o++)
                                if ((n = r[o]) === e || n.fn === e) {
                                    r.splice(o, 1);
                                    break;
                                }
                            return this;
                        }),
                        (Emitter.prototype.emit = function(t) {
                            this._callbacks = this._callbacks || {};
                            var e = [].slice.call(arguments, 1),
                                n = this._callbacks[t];
                            if (n) for (var r = 0, o = (n = n.slice(0)).length; r < o; ++r) n[r].apply(this, e);
                            return this;
                        }),
                        (Emitter.prototype.listeners = function(t) {
                            return (this._callbacks = this._callbacks || {}), this._callbacks[t] || [];
                        }),
                        (Emitter.prototype.hasListeners = function(t) {
                            return !!this.listeners(t).length;
                        });
                },
                {},
            ],
            16: [
                function(t, e, n) {
                    e.exports = function(t, e) {
                        var n = function() {};
                        (n.prototype = e.prototype), (t.prototype = new n()), (t.prototype.constructor = t);
                    };
                },
                {},
            ],
            17: [
                function(t, e, n) {
                    function load() {
                        var t;
                        try {
                            t = n.storage.debug;
                        } catch (t) {}
                        return t;
                    }

                    ((n = e.exports = t("./debug")).log = function log() {
                        return (
                            "object" == typeof console &&
                            console.log &&
                            Function.prototype.apply.call(console.log, console, arguments)
                        );
                    }),
                        (n.formatArgs = function formatArgs() {
                            var t = arguments,
                                e = this.useColors;
                            if (
                                ((t[0] =
                                    (e ? "%c" : "") +
                                    this.namespace +
                                    (e ? " %c" : " ") +
                                    t[0] +
                                    (e ? "%c " : " ") +
                                    "+" +
                                    n.humanize(this.diff)),
                                !e)
                            )
                                return t;
                            var r = "color: " + this.color;
                            t = [t[0], r, "color: inherit"].concat(Array.prototype.slice.call(t, 1));
                            var o = 0,
                                i = 0;
                            return (
                                t[0].replace(/%[a-z%]/g, function(t) {
                                    "%%" !== t && (o++, "%c" === t && (i = o));
                                }),
                                t.splice(i, 0, r),
                                t
                            );
                        }),
                        (n.save = function save(t) {
                            try {
                                null == t ? n.storage.removeItem("debug") : (n.storage.debug = t);
                            } catch (t) {}
                        }),
                        (n.load = load),
                        (n.useColors = function useColors() {
                            return (
                                "WebkitAppearance" in document.documentElement.style ||
                                (window.console && (console.firebug || (console.exception && console.table))) ||
                                (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
                                    parseInt(RegExp.$1, 10) >= 31)
                            );
                        }),
                        (n.storage =
                            "undefined" != typeof chrome && void 0 !== chrome.storage
                                ? chrome.storage.local
                                : (function localstorage() {
                                      try {
                                          return window.localStorage;
                                      } catch (t) {}
                                  })()),
                        (n.colors = [
                            "lightseagreen",
                            "forestgreen",
                            "goldenrod",
                            "dodgerblue",
                            "darkorchid",
                            "crimson",
                        ]),
                        (n.formatters.j = function(t) {
                            return JSON.stringify(t);
                        }),
                        n.enable(load());
                },
                { "./debug": 18 },
            ],
            18: [
                function(t, e, n) {
                    ((n = e.exports = function debug(t) {
                        function disabled() {}

                        function enabled() {
                            var t = enabled,
                                e = +new Date(),
                                i = e - (r || e);
                            (t.diff = i),
                                (t.prev = r),
                                (t.curr = e),
                                (r = e),
                                null == t.useColors && (t.useColors = n.useColors()),
                                null == t.color &&
                                    t.useColors &&
                                    (t.color = (function selectColor() {
                                        return n.colors[o++ % n.colors.length];
                                    })());
                            var s = Array.prototype.slice.call(arguments);
                            (s[0] = n.coerce(s[0])), "string" != typeof s[0] && (s = ["%o"].concat(s));
                            var a = 0;
                            (s[0] = s[0].replace(/%([a-z%])/g, function(e, r) {
                                if ("%%" === e) return e;
                                a++;
                                var o = n.formatters[r];
                                if ("function" == typeof o) {
                                    var i = s[a];
                                    (e = o.call(t, i)), s.splice(a, 1), a--;
                                }
                                return e;
                            })),
                                "function" == typeof n.formatArgs && (s = n.formatArgs.apply(t, s));
                            var c = enabled.log || n.log || console.log.bind(console);
                            c.apply(t, s);
                        }

                        (disabled.enabled = !1), (enabled.enabled = !0);
                        var e = n.enabled(t) ? enabled : disabled;
                        return (e.namespace = t), e;
                    }).coerce = function coerce(t) {
                        return t instanceof Error ? t.stack || t.message : t;
                    }),
                        (n.disable = function disable() {
                            n.enable("");
                        }),
                        (n.enable = function enable(t) {
                            n.save(t);
                            for (var e = (t || "").split(/[\s,]+/), r = e.length, o = 0; o < r; o++)
                                e[o] &&
                                    ("-" === (t = e[o].replace(/\*/g, ".*?"))[0]
                                        ? n.skips.push(new RegExp("^" + t.substr(1) + "$"))
                                        : n.names.push(new RegExp("^" + t + "$")));
                        }),
                        (n.enabled = function enabled(t) {
                            var e, r;
                            for (e = 0, r = n.skips.length; e < r; e++) if (n.skips[e].test(t)) return !1;
                            for (e = 0, r = n.names.length; e < r; e++) if (n.names[e].test(t)) return !0;
                            return !1;
                        }),
                        (n.humanize = t("ms")),
                        (n.names = []),
                        (n.skips = []),
                        (n.formatters = {});
                    var r,
                        o = 0;
                },
                { ms: 25 },
            ],
            19: [
                function(t, e, n) {
                    (function(e) {
                        var r = t("./keys"),
                            o = t("has-binary"),
                            i = t("arraybuffer.slice"),
                            s = t("base64-arraybuffer"),
                            a = t("after"),
                            c = t("utf8"),
                            p = navigator.userAgent.match(/Android/i),
                            u = /PhantomJS/i.test(navigator.userAgent),
                            f = p || u;
                        n.protocol = 3;
                        var h = (n.packets = {
                                open: 0,
                                close: 1,
                                ping: 2,
                                pong: 3,
                                message: 4,
                                upgrade: 5,
                                noop: 6,
                            }),
                            l = r(h),
                            d = { type: "error", data: "parser error" },
                            y = t("blob");

                        function map(t, e, n) {
                            for (
                                var r = new Array(t.length),
                                    o = a(t.length, n),
                                    i = function(t, n, o) {
                                        e(n, function(e, n) {
                                            (r[t] = n), o(e, r);
                                        });
                                    },
                                    s = 0;
                                s < t.length;
                                s++
                            )
                                i(s, t[s], o);
                        }

                        (n.encodePacket = function(t, r, o, i) {
                            "function" == typeof r && ((i = r), (r = !1)),
                                "function" == typeof o && ((i = o), (o = null));
                            var s = void 0 === t.data ? void 0 : t.data.buffer || t.data;
                            if (e.ArrayBuffer && s instanceof ArrayBuffer)
                                return (function encodeArrayBuffer(t, e, r) {
                                    if (!e) return n.encodeBase64Packet(t, r);
                                    var o = t.data,
                                        i = new Uint8Array(o),
                                        s = new Uint8Array(1 + o.byteLength);
                                    s[0] = h[t.type];
                                    for (var a = 0; a < i.length; a++) s[a + 1] = i[a];
                                    return r(s.buffer);
                                })(t, r, i);
                            if (y && s instanceof e.Blob)
                                return (function encodeBlob(t, e, r) {
                                    if (!e) return n.encodeBase64Packet(t, r);
                                    if (f)
                                        return (function encodeBlobAsArrayBuffer(t, e, r) {
                                            if (!e) return n.encodeBase64Packet(t, r);
                                            var o = new FileReader();
                                            return (
                                                (o.onload = function() {
                                                    (t.data = o.result), n.encodePacket(t, e, !0, r);
                                                }),
                                                o.readAsArrayBuffer(t.data)
                                            );
                                        })(t, e, r);
                                    var o = new Uint8Array(1);
                                    o[0] = h[t.type];
                                    var i = new y([o.buffer, t.data]);
                                    return r(i);
                                })(t, r, i);
                            if (s && s.base64)
                                return (function encodeBase64Object(t, e) {
                                    var r = "b" + n.packets[t.type] + t.data.data;
                                    return e(r);
                                })(t, i);
                            var a = h[t.type];
                            return void 0 !== t.data && (a += o ? c.encode(String(t.data)) : String(t.data)), i("" + a);
                        }),
                            (n.encodeBase64Packet = function(t, r) {
                                var o,
                                    i = "b" + n.packets[t.type];
                                if (y && t.data instanceof e.Blob) {
                                    var s = new FileReader();
                                    return (
                                        (s.onload = function() {
                                            var t = s.result.split(",")[1];
                                            r(i + t);
                                        }),
                                        s.readAsDataURL(t.data)
                                    );
                                }
                                try {
                                    o = String.fromCharCode.apply(null, new Uint8Array(t.data));
                                } catch (e) {
                                    for (
                                        var a = new Uint8Array(t.data), c = new Array(a.length), p = 0;
                                        p < a.length;
                                        p++
                                    )
                                        c[p] = a[p];
                                    o = String.fromCharCode.apply(null, c);
                                }
                                return (i += e.btoa(o)), r(i);
                            }),
                            (n.decodePacket = function(t, e, r) {
                                if ("string" == typeof t || void 0 === t) {
                                    if ("b" == t.charAt(0)) return n.decodeBase64Packet(t.substr(1), e);
                                    if (r)
                                        try {
                                            t = c.decode(t);
                                        } catch (t) {
                                            return d;
                                        }
                                    var o = t.charAt(0);
                                    return Number(o) == o && l[o]
                                        ? t.length > 1
                                            ? {
                                                  type: l[o],
                                                  data: t.substring(1),
                                              }
                                            : { type: l[o] }
                                        : d;
                                }
                                o = new Uint8Array(t)[0];
                                var s = i(t, 1);
                                return y && "blob" === e && (s = new y([s])), { type: l[o], data: s };
                            }),
                            (n.decodeBase64Packet = function(t, n) {
                                var r = l[t.charAt(0)];
                                if (!e.ArrayBuffer)
                                    return {
                                        type: r,
                                        data: { base64: !0, data: t.substr(1) },
                                    };
                                var o = s.decode(t.substr(1));
                                return "blob" === n && y && (o = new y([o])), { type: r, data: o };
                            }),
                            (n.encodePayload = function(t, e, r) {
                                "function" == typeof e && ((r = e), (e = null));
                                var i = o(t);
                                if (e && i)
                                    return y && !f ? n.encodePayloadAsBlob(t, r) : n.encodePayloadAsArrayBuffer(t, r);
                                if (!t.length) return r("0:");
                                map(
                                    t,
                                    function encodeOne(t, r) {
                                        n.encodePacket(t, !!i && e, !0, function(t) {
                                            r(
                                                null,
                                                (function setLengthHeader(t) {
                                                    return t.length + ":" + t;
                                                })(t)
                                            );
                                        });
                                    },
                                    function(t, e) {
                                        return r(e.join(""));
                                    }
                                );
                            }),
                            (n.decodePayload = function(t, e, r) {
                                if ("string" != typeof t) return n.decodePayloadAsBinary(t, e, r);
                                var o;
                                if (("function" == typeof e && ((r = e), (e = null)), "" == t)) return r(d, 0, 1);
                                for (var i, s, a = "", c = 0, p = t.length; c < p; c++) {
                                    var u = t.charAt(c);
                                    if (":" != u) a += u;
                                    else {
                                        if ("" == a || a != (i = Number(a))) return r(d, 0, 1);
                                        if (a != (s = t.substr(c + 1, i)).length) return r(d, 0, 1);
                                        if (s.length) {
                                            if (((o = n.decodePacket(s, e, !0)), d.type == o.type && d.data == o.data))
                                                return r(d, 0, 1);
                                            if (!1 === r(o, c + i, p)) return;
                                        }
                                        (c += i), (a = "");
                                    }
                                }
                                return "" != a ? r(d, 0, 1) : void 0;
                            }),
                            (n.encodePayloadAsArrayBuffer = function(t, e) {
                                if (!t.length) return e(new ArrayBuffer(0));
                                map(
                                    t,
                                    function encodeOne(t, e) {
                                        n.encodePacket(t, !0, !0, function(t) {
                                            return e(null, t);
                                        });
                                    },
                                    function(t, n) {
                                        var r = n.reduce(function(t, e) {
                                                var n;
                                                return (
                                                    t +
                                                    (n = "string" == typeof e ? e.length : e.byteLength).toString()
                                                        .length +
                                                    n +
                                                    2
                                                );
                                            }, 0),
                                            o = new Uint8Array(r),
                                            i = 0;
                                        return (
                                            n.forEach(function(t) {
                                                var e = "string" == typeof t,
                                                    n = t;
                                                if (e) {
                                                    for (var r = new Uint8Array(t.length), s = 0; s < t.length; s++)
                                                        r[s] = t.charCodeAt(s);
                                                    n = r.buffer;
                                                }
                                                o[i++] = e ? 0 : 1;
                                                var a = n.byteLength.toString();
                                                for (s = 0; s < a.length; s++) o[i++] = parseInt(a[s]);
                                                o[i++] = 255;
                                                for (r = new Uint8Array(n), s = 0; s < r.length; s++) o[i++] = r[s];
                                            }),
                                            e(o.buffer)
                                        );
                                    }
                                );
                            }),
                            (n.encodePayloadAsBlob = function(t, e) {
                                map(
                                    t,
                                    function encodeOne(t, e) {
                                        n.encodePacket(t, !0, !0, function(t) {
                                            var n = new Uint8Array(1);
                                            if (((n[0] = 1), "string" == typeof t)) {
                                                for (var r = new Uint8Array(t.length), o = 0; o < t.length; o++)
                                                    r[o] = t.charCodeAt(o);
                                                (t = r.buffer), (n[0] = 0);
                                            }
                                            var i = (t instanceof ArrayBuffer ? t.byteLength : t.size).toString(),
                                                s = new Uint8Array(i.length + 1);
                                            for (o = 0; o < i.length; o++) s[o] = parseInt(i[o]);
                                            if (((s[i.length] = 255), y)) {
                                                var a = new y([n.buffer, s.buffer, t]);
                                                e(null, a);
                                            }
                                        });
                                    },
                                    function(t, n) {
                                        return e(new y(n));
                                    }
                                );
                            }),
                            (n.decodePayloadAsBinary = function(t, e, r) {
                                "function" == typeof e && ((r = e), (e = null));
                                for (var o = t, s = [], a = !1; o.byteLength > 0; ) {
                                    for (var c = new Uint8Array(o), p = 0 === c[0], u = "", f = 1; 255 != c[f]; f++) {
                                        if (u.length > 310) {
                                            a = !0;
                                            break;
                                        }
                                        u += c[f];
                                    }
                                    if (a) return r(d, 0, 1);
                                    (o = i(o, 2 + u.length)), (u = parseInt(u));
                                    var h = i(o, 0, u);
                                    if (p)
                                        try {
                                            h = String.fromCharCode.apply(null, new Uint8Array(h));
                                        } catch (t) {
                                            var l = new Uint8Array(h);
                                            h = "";
                                            for (f = 0; f < l.length; f++) h += String.fromCharCode(l[f]);
                                        }
                                    s.push(h), (o = i(o, u));
                                }
                                var y = s.length;
                                s.forEach(function(t, o) {
                                    r(n.decodePacket(t, e, !0), o, y);
                                });
                            });
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {
                    "./keys": 20,
                    after: 11,
                    "arraybuffer.slice": 12,
                    "base64-arraybuffer": 13,
                    blob: 14,
                    "has-binary": 21,
                    utf8: 29,
                },
            ],
            20: [
                function(t, e, n) {
                    e.exports =
                        Object.keys ||
                        function keys(t) {
                            var e = [],
                                n = Object.prototype.hasOwnProperty;
                            for (var r in t) n.call(t, r) && e.push(r);
                            return e;
                        };
                },
                {},
            ],
            21: [
                function(t, e, n) {
                    (function(n) {
                        var r = t("isarray");
                        e.exports = function hasBinary(t) {
                            return (function _hasBinary(t) {
                                if (!t) return !1;
                                if (
                                    (n.Buffer && n.Buffer.isBuffer(t)) ||
                                    (n.ArrayBuffer && t instanceof ArrayBuffer) ||
                                    (n.Blob && t instanceof Blob) ||
                                    (n.File && t instanceof File)
                                )
                                    return !0;
                                if (r(t)) {
                                    for (var e = 0; e < t.length; e++) if (_hasBinary(t[e])) return !0;
                                } else if (t && "object" == typeof t)
                                    for (var o in (t.toJSON && (t = t.toJSON()), t))
                                        if (Object.prototype.hasOwnProperty.call(t, o) && _hasBinary(t[o])) return !0;
                                return !1;
                            })(t);
                        };
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                { isarray: 24 },
            ],
            22: [
                function(t, e, n) {
                    try {
                        e.exports = "undefined" != typeof XMLHttpRequest && "withCredentials" in new XMLHttpRequest();
                    } catch (t) {
                        e.exports = !1;
                    }
                },
                {},
            ],
            23: [
                function(t, e, n) {
                    var r = [].indexOf;
                    e.exports = function(t, e) {
                        if (r) return t.indexOf(e);
                        for (var n = 0; n < t.length; ++n) if (t[n] === e) return n;
                        return -1;
                    };
                },
                {},
            ],
            24: [
                function(t, e, n) {
                    e.exports =
                        Array.isArray ||
                        function(t) {
                            return "[object Array]" == Object.prototype.toString.call(t);
                        };
                },
                {},
            ],
            25: [
                function(t, e, n) {
                    var r = 1e3,
                        o = 60 * r,
                        i = 60 * o,
                        s = 24 * i,
                        a = 365.25 * s;

                    function plural(t, e, n) {
                        if (!(t < e))
                            return t < 1.5 * e ? Math.floor(t / e) + " " + n : Math.ceil(t / e) + " " + n + "s";
                    }

                    e.exports = function(t, e) {
                        return (
                            (e = e || {}),
                            "string" == typeof t
                                ? (function parse(t) {
                                      if ((t = "" + t).length > 1e4) return;
                                      var e = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                                          t
                                      );
                                      if (!e) return;
                                      var n = parseFloat(e[1]);
                                      switch ((e[2] || "ms").toLowerCase()) {
                                          case "years":
                                          case "year":
                                          case "yrs":
                                          case "yr":
                                          case "y":
                                              return n * a;
                                          case "days":
                                          case "day":
                                          case "d":
                                              return n * s;
                                          case "hours":
                                          case "hour":
                                          case "hrs":
                                          case "hr":
                                          case "h":
                                              return n * i;
                                          case "minutes":
                                          case "minute":
                                          case "mins":
                                          case "min":
                                          case "m":
                                              return n * o;
                                          case "seconds":
                                          case "second":
                                          case "secs":
                                          case "sec":
                                          case "s":
                                              return n * r;
                                          case "milliseconds":
                                          case "millisecond":
                                          case "msecs":
                                          case "msec":
                                          case "ms":
                                              return n;
                                      }
                                  })(t)
                                : e.long
                                ? (function long(t) {
                                      return (
                                          plural(t, s, "day") ||
                                          plural(t, i, "hour") ||
                                          plural(t, o, "minute") ||
                                          plural(t, r, "second") ||
                                          t + " ms"
                                      );
                                  })(t)
                                : (function short(t) {
                                      return t >= s
                                          ? Math.round(t / s) + "d"
                                          : t >= i
                                          ? Math.round(t / i) + "h"
                                          : t >= o
                                          ? Math.round(t / o) + "m"
                                          : t >= r
                                          ? Math.round(t / r) + "s"
                                          : t + "ms";
                                  })(t)
                        );
                    };
                },
                {},
            ],
            26: [
                function(t, e, n) {
                    (function(t) {
                        var n = /^[\],:{}\s]*$/,
                            r = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                            o = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                            i = /(?:^|:|,)(?:\s*\[)+/g,
                            s = /^\s+/,
                            a = /\s+$/;
                        e.exports = function parsejson(e) {
                            return "string" == typeof e && e
                                ? ((e = e.replace(s, "").replace(a, "")),
                                  t.JSON && JSON.parse
                                      ? JSON.parse(e)
                                      : n.test(
                                            e
                                                .replace(r, "@")
                                                .replace(o, "]")
                                                .replace(i, "")
                                        )
                                      ? new Function("return " + e)()
                                      : void 0)
                                : null;
                        };
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {},
            ],
            27: [
                function(t, e, n) {
                    (n.encode = function(t) {
                        var e = "";
                        for (var n in t)
                            t.hasOwnProperty(n) &&
                                (e.length && (e += "&"), (e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n])));
                        return e;
                    }),
                        (n.decode = function(t) {
                            for (var e = {}, n = t.split("&"), r = 0, o = n.length; r < o; r++) {
                                var i = n[r].split("=");
                                e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
                            }
                            return e;
                        });
                },
                {},
            ],
            28: [
                function(t, e, n) {
                    var r = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                        o = [
                            "source",
                            "protocol",
                            "authority",
                            "userInfo",
                            "user",
                            "password",
                            "host",
                            "port",
                            "relative",
                            "path",
                            "directory",
                            "file",
                            "query",
                            "anchor",
                        ];
                    e.exports = function parseuri(t) {
                        var e = t,
                            n = t.indexOf("["),
                            i = t.indexOf("]");
                        -1 != n &&
                            -1 != i &&
                            (t = t.substring(0, n) + t.substring(n, i).replace(/:/g, ";") + t.substring(i, t.length));
                        for (var s = r.exec(t || ""), a = {}, c = 14; c--; ) a[o[c]] = s[c] || "";
                        return (
                            -1 != n &&
                                -1 != i &&
                                ((a.source = e),
                                (a.host = a.host.substring(1, a.host.length - 1).replace(/;/g, ":")),
                                (a.authority = a.authority
                                    .replace("[", "")
                                    .replace("]", "")
                                    .replace(/;/g, ":")),
                                (a.ipv6uri = !0)),
                            a
                        );
                    };
                },
                {},
            ],
            29: [
                function(t, e, n) {
                    (function(t) {
                        !(function(r) {
                            var o = "object" == typeof n && n,
                                i = "object" == typeof e && e && e.exports == o && e,
                                s = "object" == typeof t && t;
                            (s.global !== s && s.window !== s) || (r = s);
                            var a,
                                c,
                                p,
                                u = String.fromCharCode;

                            function ucs2decode(t) {
                                for (var e, n, r = [], o = 0, i = t.length; o < i; )
                                    (e = t.charCodeAt(o++)) >= 55296 && e <= 56319 && o < i
                                        ? 56320 == (64512 & (n = t.charCodeAt(o++)))
                                            ? r.push(((1023 & e) << 10) + (1023 & n) + 65536)
                                            : (r.push(e), o--)
                                        : r.push(e);
                                return r;
                            }

                            function checkScalarValue(t) {
                                if (t >= 55296 && t <= 57343)
                                    throw Error(
                                        "Lone surrogate U+" + t.toString(16).toUpperCase() + " is not a scalar value"
                                    );
                            }

                            function createByte(t, e) {
                                return u(((t >> e) & 63) | 128);
                            }

                            function encodeCodePoint(t) {
                                if (0 == (4294967168 & t)) return u(t);
                                var e = "";
                                return (
                                    0 == (4294965248 & t)
                                        ? (e = u(((t >> 6) & 31) | 192))
                                        : 0 == (4294901760 & t)
                                        ? (checkScalarValue(t),
                                          (e = u(((t >> 12) & 15) | 224)),
                                          (e += createByte(t, 6)))
                                        : 0 == (4292870144 & t) &&
                                          ((e = u(((t >> 18) & 7) | 240)),
                                          (e += createByte(t, 12)),
                                          (e += createByte(t, 6))),
                                    (e += u((63 & t) | 128))
                                );
                            }

                            function readContinuationByte() {
                                if (p >= c) throw Error("Invalid byte index");
                                var t = 255 & a[p];
                                if ((p++, 128 == (192 & t))) return 63 & t;
                                throw Error("Invalid continuation byte");
                            }

                            function decodeSymbol() {
                                var t, e;
                                if (p > c) throw Error("Invalid byte index");
                                if (p == c) return !1;
                                if (((t = 255 & a[p]), p++, 0 == (128 & t))) return t;
                                if (192 == (224 & t)) {
                                    if ((e = ((31 & t) << 6) | readContinuationByte()) >= 128) return e;
                                    throw Error("Invalid continuation byte");
                                }
                                if (224 == (240 & t)) {
                                    if (
                                        (e =
                                            ((15 & t) << 12) |
                                            (readContinuationByte() << 6) |
                                            readContinuationByte()) >= 2048
                                    )
                                        return checkScalarValue(e), e;
                                    throw Error("Invalid continuation byte");
                                }
                                if (
                                    240 == (248 & t) &&
                                    (e =
                                        ((15 & t) << 18) |
                                        (readContinuationByte() << 12) |
                                        (readContinuationByte() << 6) |
                                        readContinuationByte()) >= 65536 &&
                                    e <= 1114111
                                )
                                    return e;
                                throw Error("Invalid UTF-8 detected");
                            }

                            var f = {
                                version: "2.0.0",
                                encode: function utf8encode(t) {
                                    for (var e = ucs2decode(t), n = e.length, r = -1, o = ""; ++r < n; )
                                        o += encodeCodePoint(e[r]);
                                    return o;
                                },
                                decode: function utf8decode(t) {
                                    (a = ucs2decode(t)), (c = a.length), (p = 0);
                                    for (var e, n = []; !1 !== (e = decodeSymbol()); ) n.push(e);
                                    return (function ucs2encode(t) {
                                        for (var e, n = t.length, r = -1, o = ""; ++r < n; )
                                            (e = t[r]) > 65535 &&
                                                ((o += u((((e -= 65536) >>> 10) & 1023) | 55296)),
                                                (e = 56320 | (1023 & e))),
                                                (o += u(e));
                                        return o;
                                    })(n);
                                },
                            };
                            if (o && !o.nodeType)
                                if (i) i.exports = f;
                                else {
                                    var h = {}.hasOwnProperty;
                                    for (var l in f) h.call(f, l) && (o[l] = f[l]);
                                }
                            else r.utf8 = f;
                        })(this);
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {},
            ],
            30: [
                function(t, e, n) {
                    "use strict";
                    var r,
                        o = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""),
                        i = 64,
                        s = {},
                        a = 0,
                        c = 0;

                    function encode(t) {
                        for (var e = ""; (e = o[t % i] + e), (t = Math.floor(t / i)) > 0; );
                        return e;
                    }

                    function yeast() {
                        var t = encode(+new Date());
                        return t !== r ? ((a = 0), (r = t)) : t + "." + encode(a++);
                    }

                    for (; c < i; c++) s[o[c]] = c;
                    (yeast.encode = encode),
                        (yeast.decode = function decode(t) {
                            var e = 0;
                            for (c = 0; c < t.length; c++) e = e * i + s[t.charAt(c)];
                            return e;
                        }),
                        (e.exports = yeast);
                },
                {},
            ],
            31: [
                function(t, e, n) {
                    var r = t("./url"),
                        o = t("socket.io-parser"),
                        i = t("./manager"),
                        s = t("debug")("socket.io-client");
                    e.exports = n = lookup;
                    var a = (n.managers = {});

                    function lookup(t, e) {
                        "object" == typeof t && ((e = t), (t = void 0)), (e = e || {});
                        var n,
                            o = r(t),
                            c = o.source,
                            p = o.id,
                            u = o.path,
                            f = a[p] && u in a[p].nsps;
                        return (
                            e.forceNew || e["force new connection"] || !1 === e.multiplex || f
                                ? (s("ignoring socket cache for %s", c), (n = i(c, e)))
                                : (a[p] || (s("new io instance for %s", c), (a[p] = i(c, e))), (n = a[p])),
                            n.socket(o.path)
                        );
                    }

                    (n.protocol = o.protocol),
                        (n.connect = lookup),
                        (n.Manager = t("./manager")),
                        (n.Socket = t("./socket"));
                },
                {
                    "./manager": 32,
                    "./socket": 34,
                    "./url": 35,
                    debug: 39,
                    "socket.io-parser": 47,
                },
            ],
            32: [
                function(t, e, n) {
                    var r = t("engine.io-client"),
                        o = t("./socket"),
                        i = t("component-emitter"),
                        s = t("socket.io-parser"),
                        a = t("./on"),
                        c = t("component-bind"),
                        p = t("debug")("socket.io-client:manager"),
                        u = t("indexof"),
                        f = t("backo2"),
                        h = Object.prototype.hasOwnProperty;

                    function Manager(t, e) {
                        if (!(this instanceof Manager)) return new Manager(t, e);
                        t && "object" == typeof t && ((e = t), (t = void 0)),
                            ((e = e || {}).path = e.path || "/socket.io"),
                            (this.nsps = {}),
                            (this.subs = []),
                            (this.opts = e),
                            this.reconnection(!1 !== e.reconnection),
                            this.reconnectionAttempts(e.reconnectionAttempts || 1 / 0),
                            this.reconnectionDelay(e.reconnectionDelay || 1e3),
                            this.reconnectionDelayMax(e.reconnectionDelayMax || 5e3),
                            this.randomizationFactor(e.randomizationFactor || 0.5),
                            (this.backoff = new f({
                                min: this.reconnectionDelay(),
                                max: this.reconnectionDelayMax(),
                                jitter: this.randomizationFactor(),
                            })),
                            this.timeout(null == e.timeout ? 2e4 : e.timeout),
                            (this.readyState = "closed"),
                            (this.uri = t),
                            (this.connecting = []),
                            (this.lastPing = null),
                            (this.encoding = !1),
                            (this.packetBuffer = []),
                            (this.encoder = new s.Encoder()),
                            (this.decoder = new s.Decoder()),
                            (this.autoConnect = !1 !== e.autoConnect),
                            this.autoConnect && this.open();
                    }

                    (e.exports = Manager),
                        (Manager.prototype.emitAll = function() {
                            for (var t in (this.emit.apply(this, arguments), this.nsps))
                                h.call(this.nsps, t) && this.nsps[t].emit.apply(this.nsps[t], arguments);
                        }),
                        (Manager.prototype.updateSocketIds = function() {
                            for (var t in this.nsps) h.call(this.nsps, t) && (this.nsps[t].id = this.engine.id);
                        }),
                        i(Manager.prototype),
                        (Manager.prototype.reconnection = function(t) {
                            return arguments.length ? ((this._reconnection = !!t), this) : this._reconnection;
                        }),
                        (Manager.prototype.reconnectionAttempts = function(t) {
                            return arguments.length
                                ? ((this._reconnectionAttempts = t), this)
                                : this._reconnectionAttempts;
                        }),
                        (Manager.prototype.reconnectionDelay = function(t) {
                            return arguments.length
                                ? ((this._reconnectionDelay = t), this.backoff && this.backoff.setMin(t), this)
                                : this._reconnectionDelay;
                        }),
                        (Manager.prototype.randomizationFactor = function(t) {
                            return arguments.length
                                ? ((this._randomizationFactor = t), this.backoff && this.backoff.setJitter(t), this)
                                : this._randomizationFactor;
                        }),
                        (Manager.prototype.reconnectionDelayMax = function(t) {
                            return arguments.length
                                ? ((this._reconnectionDelayMax = t), this.backoff && this.backoff.setMax(t), this)
                                : this._reconnectionDelayMax;
                        }),
                        (Manager.prototype.timeout = function(t) {
                            return arguments.length ? ((this._timeout = t), this) : this._timeout;
                        }),
                        (Manager.prototype.maybeReconnectOnOpen = function() {
                            !this.reconnecting && this._reconnection && 0 === this.backoff.attempts && this.reconnect();
                        }),
                        (Manager.prototype.open = Manager.prototype.connect = function(t) {
                            if ((p("readyState %s", this.readyState), ~this.readyState.indexOf("open"))) return this;
                            p("opening %s", this.uri), (this.engine = r(this.uri, this.opts));
                            var e = this.engine,
                                n = this;
                            (this.readyState = "opening"), (this.skipReconnect = !1);
                            var o = a(e, "open", function() {
                                    n.onopen(), t && t();
                                }),
                                i = a(e, "error", function(e) {
                                    if (
                                        (p("connect_error"),
                                        n.cleanup(),
                                        (n.readyState = "closed"),
                                        n.emitAll("connect_error", e),
                                        t)
                                    ) {
                                        var r = new Error("Connection error");
                                        (r.data = e), t(r);
                                    } else n.maybeReconnectOnOpen();
                                });
                            if (!1 !== this._timeout) {
                                var s = this._timeout;
                                p("connect attempt will timeout after %d", s);
                                var c = setTimeout(function() {
                                    p("connect attempt timed out after %d", s),
                                        o.destroy(),
                                        e.close(),
                                        e.emit("error", "timeout"),
                                        n.emitAll("connect_timeout", s);
                                }, s);
                                this.subs.push({
                                    destroy: function() {
                                        clearTimeout(c);
                                    },
                                });
                            }
                            return this.subs.push(o), this.subs.push(i), this;
                        }),
                        (Manager.prototype.onopen = function() {
                            p("open"), this.cleanup(), (this.readyState = "open"), this.emit("open");
                            var t = this.engine;
                            this.subs.push(a(t, "data", c(this, "ondata"))),
                                this.subs.push(a(t, "ping", c(this, "onping"))),
                                this.subs.push(a(t, "pong", c(this, "onpong"))),
                                this.subs.push(a(t, "error", c(this, "onerror"))),
                                this.subs.push(a(t, "close", c(this, "onclose"))),
                                this.subs.push(a(this.decoder, "decoded", c(this, "ondecoded")));
                        }),
                        (Manager.prototype.onping = function() {
                            (this.lastPing = new Date()), this.emitAll("ping");
                        }),
                        (Manager.prototype.onpong = function() {
                            this.emitAll("pong", new Date() - this.lastPing);
                        }),
                        (Manager.prototype.ondata = function(t) {
                            this.decoder.add(t);
                        }),
                        (Manager.prototype.ondecoded = function(t) {
                            this.emit("packet", t);
                        }),
                        (Manager.prototype.onerror = function(t) {
                            p("error", t), this.emitAll("error", t);
                        }),
                        (Manager.prototype.socket = function(t) {
                            var e = this.nsps[t];
                            if (!e) {
                                (e = new o(this, t)), (this.nsps[t] = e);
                                var n = this;
                                e.on("connecting", onConnecting),
                                    e.on("connect", function() {
                                        e.id = n.engine.id;
                                    }),
                                    this.autoConnect && onConnecting();
                            }

                            function onConnecting() {
                                ~u(n.connecting, e) || n.connecting.push(e);
                            }

                            return e;
                        }),
                        (Manager.prototype.destroy = function(t) {
                            var e = u(this.connecting, t);
                            ~e && this.connecting.splice(e, 1), this.connecting.length || this.close();
                        }),
                        (Manager.prototype.packet = function(t) {
                            p("writing packet %j", t);
                            var e = this;
                            e.encoding
                                ? e.packetBuffer.push(t)
                                : ((e.encoding = !0),
                                  this.encoder.encode(t, function(n) {
                                      for (var r = 0; r < n.length; r++) e.engine.write(n[r], t.options);
                                      (e.encoding = !1), e.processPacketQueue();
                                  }));
                        }),
                        (Manager.prototype.processPacketQueue = function() {
                            if (this.packetBuffer.length > 0 && !this.encoding) {
                                var t = this.packetBuffer.shift();
                                this.packet(t);
                            }
                        }),
                        (Manager.prototype.cleanup = function() {
                            var t;
                            for (p("cleanup"); (t = this.subs.shift()); ) t.destroy();
                            (this.packetBuffer = []),
                                (this.encoding = !1),
                                (this.lastPing = null),
                                this.decoder.destroy();
                        }),
                        (Manager.prototype.close = Manager.prototype.disconnect = function() {
                            p("disconnect"),
                                (this.skipReconnect = !0),
                                (this.reconnecting = !1),
                                "opening" == this.readyState && this.cleanup(),
                                this.backoff.reset(),
                                (this.readyState = "closed"),
                                this.engine && this.engine.close();
                        }),
                        (Manager.prototype.onclose = function(t) {
                            p("onclose"),
                                this.cleanup(),
                                this.backoff.reset(),
                                (this.readyState = "closed"),
                                this.emit("close", t),
                                this._reconnection && !this.skipReconnect && this.reconnect();
                        }),
                        (Manager.prototype.reconnect = function() {
                            if (this.reconnecting || this.skipReconnect) return this;
                            var t = this;
                            if (this.backoff.attempts >= this._reconnectionAttempts)
                                p("reconnect failed"),
                                    this.backoff.reset(),
                                    this.emitAll("reconnect_failed"),
                                    (this.reconnecting = !1);
                            else {
                                var e = this.backoff.duration();
                                p("will wait %dms before reconnect attempt", e), (this.reconnecting = !0);
                                var n = setTimeout(function() {
                                    t.skipReconnect ||
                                        (p("attempting reconnect"),
                                        t.emitAll("reconnect_attempt", t.backoff.attempts),
                                        t.emitAll("reconnecting", t.backoff.attempts),
                                        t.skipReconnect ||
                                            t.open(function(e) {
                                                e
                                                    ? (p("reconnect attempt error"),
                                                      (t.reconnecting = !1),
                                                      t.reconnect(),
                                                      t.emitAll("reconnect_error", e.data))
                                                    : (p("reconnect success"), t.onreconnect());
                                            }));
                                }, e);
                                this.subs.push({
                                    destroy: function() {
                                        clearTimeout(n);
                                    },
                                });
                            }
                        }),
                        (Manager.prototype.onreconnect = function() {
                            var t = this.backoff.attempts;
                            (this.reconnecting = !1),
                                this.backoff.reset(),
                                this.updateSocketIds(),
                                this.emitAll("reconnect", t);
                        });
                },
                {
                    "./on": 33,
                    "./socket": 34,
                    backo2: 36,
                    "component-bind": 37,
                    "component-emitter": 38,
                    debug: 39,
                    "engine.io-client": 1,
                    indexof: 42,
                    "socket.io-parser": 47,
                },
            ],
            33: [
                function(t, e, n) {
                    e.exports = function on(t, e, n) {
                        return (
                            t.on(e, n),
                            {
                                destroy: function() {
                                    t.removeListener(e, n);
                                },
                            }
                        );
                    };
                },
                {},
            ],
            34: [
                function(t, e, n) {
                    var r = t("socket.io-parser"),
                        o = t("component-emitter"),
                        i = t("to-array"),
                        s = t("./on"),
                        a = t("component-bind"),
                        c = t("debug")("socket.io-client:socket"),
                        p = t("has-binary");
                    e.exports = Socket;
                    var u = {
                            connect: 1,
                            connect_error: 1,
                            connect_timeout: 1,
                            connecting: 1,
                            disconnect: 1,
                            error: 1,
                            reconnect: 1,
                            reconnect_attempt: 1,
                            reconnect_failed: 1,
                            reconnect_error: 1,
                            reconnecting: 1,
                            ping: 1,
                            pong: 1,
                        },
                        f = o.prototype.emit;

                    function Socket(t, e) {
                        (this.io = t),
                            (this.nsp = e),
                            (this.json = this),
                            (this.ids = 0),
                            (this.acks = {}),
                            (this.receiveBuffer = []),
                            (this.sendBuffer = []),
                            (this.connected = !1),
                            (this.disconnected = !0),
                            this.io.autoConnect && this.open();
                    }

                    o(Socket.prototype),
                        (Socket.prototype.subEvents = function() {
                            if (!this.subs) {
                                var t = this.io;
                                this.subs = [
                                    s(t, "open", a(this, "onopen")),
                                    s(t, "packet", a(this, "onpacket")),
                                    s(t, "close", a(this, "onclose")),
                                ];
                            }
                        }),
                        (Socket.prototype.open = Socket.prototype.connect = function() {
                            return this.connected
                                ? this
                                : (this.subEvents(),
                                  this.io.open(),
                                  "open" == this.io.readyState && this.onopen(),
                                  this.emit("connecting"),
                                  this);
                        }),
                        (Socket.prototype.send = function() {
                            var t = i(arguments);
                            return t.unshift("message"), this.emit.apply(this, t), this;
                        }),
                        (Socket.prototype.emit = function(t) {
                            if (u.hasOwnProperty(t)) return f.apply(this, arguments), this;
                            var e = i(arguments),
                                n = r.EVENT;
                            p(e) && (n = r.BINARY_EVENT);
                            var o = { type: n, data: e, options: {} };
                            return (
                                (o.options.compress = !this.flags || !1 !== this.flags.compress),
                                "function" == typeof e[e.length - 1] &&
                                    (c("emitting packet with ack id %d", this.ids),
                                    (this.acks[this.ids] = e.pop()),
                                    (o.id = this.ids++)),
                                this.connected ? this.packet(o) : this.sendBuffer.push(o),
                                delete this.flags,
                                this
                            );
                        }),
                        (Socket.prototype.packet = function(t) {
                            (t.nsp = this.nsp), this.io.packet(t);
                        }),
                        (Socket.prototype.onopen = function() {
                            c("transport is open - connecting"), "/" != this.nsp && this.packet({ type: r.CONNECT });
                        }),
                        (Socket.prototype.onclose = function(t) {
                            c("close (%s)", t),
                                (this.connected = !1),
                                (this.disconnected = !0),
                                delete this.id,
                                this.emit("disconnect", t);
                        }),
                        (Socket.prototype.onpacket = function(t) {
                            if (t.nsp == this.nsp)
                                switch (t.type) {
                                    case r.CONNECT:
                                        this.onconnect();
                                        break;
                                    case r.EVENT:
                                    case r.BINARY_EVENT:
                                        this.onevent(t);
                                        break;
                                    case r.ACK:
                                    case r.BINARY_ACK:
                                        this.onack(t);
                                        break;
                                    case r.DISCONNECT:
                                        this.ondisconnect();
                                        break;
                                    case r.ERROR:
                                        this.emit("error", t.data);
                                }
                        }),
                        (Socket.prototype.onevent = function(t) {
                            var e = t.data || [];
                            c("emitting event %j", e),
                                null != t.id && (c("attaching ack callback to event"), e.push(this.ack(t.id))),
                                this.connected ? f.apply(this, e) : this.receiveBuffer.push(e);
                        }),
                        (Socket.prototype.ack = function(t) {
                            var e = this,
                                n = !1;
                            return function() {
                                if (!n) {
                                    n = !0;
                                    var o = i(arguments);
                                    c("sending ack %j", o);
                                    var s = p(o) ? r.BINARY_ACK : r.ACK;
                                    e.packet({ type: s, id: t, data: o });
                                }
                            };
                        }),
                        (Socket.prototype.onack = function(t) {
                            var e = this.acks[t.id];
                            "function" == typeof e
                                ? (c("calling ack %s with %j", t.id, t.data),
                                  e.apply(this, t.data),
                                  delete this.acks[t.id])
                                : c("bad ack %s", t.id);
                        }),
                        (Socket.prototype.onconnect = function() {
                            (this.connected = !0), (this.disconnected = !1), this.emit("connect"), this.emitBuffered();
                        }),
                        (Socket.prototype.emitBuffered = function() {
                            var t;
                            for (t = 0; t < this.receiveBuffer.length; t++) f.apply(this, this.receiveBuffer[t]);
                            for (this.receiveBuffer = [], t = 0; t < this.sendBuffer.length; t++)
                                this.packet(this.sendBuffer[t]);
                            this.sendBuffer = [];
                        }),
                        (Socket.prototype.ondisconnect = function() {
                            c("server disconnect (%s)", this.nsp), this.destroy(), this.onclose("io server disconnect");
                        }),
                        (Socket.prototype.destroy = function() {
                            if (this.subs) {
                                for (var t = 0; t < this.subs.length; t++) this.subs[t].destroy();
                                this.subs = null;
                            }
                            this.io.destroy(this);
                        }),
                        (Socket.prototype.close = Socket.prototype.disconnect = function() {
                            return (
                                this.connected &&
                                    (c("performing disconnect (%s)", this.nsp), this.packet({ type: r.DISCONNECT })),
                                this.destroy(),
                                this.connected && this.onclose("io client disconnect"),
                                this
                            );
                        }),
                        (Socket.prototype.compress = function(t) {
                            return (this.flags = this.flags || {}), (this.flags.compress = t), this;
                        });
                },
                {
                    "./on": 33,
                    "component-bind": 37,
                    "component-emitter": 38,
                    debug: 39,
                    "has-binary": 41,
                    "socket.io-parser": 47,
                    "to-array": 51,
                },
            ],
            35: [
                function(t, e, n) {
                    (function(n) {
                        var r = t("parseuri"),
                            o = t("debug")("socket.io-client:url");
                        e.exports = function url(t, e) {
                            var i = t,
                                e = e || n.location;
                            null == t && (t = e.protocol + "//" + e.host);
                            "string" == typeof t &&
                                ("/" == t.charAt(0) && (t = "/" == t.charAt(1) ? e.protocol + t : e.host + t),
                                /^(https?|wss?):\/\//.test(t) ||
                                    (o("protocol-less url %s", t),
                                    (t = void 0 !== e ? e.protocol + "//" + t : "https://" + t)),
                                o("parse %s", t),
                                (i = r(t)));
                            i.port ||
                                (/^(http|ws)$/.test(i.protocol)
                                    ? (i.port = "80")
                                    : /^(http|ws)s$/.test(i.protocol) && (i.port = "443"));
                            i.path = i.path || "/";
                            var s = -1 !== i.host.indexOf(":") ? "[" + i.host + "]" : i.host;
                            return (
                                (i.id = i.protocol + "://" + s + ":" + i.port),
                                (i.href = i.protocol + "://" + s + (e && e.port == i.port ? "" : ":" + i.port)),
                                i
                            );
                        };
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                { debug: 39, parseuri: 45 },
            ],
            36: [
                function(t, e, n) {
                    function Backoff(t) {
                        (t = t || {}),
                            (this.ms = t.min || 100),
                            (this.max = t.max || 1e4),
                            (this.factor = t.factor || 2),
                            (this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0),
                            (this.attempts = 0);
                    }

                    (e.exports = Backoff),
                        (Backoff.prototype.duration = function() {
                            var t = this.ms * Math.pow(this.factor, this.attempts++);
                            if (this.jitter) {
                                var e = Math.random(),
                                    n = Math.floor(e * this.jitter * t);
                                t = 0 == (1 & Math.floor(10 * e)) ? t - n : t + n;
                            }
                            return 0 | Math.min(t, this.max);
                        }),
                        (Backoff.prototype.reset = function() {
                            this.attempts = 0;
                        }),
                        (Backoff.prototype.setMin = function(t) {
                            this.ms = t;
                        }),
                        (Backoff.prototype.setMax = function(t) {
                            this.max = t;
                        }),
                        (Backoff.prototype.setJitter = function(t) {
                            this.jitter = t;
                        });
                },
                {},
            ],
            37: [
                function(t, e, n) {
                    var r = [].slice;
                    e.exports = function(t, e) {
                        if (("string" == typeof e && (e = t[e]), "function" != typeof e))
                            throw new Error("bind() requires a function");
                        var n = r.call(arguments, 2);
                        return function() {
                            return e.apply(t, n.concat(r.call(arguments)));
                        };
                    };
                },
                {},
            ],
            38: [
                function(t, e, n) {
                    function Emitter(t) {
                        if (t)
                            return (function mixin(t) {
                                for (var e in Emitter.prototype) t[e] = Emitter.prototype[e];
                                return t;
                            })(t);
                    }

                    (e.exports = Emitter),
                        (Emitter.prototype.on = Emitter.prototype.addEventListener = function(t, e) {
                            return (
                                (this._callbacks = this._callbacks || {}),
                                (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e),
                                this
                            );
                        }),
                        (Emitter.prototype.once = function(t, e) {
                            function on() {
                                this.off(t, on), e.apply(this, arguments);
                            }

                            return (on.fn = e), this.on(t, on), this;
                        }),
                        (Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(
                            t,
                            e
                        ) {
                            if (((this._callbacks = this._callbacks || {}), 0 == arguments.length))
                                return (this._callbacks = {}), this;
                            var n,
                                r = this._callbacks["$" + t];
                            if (!r) return this;
                            if (1 == arguments.length) return delete this._callbacks["$" + t], this;
                            for (var o = 0; o < r.length; o++)
                                if ((n = r[o]) === e || n.fn === e) {
                                    r.splice(o, 1);
                                    break;
                                }
                            return this;
                        }),
                        (Emitter.prototype.emit = function(t) {
                            this._callbacks = this._callbacks || {};
                            var e = [].slice.call(arguments, 1),
                                n = this._callbacks["$" + t];
                            if (n) for (var r = 0, o = (n = n.slice(0)).length; r < o; ++r) n[r].apply(this, e);
                            return this;
                        }),
                        (Emitter.prototype.listeners = function(t) {
                            return (this._callbacks = this._callbacks || {}), this._callbacks["$" + t] || [];
                        }),
                        (Emitter.prototype.hasListeners = function(t) {
                            return !!this.listeners(t).length;
                        });
                },
                {},
            ],
            39: [
                function(t, e, n) {
                    arguments[4][17][0].apply(n, arguments);
                },
                { "./debug": 40, dup: 17 },
            ],
            40: [
                function(t, e, n) {
                    arguments[4][18][0].apply(n, arguments);
                },
                { dup: 18, ms: 44 },
            ],
            41: [
                function(t, e, n) {
                    (function(n) {
                        var r = t("isarray");
                        e.exports = function hasBinary(t) {
                            return (function _hasBinary(t) {
                                if (!t) return !1;
                                if (
                                    (n.Buffer && n.Buffer.isBuffer && n.Buffer.isBuffer(t)) ||
                                    (n.ArrayBuffer && t instanceof ArrayBuffer) ||
                                    (n.Blob && t instanceof Blob) ||
                                    (n.File && t instanceof File)
                                )
                                    return !0;
                                if (r(t)) {
                                    for (var e = 0; e < t.length; e++) if (_hasBinary(t[e])) return !0;
                                } else if (t && "object" == typeof t)
                                    for (var o in (t.toJSON && "function" == typeof t.toJSON && (t = t.toJSON()), t))
                                        if (Object.prototype.hasOwnProperty.call(t, o) && _hasBinary(t[o])) return !0;
                                return !1;
                            })(t);
                        };
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                { isarray: 43 },
            ],
            42: [
                function(t, e, n) {
                    arguments[4][23][0].apply(n, arguments);
                },
                { dup: 23 },
            ],
            43: [
                function(t, e, n) {
                    arguments[4][24][0].apply(n, arguments);
                },
                { dup: 24 },
            ],
            44: [
                function(t, e, n) {
                    arguments[4][25][0].apply(n, arguments);
                },
                { dup: 25 },
            ],
            45: [
                function(t, e, n) {
                    arguments[4][28][0].apply(n, arguments);
                },
                { dup: 28 },
            ],
            46: [
                function(t, e, n) {
                    (function(e) {
                        var r = t("isarray"),
                            o = t("./is-buffer");
                        (n.deconstructPacket = function(t) {
                            var e = [],
                                n = t.data;
                            var i = t;
                            return (
                                (i.data = (function _deconstructPacket(t) {
                                    if (!t) return t;
                                    if (o(t)) {
                                        var n = {
                                            _placeholder: !0,
                                            num: e.length,
                                        };
                                        return e.push(t), n;
                                    }
                                    if (r(t)) {
                                        for (var i = new Array(t.length), s = 0; s < t.length; s++)
                                            i[s] = _deconstructPacket(t[s]);
                                        return i;
                                    }
                                    if ("object" == typeof t && !(t instanceof Date)) {
                                        for (var a in ((i = {}), t)) i[a] = _deconstructPacket(t[a]);
                                        return i;
                                    }
                                    return t;
                                })(n)),
                                (i.attachments = e.length),
                                { packet: i, buffers: e }
                            );
                        }),
                            (n.reconstructPacket = function(t, e) {
                                return (
                                    (t.data = (function _reconstructPacket(t) {
                                        if (t && t._placeholder) return e[t.num];
                                        if (r(t)) {
                                            for (var n = 0; n < t.length; n++) t[n] = _reconstructPacket(t[n]);
                                            return t;
                                        }
                                        if (t && "object" == typeof t) {
                                            for (var o in t) t[o] = _reconstructPacket(t[o]);
                                            return t;
                                        }
                                        return t;
                                    })(t.data)),
                                    (t.attachments = void 0),
                                    t
                                );
                            }),
                            (n.removeBlobs = function(t, n) {
                                var i = 0,
                                    s = t;
                                !(function _removeBlobs(t, a, c) {
                                    if (!t) return t;
                                    if ((e.Blob && t instanceof Blob) || (e.File && t instanceof File)) {
                                        i++;
                                        var p = new FileReader();
                                        (p.onload = function() {
                                            c ? (c[a] = this.result) : (s = this.result), --i || n(s);
                                        }),
                                            p.readAsArrayBuffer(t);
                                    } else if (r(t)) for (var u = 0; u < t.length; u++) _removeBlobs(t[u], u, t);
                                    else if (t && "object" == typeof t && !o(t))
                                        for (var f in t) _removeBlobs(t[f], f, t);
                                })(s),
                                    i || n(s);
                            });
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                { "./is-buffer": 48, isarray: 43 },
            ],
            47: [
                function(t, e, n) {
                    var r = t("debug")("socket.io-parser"),
                        o = t("json3"),
                        i = (t("isarray"), t("component-emitter")),
                        s = t("./binary"),
                        a = t("./is-buffer");

                    function Encoder() {}

                    function encodeAsString(t) {
                        var e = "",
                            i = !1;
                        return (
                            (e += t.type),
                            (n.BINARY_EVENT != t.type && n.BINARY_ACK != t.type) || ((e += t.attachments), (e += "-")),
                            t.nsp && "/" != t.nsp && ((i = !0), (e += t.nsp)),
                            null != t.id && (i && ((e += ","), (i = !1)), (e += t.id)),
                            null != t.data && (i && (e += ","), (e += o.stringify(t.data))),
                            r("encoded %j as %s", t, e),
                            e
                        );
                    }

                    function Decoder() {
                        this.reconstructor = null;
                    }

                    function BinaryReconstructor(t) {
                        (this.reconPack = t), (this.buffers = []);
                    }

                    function error(t) {
                        return { type: n.ERROR, data: "parser error" };
                    }

                    (n.protocol = 4),
                        (n.types = ["CONNECT", "DISCONNECT", "EVENT", "BINARY_EVENT", "ACK", "BINARY_ACK", "ERROR"]),
                        (n.CONNECT = 0),
                        (n.DISCONNECT = 1),
                        (n.EVENT = 2),
                        (n.ACK = 3),
                        (n.ERROR = 4),
                        (n.BINARY_EVENT = 5),
                        (n.BINARY_ACK = 6),
                        (n.Encoder = Encoder),
                        (n.Decoder = Decoder),
                        (Encoder.prototype.encode = function(t, e) {
                            (r("encoding packet %j", t), n.BINARY_EVENT == t.type || n.BINARY_ACK == t.type)
                                ? (function encodeAsBinary(t, e) {
                                      s.removeBlobs(t, function writeEncoding(t) {
                                          var n = s.deconstructPacket(t),
                                              r = encodeAsString(n.packet),
                                              o = n.buffers;
                                          o.unshift(r), e(o);
                                      });
                                  })(t, e)
                                : e([encodeAsString(t)]);
                        }),
                        i(Decoder.prototype),
                        (Decoder.prototype.add = function(t) {
                            var e;
                            if ("string" == typeof t)
                                (e = (function decodeString(t) {
                                    var e = {},
                                        i = 0;
                                    if (((e.type = Number(t.charAt(0))), null == n.types[e.type])) return error();
                                    if (n.BINARY_EVENT == e.type || n.BINARY_ACK == e.type) {
                                        for (var s = ""; "-" != t.charAt(++i) && ((s += t.charAt(i)), i != t.length); );
                                        if (s != Number(s) || "-" != t.charAt(i))
                                            throw new Error("Illegal attachments");
                                        e.attachments = Number(s);
                                    }
                                    if ("/" == t.charAt(i + 1))
                                        for (e.nsp = ""; ++i; ) {
                                            var a = t.charAt(i);
                                            if ("," == a) break;
                                            if (((e.nsp += a), i == t.length)) break;
                                        }
                                    else e.nsp = "/";
                                    var c = t.charAt(i + 1);
                                    if ("" !== c && Number(c) == c) {
                                        for (e.id = ""; ++i; ) {
                                            var a = t.charAt(i);
                                            if (null == a || Number(a) != a) {
                                                --i;
                                                break;
                                            }
                                            if (((e.id += t.charAt(i)), i == t.length)) break;
                                        }
                                        e.id = Number(e.id);
                                    }
                                    if (t.charAt(++i))
                                        try {
                                            e.data = o.parse(t.substr(i));
                                        } catch (t) {
                                            return error();
                                        }
                                    return r("decoded %s as %j", t, e), e;
                                })(t)),
                                    n.BINARY_EVENT == e.type || n.BINARY_ACK == e.type
                                        ? ((this.reconstructor = new BinaryReconstructor(e)),
                                          0 === this.reconstructor.reconPack.attachments && this.emit("decoded", e))
                                        : this.emit("decoded", e);
                            else {
                                if (!a(t) && !t.base64) throw new Error("Unknown type: " + t);
                                if (!this.reconstructor)
                                    throw new Error("got binary data when not reconstructing a packet");
                                (e = this.reconstructor.takeBinaryData(t)) &&
                                    ((this.reconstructor = null), this.emit("decoded", e));
                            }
                        }),
                        (Decoder.prototype.destroy = function() {
                            this.reconstructor && this.reconstructor.finishedReconstruction();
                        }),
                        (BinaryReconstructor.prototype.takeBinaryData = function(t) {
                            if ((this.buffers.push(t), this.buffers.length == this.reconPack.attachments)) {
                                var e = s.reconstructPacket(this.reconPack, this.buffers);
                                return this.finishedReconstruction(), e;
                            }
                            return null;
                        }),
                        (BinaryReconstructor.prototype.finishedReconstruction = function() {
                            (this.reconPack = null), (this.buffers = []);
                        });
                },
                {
                    "./binary": 46,
                    "./is-buffer": 48,
                    "component-emitter": 49,
                    debug: 39,
                    isarray: 43,
                    json3: 50,
                },
            ],
            48: [
                function(t, e, n) {
                    (function(t) {
                        e.exports = function isBuf(e) {
                            return (t.Buffer && t.Buffer.isBuffer(e)) || (t.ArrayBuffer && e instanceof ArrayBuffer);
                        };
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {},
            ],
            49: [
                function(t, e, n) {
                    arguments[4][15][0].apply(n, arguments);
                },
                { dup: 15 },
            ],
            50: [
                function(t, e, n) {
                    (function(t) {
                        (function() {
                            var r = { function: !0, object: !0 },
                                o = r[typeof n] && n && !n.nodeType && n,
                                i = (r[typeof window] && window) || this,
                                s = o && r[typeof e] && e && !e.nodeType && "object" == typeof t && t;

                            function runInContext(t, e) {
                                t || (t = i.Object()), e || (e = i.Object());
                                var n = t.Number || i.Number,
                                    o = t.String || i.String,
                                    s = t.Object || i.Object,
                                    a = t.Date || i.Date,
                                    c = t.SyntaxError || i.SyntaxError,
                                    p = t.TypeError || i.TypeError,
                                    u = t.Math || i.Math,
                                    f = t.JSON || i.JSON;
                                "object" == typeof f && f && ((e.stringify = f.stringify), (e.parse = f.parse));
                                var h,
                                    l,
                                    d,
                                    y = s.prototype,
                                    g = y.toString,
                                    m = new a(-0xc782b5b800cec);
                                try {
                                    m =
                                        -109252 == m.getUTCFullYear() &&
                                        0 === m.getUTCMonth() &&
                                        1 === m.getUTCDate() &&
                                        10 == m.getUTCHours() &&
                                        37 == m.getUTCMinutes() &&
                                        6 == m.getUTCSeconds() &&
                                        708 == m.getUTCMilliseconds();
                                } catch (t) {}

                                function has(t) {
                                    if (has[t] !== d) return has[t];
                                    var r;
                                    if ("bug-string-char-index" == t) r = "a" != "a"[0];
                                    else if ("json" == t) r = has("json-stringify") && has("json-parse");
                                    else {
                                        var i,
                                            s = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                                        if ("json-stringify" == t) {
                                            var c = e.stringify,
                                                p = "function" == typeof c && m;
                                            if (p) {
                                                (i = function() {
                                                    return 1;
                                                }).toJSON = i;
                                                try {
                                                    p =
                                                        "0" === c(0) &&
                                                        "0" === c(new n()) &&
                                                        '""' == c(new o()) &&
                                                        c(g) === d &&
                                                        c(d) === d &&
                                                        c() === d &&
                                                        "1" === c(i) &&
                                                        "[1]" == c([i]) &&
                                                        "[null]" == c([d]) &&
                                                        "null" == c(null) &&
                                                        "[null,null,null]" == c([d, g, null]) &&
                                                        c({
                                                            a: [i, !0, !1, null, "\0\b\n\f\r\t"],
                                                        }) == s &&
                                                        "1" === c(null, i) &&
                                                        "[\n 1,\n 2\n]" == c([1, 2], null, 1) &&
                                                        '"-271821-04-20T00:00:00.000Z"' == c(new a(-864e13)) &&
                                                        '"+275760-09-13T00:00:00.000Z"' == c(new a(864e13)) &&
                                                        '"-000001-01-01T00:00:00.000Z"' == c(new a(-621987552e5)) &&
                                                        '"1969-12-31T23:59:59.999Z"' == c(new a(-1));
                                                } catch (t) {
                                                    p = !1;
                                                }
                                            }
                                            r = p;
                                        }
                                        if ("json-parse" == t) {
                                            var u = e.parse;
                                            if ("function" == typeof u)
                                                try {
                                                    if (0 === u("0") && !u(!1)) {
                                                        var f = 5 == (i = u(s)).a.length && 1 === i.a[0];
                                                        if (f) {
                                                            try {
                                                                f = !u('"\t"');
                                                            } catch (t) {}
                                                            if (f)
                                                                try {
                                                                    f = 1 !== u("01");
                                                                } catch (t) {}
                                                            if (f)
                                                                try {
                                                                    f = 1 !== u("1.");
                                                                } catch (t) {}
                                                        }
                                                    }
                                                } catch (t) {
                                                    f = !1;
                                                }
                                            r = f;
                                        }
                                    }
                                    return (has[t] = !!r);
                                }

                                if (!has("json")) {
                                    var b = "[object Function]",
                                        v = "[object Number]",
                                        k = "[object String]",
                                        w = "[object Array]",
                                        S = has("bug-string-char-index");
                                    if (!m)
                                        var x = u.floor,
                                            B = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
                                            A = function(t, e) {
                                                return (
                                                    B[e] +
                                                    365 * (t - 1970) +
                                                    x((t - 1969 + (e = +(e > 1))) / 4) -
                                                    x((t - 1901 + e) / 100) +
                                                    x((t - 1601 + e) / 400)
                                                );
                                            };
                                    if (
                                        ((h = y.hasOwnProperty) ||
                                            (h = function(t) {
                                                var e,
                                                    n = {};
                                                return (
                                                    ((n.__proto__ = null),
                                                    (n.__proto__ = {
                                                        toString: 1,
                                                    }),
                                                    n).toString != g
                                                        ? (h = function(t) {
                                                              var e = this.__proto__,
                                                                  n = t in ((this.__proto__ = null), this);
                                                              return (this.__proto__ = e), n;
                                                          })
                                                        : ((e = n.constructor),
                                                          (h = function(t) {
                                                              var n = (this.constructor || e).prototype;
                                                              return t in this && !(t in n && this[t] === n[t]);
                                                          })),
                                                    (n = null),
                                                    h.call(this, t)
                                                );
                                            }),
                                        (l = function(t, e) {
                                            var n,
                                                o,
                                                i,
                                                s = 0;
                                            for (i in (((n = function() {
                                                this.valueOf = 0;
                                            }).prototype.valueOf = 0),
                                            (o = new n())))
                                                h.call(o, i) && s++;
                                            return (
                                                (n = o = null),
                                                s
                                                    ? (l =
                                                          2 == s
                                                              ? function(t, e) {
                                                                    var n,
                                                                        r = {},
                                                                        o = g.call(t) == b;
                                                                    for (n in t)
                                                                        (o && "prototype" == n) ||
                                                                            h.call(r, n) ||
                                                                            !(r[n] = 1) ||
                                                                            !h.call(t, n) ||
                                                                            e(n);
                                                                }
                                                              : function(t, e) {
                                                                    var n,
                                                                        r,
                                                                        o = g.call(t) == b;
                                                                    for (n in t)
                                                                        (o && "prototype" == n) ||
                                                                            !h.call(t, n) ||
                                                                            (r = "constructor" === n) ||
                                                                            e(n);
                                                                    (r || h.call(t, (n = "constructor"))) && e(n);
                                                                })
                                                    : ((o = [
                                                          "valueOf",
                                                          "toString",
                                                          "toLocaleString",
                                                          "propertyIsEnumerable",
                                                          "isPrototypeOf",
                                                          "hasOwnProperty",
                                                          "constructor",
                                                      ]),
                                                      (l = function(t, e) {
                                                          var n,
                                                              i,
                                                              s = g.call(t) == b,
                                                              a =
                                                                  (!s &&
                                                                      "function" != typeof t.constructor &&
                                                                      r[typeof t.hasOwnProperty] &&
                                                                      t.hasOwnProperty) ||
                                                                  h;
                                                          for (n in t) (s && "prototype" == n) || !a.call(t, n) || e(n);
                                                          for (i = o.length; (n = o[--i]); a.call(t, n) && e(n));
                                                      })),
                                                l(t, e)
                                            );
                                        }),
                                        !has("json-stringify"))
                                    ) {
                                        var C = {
                                                92: "\\\\",
                                                34: '\\"',
                                                8: "\\b",
                                                12: "\\f",
                                                10: "\\n",
                                                13: "\\r",
                                                9: "\\t",
                                            },
                                            E = function(t, e) {
                                                return ("000000" + (e || 0)).slice(-t);
                                            },
                                            P = function(t) {
                                                for (
                                                    var e = '"',
                                                        n = 0,
                                                        r = t.length,
                                                        o = !S || r > 10,
                                                        i = o && (S ? t.split("") : t);
                                                    n < r;
                                                    n++
                                                ) {
                                                    var s = t.charCodeAt(n);
                                                    switch (s) {
                                                        case 8:
                                                        case 9:
                                                        case 10:
                                                        case 12:
                                                        case 13:
                                                        case 34:
                                                        case 92:
                                                            e += C[s];
                                                            break;
                                                        default:
                                                            if (s < 32) {
                                                                e += "\\u00" + E(2, s.toString(16));
                                                                break;
                                                            }
                                                            e += o ? i[n] : t.charAt(n);
                                                    }
                                                }
                                                return e + '"';
                                            },
                                            _ = function(t, e, n, r, o, i, s) {
                                                var a, c, u, f, y, m, b, S, B, C, T, R, O, j, N, M;
                                                try {
                                                    a = e[t];
                                                } catch (t) {}
                                                if ("object" == typeof a && a)
                                                    if ("[object Date]" != (c = g.call(a)) || h.call(a, "toJSON"))
                                                        "function" == typeof a.toJSON &&
                                                            ((c != v && c != k && c != w) || h.call(a, "toJSON")) &&
                                                            (a = a.toJSON(t));
                                                    else if (a > -1 / 0 && a < 1 / 0) {
                                                        if (A) {
                                                            for (
                                                                y = x(a / 864e5), u = x(y / 365.2425) + 1970 - 1;
                                                                A(u + 1, 0) <= y;
                                                                u++
                                                            );
                                                            for (f = x((y - A(u, 0)) / 30.42); A(u, f + 1) <= y; f++);
                                                            (y = 1 + y - A(u, f)),
                                                                (b =
                                                                    x((m = ((a % 864e5) + 864e5) % 864e5) / 36e5) % 24),
                                                                (S = x(m / 6e4) % 60),
                                                                (B = x(m / 1e3) % 60),
                                                                (C = m % 1e3);
                                                        } else
                                                            (u = a.getUTCFullYear()),
                                                                (f = a.getUTCMonth()),
                                                                (y = a.getUTCDate()),
                                                                (b = a.getUTCHours()),
                                                                (S = a.getUTCMinutes()),
                                                                (B = a.getUTCSeconds()),
                                                                (C = a.getUTCMilliseconds());
                                                        a =
                                                            (u <= 0 || u >= 1e4
                                                                ? (u < 0 ? "-" : "+") + E(6, u < 0 ? -u : u)
                                                                : E(4, u)) +
                                                            "-" +
                                                            E(2, f + 1) +
                                                            "-" +
                                                            E(2, y) +
                                                            "T" +
                                                            E(2, b) +
                                                            ":" +
                                                            E(2, S) +
                                                            ":" +
                                                            E(2, B) +
                                                            "." +
                                                            E(3, C) +
                                                            "Z";
                                                    } else a = null;
                                                if ((n && (a = n.call(e, t, a)), null === a)) return "null";
                                                if ("[object Boolean]" == (c = g.call(a))) return "" + a;
                                                if (c == v) return a > -1 / 0 && a < 1 / 0 ? "" + a : "null";
                                                if (c == k) return P("" + a);
                                                if ("object" == typeof a) {
                                                    for (j = s.length; j--; ) if (s[j] === a) throw p();
                                                    if ((s.push(a), (T = []), (N = i), (i += o), c == w)) {
                                                        for (O = 0, j = a.length; O < j; O++)
                                                            (R = _(O, a, n, r, o, i, s)), T.push(R === d ? "null" : R);
                                                        M = T.length
                                                            ? o
                                                                ? "[\n" + i + T.join(",\n" + i) + "\n" + N + "]"
                                                                : "[" + T.join(",") + "]"
                                                            : "[]";
                                                    } else
                                                        l(r || a, function(t) {
                                                            var e = _(t, a, n, r, o, i, s);
                                                            e !== d && T.push(P(t) + ":" + (o ? " " : "") + e);
                                                        }),
                                                            (M = T.length
                                                                ? o
                                                                    ? "{\n" + i + T.join(",\n" + i) + "\n" + N + "}"
                                                                    : "{" + T.join(",") + "}"
                                                                : "{}");
                                                    return s.pop(), M;
                                                }
                                            };
                                        e.stringify = function(t, e, n) {
                                            var o, i, s, a;
                                            if (r[typeof e] && e)
                                                if ((a = g.call(e)) == b) i = e;
                                                else if (a == w) {
                                                    s = {};
                                                    for (
                                                        var c, p = 0, u = e.length;
                                                        p < u;
                                                        c = e[p++], ((a = g.call(c)) == k || a == v) && (s[c] = 1)
                                                    );
                                                }
                                            if (n)
                                                if ((a = g.call(n)) == v) {
                                                    if ((n -= n % 1) > 0)
                                                        for (o = "", n > 10 && (n = 10); o.length < n; o += " ");
                                                } else a == k && (o = n.length <= 10 ? n : n.slice(0, 10));
                                            return _("", (((c = {})[""] = t), c), i, s, o, "", []);
                                        };
                                    }
                                    if (!has("json-parse")) {
                                        var T,
                                            R,
                                            O = o.fromCharCode,
                                            j = {
                                                92: "\\",
                                                34: '"',
                                                47: "/",
                                                98: "\b",
                                                116: "\t",
                                                110: "\n",
                                                102: "\f",
                                                114: "\r",
                                            },
                                            N = function() {
                                                throw ((T = R = null), c());
                                            },
                                            M = function() {
                                                for (var t, e, n, r, o, i = R, s = i.length; T < s; )
                                                    switch ((o = i.charCodeAt(T))) {
                                                        case 9:
                                                        case 10:
                                                        case 13:
                                                        case 32:
                                                            T++;
                                                            break;
                                                        case 123:
                                                        case 125:
                                                        case 91:
                                                        case 93:
                                                        case 58:
                                                        case 44:
                                                            return (t = S ? i.charAt(T) : i[T]), T++, t;
                                                        case 34:
                                                            for (t = "@", T++; T < s; )
                                                                if ((o = i.charCodeAt(T)) < 32) N();
                                                                else if (92 == o)
                                                                    switch ((o = i.charCodeAt(++T))) {
                                                                        case 92:
                                                                        case 34:
                                                                        case 47:
                                                                        case 98:
                                                                        case 116:
                                                                        case 110:
                                                                        case 102:
                                                                        case 114:
                                                                            (t += j[o]), T++;
                                                                            break;
                                                                        case 117:
                                                                            for (e = ++T, n = T + 4; T < n; T++)
                                                                                ((o = i.charCodeAt(T)) >= 48 &&
                                                                                    o <= 57) ||
                                                                                    (o >= 97 && o <= 102) ||
                                                                                    (o >= 65 && o <= 70) ||
                                                                                    N();
                                                                            t += O("0x" + i.slice(e, T));
                                                                            break;
                                                                        default:
                                                                            N();
                                                                    }
                                                                else {
                                                                    if (34 == o) break;
                                                                    for (
                                                                        o = i.charCodeAt(T), e = T;
                                                                        o >= 32 && 92 != o && 34 != o;

                                                                    )
                                                                        o = i.charCodeAt(++T);
                                                                    t += i.slice(e, T);
                                                                }
                                                            if (34 == i.charCodeAt(T)) return T++, t;
                                                            N();
                                                        default:
                                                            if (
                                                                ((e = T),
                                                                45 == o && ((r = !0), (o = i.charCodeAt(++T))),
                                                                o >= 48 && o <= 57)
                                                            ) {
                                                                for (
                                                                    48 == o &&
                                                                        ((o = i.charCodeAt(T + 1)) >= 48 && o <= 57) &&
                                                                        N(),
                                                                        r = !1;
                                                                    T < s && ((o = i.charCodeAt(T)) >= 48 && o <= 57);
                                                                    T++
                                                                );
                                                                if (46 == i.charCodeAt(T)) {
                                                                    for (
                                                                        n = ++T;
                                                                        n < s &&
                                                                        ((o = i.charCodeAt(n)) >= 48 && o <= 57);
                                                                        n++
                                                                    );
                                                                    n == T && N(), (T = n);
                                                                }
                                                                if (101 == (o = i.charCodeAt(T)) || 69 == o) {
                                                                    for (
                                                                        (43 != (o = i.charCodeAt(++T)) && 45 != o) ||
                                                                            T++,
                                                                            n = T;
                                                                        n < s &&
                                                                        ((o = i.charCodeAt(n)) >= 48 && o <= 57);
                                                                        n++
                                                                    );
                                                                    n == T && N(), (T = n);
                                                                }
                                                                return +i.slice(e, T);
                                                            }
                                                            if ((r && N(), "true" == i.slice(T, T + 4)))
                                                                return (T += 4), !0;
                                                            if ("false" == i.slice(T, T + 5)) return (T += 5), !1;
                                                            if ("null" == i.slice(T, T + 4)) return (T += 4), null;
                                                            N();
                                                    }
                                                return "$";
                                            },
                                            q = function(t) {
                                                var e, n;
                                                if (("$" == t && N(), "string" == typeof t)) {
                                                    if ("@" == (S ? t.charAt(0) : t[0])) return t.slice(1);
                                                    if ("[" == t) {
                                                        for (e = []; "]" != (t = M()); n || (n = !0))
                                                            n && ("," == t ? "]" == (t = M()) && N() : N()),
                                                                "," == t && N(),
                                                                e.push(q(t));
                                                        return e;
                                                    }
                                                    if ("{" == t) {
                                                        for (e = {}; "}" != (t = M()); n || (n = !0))
                                                            n && ("," == t ? "}" == (t = M()) && N() : N()),
                                                                ("," != t &&
                                                                    "string" == typeof t &&
                                                                    "@" == (S ? t.charAt(0) : t[0]) &&
                                                                    ":" == M()) ||
                                                                    N(),
                                                                (e[t.slice(1)] = q(M()));
                                                        return e;
                                                    }
                                                    N();
                                                }
                                                return t;
                                            },
                                            D = function(t, e, n) {
                                                var r = U(t, e, n);
                                                r === d ? delete t[e] : (t[e] = r);
                                            },
                                            U = function(t, e, n) {
                                                var r,
                                                    o = t[e];
                                                if ("object" == typeof o && o)
                                                    if (g.call(o) == w) for (r = o.length; r--; ) D(o, r, n);
                                                    else
                                                        l(o, function(t) {
                                                            D(o, t, n);
                                                        });
                                                return n.call(t, e, o);
                                            };
                                        e.parse = function(t, e) {
                                            var n, r;
                                            return (
                                                (T = 0),
                                                (R = "" + t),
                                                (n = q(M())),
                                                "$" != M() && N(),
                                                (T = R = null),
                                                e && g.call(e) == b ? U((((r = {})[""] = n), r), "", e) : n
                                            );
                                        };
                                    }
                                }
                                return (e.runInContext = runInContext), e;
                            }

                            if ((!s || (s.global !== s && s.window !== s && s.self !== s) || (i = s), o))
                                runInContext(i, o);
                            else {
                                var a = i.JSON,
                                    c = i.JSON3,
                                    p = !1,
                                    u = runInContext(
                                        i,
                                        (i.JSON3 = {
                                            noConflict: function() {
                                                return p || ((p = !0), (i.JSON = a), (i.JSON3 = c), (a = c = null)), u;
                                            },
                                        })
                                    );
                                i.JSON = {
                                    parse: u.parse,
                                    stringify: u.stringify,
                                };
                            }
                        }.call(this));
                    }.call(
                        this,
                        "undefined" != typeof self
                            ? self
                            : "undefined" != typeof window
                            ? window
                            : "undefined" != typeof global
                            ? global
                            : {}
                    ));
                },
                {},
            ],
            51: [
                function(t, e, n) {
                    e.exports = function toArray(t, e) {
                        for (var n = [], r = (e = e || 0) || 0; r < t.length; r++) n[r - e] = t[r];
                        return n;
                    };
                },
                {},
            ],
        },
        {},
        [31]
    )(31);
});
var PopupTutorial = pc.createScript("popupTutorial");
(PopupTutorial.prototype.initialize = function() {
    (this.timer = 0), this.entity.setLocalScale(new pc.Vec3(0, 0, 0));
}),
    (PopupTutorial.prototype.update = function(t) {
        this.timer += t;
        var e = new pc.Vec3();
        e = this.timer >= 1.5 ? new pc.Vec3(0, 0, 0) : new pc.Vec3(5, 5, 5);
        var i = this.entity.getLocalScale();
        i.lerp(i, e, 0.2), this.entity.setLocalScale(i);
    });
